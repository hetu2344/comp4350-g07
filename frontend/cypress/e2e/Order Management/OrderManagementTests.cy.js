describe('Creating an order', () => {
   
    beforeEach(() => {
          //Visit the frontend on port 8017
          cy.visit('http://localhost:8017/log-in');

          //Log in with valid credentials
          cy.get('input#userId').type('owner_john');
          cy.get('input#password').type('password123');
          cy.get('button').contains('LOG IN').click();
          cy.wait(1000);
      });
   
   
    it('Create a new order successfully and check if it appears in the active orders', () => {
        cy.intercept('POST', `http://localhost:8018/api/orders`).as('createOrder');

        cy.visit('http://localhost:8017/add-order');
        cy.get('select[name="orderType"]').select('Dine-In');
        cy.get('input[name="tableNum"]').type('1');
        cy.get('input[name="customerName"]').type('John Doe');
        cy.get('textarea[name="specialInstructions"]').type('No onions, please.');
        
        //Select menu items
        cy.get('input[type="checkbox"]').first().check();
        cy.get('input[type="number"]').first().clear().type('2');
        
        //Submit the order
        cy.get('button[type="submit"]').click();

        //Verify API response
        cy.wait('@createOrder').then((interception) => {
            expect(interception.response.statusCode).to.eq(201);
        });
        
        //Verify success message and order in active list
        cy.contains('Order created successfully!').should('be.visible');
        cy.visit('http://localhost:8017/active-orders');
        cy.wait(4000);
        cy.contains('owner_john').should('be.visible');

        cy.visit('http://localhost:8017/dashboard');
      });

    it('Displays error message when order creation fails', () => {
        cy.intercept('POST', `http://localhost:8018/api/orders`, {
          statusCode: 500,
          body: { error: 'Internal Server Error' }
        }).as('createOrderFail');
    
        cy.visit('http://localhost:8017/add-order');
        cy.get('select[name="orderType"]').select('Dine-In');
        cy.get('input[name="tableNum"]').type('15');
        cy.get('input[name="customerName"]').type('Failed Order');
        cy.get('textarea[name="specialInstructions"]').type('Test error case.');
    
        //Select menu items
        cy.get('input[type="checkbox"]').first().check();
        cy.get('input[type="number"]').first().clear().type('1');
    
        //Submit the order
        cy.get('button[type="submit"]').click();
    
        // Validate server error response
        cy.wait('@createOrderFail').then((interception) => {
          expect(interception.response.statusCode).to.eq(500);
        });
         // Verify UI shows the error message
        cy.contains('Failed to create order. Try again.').should('be.visible');
    });

    it('Display Current Orders successfully', () => {
        cy.visit('http://localhost:8017/active-orders');
        cy.wait(4000);
          
        cy.contains('📦 Active Orders').should('be.visible');

        cy.wait(1000);
        cy.visit('http://localhost:8017/dashboard');
    });

    it('Edit an existing order successfully', () => {
        cy.intercept('PUT', `http://localhost:8018/api/orders/*`).as('updateOrder');
    
        cy.visit('http://localhost:8017/active-orders');
        cy.wait(4000);

        cy.get('.card').first().within(() => {
          cy.contains('✏️ Edit Order').click();
        });
    
        //Modify customer name and instructions
        cy.get('textarea[name="specialInstructions"]').clear().type('Extra spicy.');
    
        //Change item quantity
        cy.get('input[type="number"]').first().clear().type('3');
    
        // Submit the changes
        cy.get('button[type="submit"]').click();
    
        //Validate the API response
        cy.wait('@updateOrder').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
        });

    });
        
    it('Display completed orders in order history', () => {    
        cy.visit('http://localhost:8017/order-history');
        cy.wait(4000);
    
        cy.get('.card').should('have.length.at.least', 1);
    
        cy.contains('📦 Order History').should('be.visible');

        cy.get('.card').first().within(() => {
          cy.contains('$').should('be.visible');
          cy.contains('GST').should('be.visible');
          cy.contains('PST').should('be.visible');
          cy.contains('Total').should('be.visible');
        });

        cy.wait(1000);
        cy.visit('http://localhost:8017/dashboard');
      });

});