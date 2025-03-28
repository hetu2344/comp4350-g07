describe('Menu Management Page', () => {
    beforeEach(() => {
      // Visit the login page on port 8017
      cy.visit('http://localhost:8017/log-in');
  
      // Log in with valid credentials
      cy.get('input#userId').type('owner_john');
      cy.get('input#password').type('password123');
      cy.get('button').contains('LOG IN').click();
      cy.wait(1000);
  
      // Navigate to the Menu Management page
      cy.visit('http://localhost:8017/menu-management');
    });
  
    it('displays the menu management page with menu items', () => {
      // Verify the page title is visible.
      cy.contains('📜 Menu Management').should('be.visible');
      cy.wait(2000);
      // Check that there is at least one menu card displayed.
      cy.get('[class*="menuList"]').find('[class*="menuCard"]').should('have.length.greaterThan', 0);
    });
  
    it('navigates to the add menu item page when "Add item" is clicked', () => {
      // Click the "Add item" button.
      cy.get('button').contains('Add item').click();
      // Verify that the URL includes the add-menu-item route.
      cy.url().should('include', '/add-menu-item');
    });
  
    it('navigates to the edit menu item page when an Edit button is clicked', () => {
      // Click the Edit button on the first menu card.
      cy.get('[class*="menuCard"]').first().within(() => {
        cy.get('button').contains('✏️ Edit').click();
      });
      // Verify that the URL now includes "/edit-menu-item/".
      cy.url().should('include', '/edit-menu-item/');
    });
  
    it('deletes a menu item when Delete is confirmed and updates the list', () => {
      // Stub the confirmation dialog to always return true (confirm deletion).
      cy.on('window:confirm', () => true);
  
      // Capture the number of menu items before deletion.
      cy.get('[class*="menuList"] [class*="menuCard"]').then(($cards) => {
        const initialCount = $cards.length;
        // Click the Delete button on the first menu card.
        cy.get('[class*="menuCard"]').first().within(() => {
          cy.get('button').contains('🗑️ Delete').click();
        });
        // Verify that the number of menu items decreases by one.
        cy.get('[class*="menuList"] [class*="menuCard"]').should('have.length', initialCount - 1);
      });
    });
  });
  