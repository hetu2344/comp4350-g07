describe('Sales Analysis Page', () => {
    beforeEach(() => {
        // Visit the login page on port 8017
        cy.visit('http://localhost:8017/log-in');
    
        // Log in with valid credentials
        cy.get('input#userId').type('owner_john');
        cy.get('input#password').type('password123');
        cy.get('button').contains('LOG IN').click();
        cy.wait(1000);

        cy.intercept("GET", "/api/sales/totalRevenue*", {
            statusCode: 200,
            body: {
              startDate: "2025-03-17",
              endDate: "2025-03-20",
              revenueDetails: {
                byStatus: [
                  { order_status: "Completed", total_orders: 80, total_revenue: 4000 },
                  { order_status: "Pending", total_orders: 20, total_revenue: 1000 },
                ],
                total: { total_orders: 100, total_revenue: 5000 },
              },
            },
        }).as("getTotalRevenue");
      
          cy.intercept("GET", "/api/sales/weeklySales*", {
            statusCode: 200,
            body: {
              weeklySalesData: {
                dailySales: [
                  { day_name: "Monday", date: "2025-03-03", daily_revenue: 700 },
                  { day_name: "Tuesday", date: "2025-03-04", daily_revenue: 800 },
                ],
                weeklyTotal: 5000,
              },
            },
          }).as("getWeeklySales");
    
        // Navigate to the Sales Analysis page
        cy.visit('http://localhost:8017/sales-analysis');
    });

    it("displays the Sales Analysis page with revenue data", () => {
        cy.wait("@getTotalRevenue"); 
        cy.wait("@getWeeklySales");
    
        cy.contains("Sales Analysis").should("be.visible");
    
        cy.contains("Revenue Overview").should("be.visible");
        cy.contains("$433.11").should("be.visible");
    
        cy.get('[class*="chartContainer"]').should("exist");
      });
    
      it("updates data when selecting a date range", () => {
        const today = new Date().toISOString().split("T")[0];
    
        cy.get('input[id="startDate"]').clear().type(today);
        cy.get('input[id="endDate"]').clear().type(today);
        cy.get("button").contains("Apply").click();
    
        cy.wait("@getTotalRevenue");
        cy.contains(`Data for ${today} to ${today}`).should("be.visible");
      });
});