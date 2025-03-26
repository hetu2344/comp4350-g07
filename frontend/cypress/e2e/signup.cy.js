describe('Create Staff Account tests', () => {

    beforeEach(() => {
        //Visit the frontend on port 8017
        cy.visit('http://localhost:8017/log-in');

        //Log in with valid credentials
        cy.get('input#userId').type('owner_john');
        cy.get('input#password').type('password123');
        cy.get('button').contains('LOG IN').click();
      
      //Click the "Create Staff Account" button
        cy.contains('Create Staff Account').click();
  
      //Assert that the URL is now the sign-up page
        cy.url().should('include', '/sign-up');
      });
    
  
    it('should fill out the sign-up form and submit successfully', () => {
        const randomSuffix = Math.floor(Math.random() * 1000);
        const uniqueUserId = 'user_' + randomSuffix;

        cy.intercept('POST', 'http://localhost:8018/api/user/signup').as('signUpRequest');

      //Fill out the form
        cy.get('input#fname').type('John');
        cy.get('input#lname').type('Doe');
        cy.get('input#userID').type(uniqueUserId);
        cy.get('input#password').type('password123');
        cy.get('select#role').select('S'); // Select Store Owner role
  
      //Submit the form
        cy.get('button').contains('SIGN UP').click();
  
      //Wait for the API request to be intercepted
        cy.wait('@signUpRequest').its('response.statusCode').should('eq', 201);
  
      //Check if the user is redirected to the dashboard page
        cy.url().should('include', '/dashboard');
    });
  
    it('should show an error if the sign-up fails', () => {
        
     //Wait for the API request to be intercepted
        cy.intercept('POST', 'http://localhost:8018/api/user/signup').as('signUpRequest');
  
      //Fill out the form with invalid data
        cy.get('input#fname').type('Owner');
        cy.get('input#lname').type('John');
        cy.get('input#userID').type('owner_john'); // Use an existing username
        cy.get('input#password').type('password123');
        cy.get('select#role').select('S');
  
      //Submit the form
        cy.get('button').contains('SIGN UP').click();

        cy.wait('@signUpRequest').its('response.statusCode').should('eq', 409); // Conflict error for existing user
  
      //Verify the error message is displayed
        cy.contains('User with username \'owner_john\' already exists.');
    });
  });