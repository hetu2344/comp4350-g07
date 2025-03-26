describe('User Login', () => {
  it('should successfully log in with valid credentials', () => {
    cy.visit('http://localhost:8017/log-in');

    //Wait for the API response
    cy.intercept('POST', 'http://localhost:8018/api/user/login').as('loginRequest');

    //Fill out the login form
    cy.get('input#userId').type('owner_john');      // Match username field ID
    cy.get('input#password').type('password123');      // Match password field ID

    //Click the "LOG IN" button
    cy.get('button').contains('LOG IN').click();

    //Check if the request was successful
    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    //Verify navigation to the dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should display an error message for invalid credentials', () => {
    cy.visit('http://localhost:8017/log-in');

    // Wait for the API response
    cy.intercept('POST', 'http://localhost:8018/api/user/login').as('loginRequest');

    // Enter invalid login details
    cy.get('input#userId').type('wronguser');
    cy.get('input#password').type('wrongpassword');

    // Click the "LOG IN" button
    cy.get('button').contains('LOG IN').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.response.statusCode).to.eq(404);
    });

    // Check for error message display
    cy.contains('User with username \'wronguser\' does not exist').should('be.visible');
  });

  it('should handle server error gracefully', () => {
    cy.visit('http://localhost:8017/log-in');

    // Enter valid login details
    cy.get('input#userId').type('owner_john');
    cy.get('input#password').type('password123');

    // Simulate server error
    cy.intercept('POST', 'http://localhost:8018/api/user/login', {
      statusCode: 500,
      body: { error: 'Internal Server Error. Please try again later.' }
    }).as('serverError');

    cy.get('button').contains('LOG IN').click();

    cy.wait('@serverError');

    // Verify error message is displayed
    cy.contains('Internal Server Error. Please try again later.').should('be.visible');
  });
});
