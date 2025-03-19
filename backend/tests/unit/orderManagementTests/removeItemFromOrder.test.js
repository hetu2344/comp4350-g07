const request = require("supertest");
const app = require("../../../index");
const pool = require("../../../db/db");

// Creating a mock database connection
jest.mock("../../../db/db", () => {
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  return {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(mockClient),
    end: jest.fn().mockResolvedValue(),
    __mockClient: mockClient,
  };
});

// Setting things to do after each test
describe("Order Management Removing Item from order TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that removes item from an order
  test("should remove item in an order", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number=$1"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              total_price: 32.47,
            },
          ],
        });
      }

      if (
        sql.includes(
          "SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_item_id: 1,
              quantity: 2,
              item_price: 12.99,
            },
          ],
        });
      }

      if (
        sql.startsWith(
          "DELETE FROM order_items WHERE order_item_id=$1 AND order_id=$2"
        )
      ) {
        return Promise.resolve();
      }
      if (sql.startsWith("SELECT * FROM order_items WHERE order_id=$1")) {
        return Promise.resolve({
          rows: [
            {
              order_item_id: 2,
              order_id: 1,
              menu_item_id: 3,
              quantity: 1,
              item_price: 6.49,
              created_by: "employee_emma",
              created_at: "2025-03-18 23:23:50.339036",
            },
          ],
        });
      }

      if (
        sql.startsWith("UPDATE orders SET total_price = $1 WHERE order_id = $2")
      ) {
        return Promise.resolve();
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }
    });

    const reqBody = { removedBy: "employee_emma" };
    const response = await request(app)
      .delete("/api/orders/TAKE-100001/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Item removed successfully",
      order: {
        orderNumber: "TAKE-100001",
        itemId: 1,
        totalprice: 6.489999999999998,
      },
    });
  });

  // Test that tries removes item from an order but fails due to order number not found
  test("should remove item in an order but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number=$1"
        )
      ) {
        return Promise.resolve({
          rows: [],
        });
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }
    });

    const reqBody = { removedBy: "employee_emma" };
    const response = await request(app)
      .delete("/api/orders/TAKE-999999/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number TAKE-999999 not found",
    });
  });

  // Test that tries removes item from an order but fails due to item not found
  test("should remove item in an order but fails due to item not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number=$1"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              total_price: 32.47,
            },
          ],
        });
      }

      if (
        sql.includes(
          "SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2"
        )
      ) {
        return Promise.resolve({
          rows: [],
        });
      }
      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }
    });

    const reqBody = { removedBy: "employee_emma" };
    const response = await request(app)
      .delete("/api/orders/TAKE-100001/items/999")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Item with ID 999 not found in order",
    });
  });


    test("should remove item in an order but fails due to Server Error", async () => {
      pool.__mockClient.query.mockImplementation((sql, params) => {
        if (
          sql.includes(
            "SELECT order_id,total_price FROM orders WHERE order_number=$1"
          )
        ) {
          return Promise.reject(new Error("Server Error"));
        }

        if (sql.startsWith("BEGIN")) {
          return Promise.resolve();
        }
        if (sql.startsWith("COMMIT")) {
          return Promise.resolve();
        }

        if (sql.startsWith("ROLLBACK")) {
          return Promise.resolve();
        }
      });

      const reqBody = { removedBy: "employee_emma" };
      const response = await request(app)
        .delete("/api/orders/TAKE-100001/items/1")
        .send(reqBody);
      console.log(response);
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({
        error: "Server Error",
      });
    });


     test("should remove item in an order but fails due invalid order number", async () => {
      
       const reqBody = { removedBy: "employee_emma" };
       const response = await request(app)
         .delete("/api/orders/TAK-10000/items/1")
         .send(reqBody);
       console.log(response);
       expect(response.statusCode).toBe(400);
       expect(response.body).toEqual({
         error: "Invalid Order Number",
       });
     });



     
     test("should remove item in an order but fails due missing details", async () => {
       const reqBody = {};
       const response = await request(app)
         .delete("/api/orders/TAKE-100001/items/1")
         .send(reqBody);
       console.log(response);
       expect(response.statusCode).toBe(400);
       expect(response.body).toEqual({
         error: "Missing required details: itemId, removedBy",
       });
     });



    

});
