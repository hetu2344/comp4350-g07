describe('Table Management', () => {

    beforeEach(() => {
        //Visit the frontend on port 8017
        cy.visit('http://localhost:8017/log-in');

        //Log in with valid credentials
        cy.get('input#userId').type('owner_john');
        cy.get('input#password').type('password123');
        cy.get('button').contains('LOG IN').click();
        cy.wait(1000);
    });

    it('displays the table management page with a grid of tables', () => {
        // Check that the page contains a heading and at least one table card.
        cy.visit('http://localhost:8017/TableManagement');
        cy.contains('Table Management').should('be.visible');
        cy.get('.table-grid .table-card').should('have.length.greaterThan', 0);
      });
    
      it('opens a reservation modal when a table is clicked and allows searching reservations by customer', () => {
        // Click the first table card to open the reservation modal
        cy.visit('http://localhost:8017/TableManagement');
        cy.get('.table-grid .table-card').first().click();
    
        // The modal should appear
        cy.get('.modal').should('be.visible');
    
        // Verify that the modal shows "Make a Reservation" if there are no existing reservations
        cy.get('.modal').within(() => {
        cy.contains('Make a New Reservation').should('exist');
    });
    
        // Close the modal
        cy.get('.modal button.close-button').click();
        cy.get('.modal').should('not.exist');

        // Now fill in the customer search form
        cy.get('input[placeholder="Customer Name"]').clear().type('Test Customer');
        cy.get('button.action-button').contains('Search').click();
  
        // If reservations are found, they should appear in a table.
        cy.get('.reservation-table').then(($table) => {
          if ($table.length) {
            cy.get('.reservation-table tbody tr').should('have.length.greaterThan', 0);
          } else {
            // Otherwise, check that an appropriate "no reservations found" message is shown.
            cy.contains('No reservations found').should('exist');
          }
        });
      });
    
      it('allows searching for reservations by table number', () => {
        // On the Table Management page, find the search by table number form.
        cy.visit('http://localhost:8017/TableManagement');
        cy.get('.reservation-list-container').contains('Search by Table Number').should('be.visible');
    
        // Type a valid table number into the input and click the search button.
        cy.get('input[placeholder="Table Number"]').clear().type('1');
        cy.get('button.action-button').contains('Search').click();
    
        // Verify that reservations for that table are displayed in a table.
        cy.get('.reservation-list-container .reservation-table')
          .should('exist')
          .within(() => {
            cy.get('tbody tr').should('have.length.greaterThan', 0);
          });
    
        // Clear the search and check that the search input is empty.
        cy.get('button.cancel-button').contains('Clear').click();
        cy.get('input[placeholder="Table Number"]').should('have.value', '1');
      });
    
      it('shows an error if customer search is attempted with an empty input', () => {
        cy.visit('http://localhost:8017/TableManagement');
        cy.get('.reservation-list-container').contains('Search Reservations by Customer').should('be.visible');
    
        cy.get('input[placeholder="Customer Name"]').clear();
        cy.get('button.action-button').contains('Search').click();
    
        cy.get('.error-message').should('contain', 'Please enter a customer name to search');
      });
    
      it('shows an error if table number search is attempted with an empty input', () => {
        cy.visit('http://localhost:8017/TableManagement');
        cy.get('input[placeholder="Table Number"]').clear();
        cy.get('button.action-button').eq(1).click();
    
        cy.get('.error-message').should('contain', 'Please enter a table number to search');
      });

      it('allows a user to make a reservation and shows the reservation on the table card', () => {
        
        cy.visit('http://localhost:8017/TableManagement');

        cy.intercept('POST', '/api/tables/reservation', {
            statusCode: 200,
            body: {
              message: "Reservation successfully added!",
              reservation: {
                reservation_id: 123,
                table_num: 1,
                customer_name: "Cypress User",
                reservation_time: new Date().toISOString(), 
                party_size: 2,
              },
            },
          }).as('addReservation');

          cy.intercept('GET', '/api/tables', {
            statusCode: 200,
            body: [
              {
                table_num: 1,
                num_seats: 2,
                table_status: false, 
                reservations: [
                  {
                    reservation_id: 123,
                    customer_name: "Cypress User",
                    reservation_time: new Date().toISOString(),
                    party_size: 2,
                  },
                ],
              },
              
{table_num: 2, num_seats: 2, table_status: true, reservations: []},
{table_num: 3, num_seats: 2, table_status: true, reservations: []},
{table_num: 4, num_seats: 2, table_status: true, reservations: []},
{table_num: 5, num_seats: 4, table_status: true, reservations: []},
{table_num: 6, num_seats: 4, table_status: true, reservations: []},
{table_num: 7, num_seats: 4, table_status: true, reservations: []},
{table_num: 8, num_seats: 4, table_status: true, reservations: []},
{table_num: 9, num_seats: 8, table_status: true, reservations: []},
{table_num: 10, num_seats: 8, table_status: true, reservations: []}
            ],
          }).as('getTables');


        // Click on the first table card to open the reservation modal.
        cy.get('.table-card').first().click();
    
     
        cy.get('.modal').should('be.visible');
    
       
        cy.get('.modal-content').within(() => {
          cy.get('input[placeholder="Name"]').type('Cypress User');
          cy.get('input[placeholder="Party Size"]').clear().type('2');
          
          // Set a reservation time 2 hours from now.
          const now = new Date();
          const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
          const pad = (n) => String(n).padStart(2, "0");
          const isoLocal = `${future.getFullYear()}-${pad(future.getMonth()+1)}-${pad(future.getDate())}T${pad(future.getHours())}:${pad(future.getMinutes())}`;
          cy.get('input[type="datetime-local"]').clear().type(isoLocal);
    
          cy.get('button.action-button').contains('Reserve').click();
          cy.wait('@addReservation');
        });

        cy.wait('@getTables');
         
        cy.wait(1000);

   
        cy.get('.modal').should('not.exist');
    
        cy.get('.reservation-list-container .reservation-table').within(() => {
            cy.contains('Cypress User').should('be.visible');
          });
    });
});