describe('Log Out', () => {
    beforeEach(() => {
      //Visit the frontend on port 8017
      cy.visit('http://localhost:8017/log-in');
  
      //Log in with valid credentials
      cy.get('input#userId').type('owner_john');
      cy.get('input#password').type('password123');
      cy.get('button').contains('LOG IN').click();
    });
  
    it('first log in and then successfully log out', () => {
      //Verify that the user is logged in and redirected to the dashboard
        cy.url().should('include', '/dashboard');
      
      //Click on the log-out button
        cy.get('button').contains('Log Out').click();  
      
      //Verify that the login button is visible on the home page
        cy.get('a').contains('Log In').should('be.visible');
    });
  
    it('should redirect to login page from home page after logging out when trying to access dashboard illegaly', () => {
      //Log out
        cy.get('button').contains('Log Out').click(); 
    
      //Try to visit the dashboard directly after logging out
        cy.visit('http://localhost:8017/dashboard');
      

      //Verify that the user is redirected to the login page
        cy.url().should('include', '/log-in');
    
    });
  });