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
describe("Order Management Updating Item in order TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that updates an order
  test("should update item's quantity in an order", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number"
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
          "UPDATE order_items SET quantity=$1,item_price=$2 WHERE order_item_id=$3 "
        )
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (
        sql.startsWith("UPDATE orders SET total_price=$1 WHERE order_id=$2")
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

    const reqBody = { quantity: 5, newPrice: 12.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Item updated successfully",
      order: {
        orderNumber: "TAKE-100001",
        itemId: 1,
        quantity: 5,
        newPrice: 12.99,
        totalprice: 71.44,
      },
    });
  });

  // Test that updates an order
  test("should update item's price in an order", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number"
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
          "UPDATE order_items SET quantity=$1,item_price=$2 WHERE order_item_id=$3"
        )
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (
        sql.startsWith("UPDATE orders SET total_price=$1 WHERE order_id=$2")
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

    const reqBody = { quantity: 5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Item updated successfully",
      order: {
        orderNumber: "TAKE-100001",
        itemId: 1,
        quantity: 5,
        newPrice: 11.99,
        totalprice: 66.44,
      },
    });
  });

  // Test that tries to update an order but fails due to order number not found
  test("should try to update an order but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number"
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

    const reqBody = { quantity: 5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-999999/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number TAKE-999999 not found",
    });
  });

  // Test that tries to update an order but fails due to database error
  test("should try to update an order but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number"
        )
      ) {
 return Promise.reject(new Error("Server Error"));      }

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

    const reqBody = { quantity: 5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "Server Error",
    });
  });

  // Test that tries to update an order but fails due to item not found
  test("should try to update an order but fails due to item not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,total_price FROM orders WHERE order_number"
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

    const reqBody = { quantity: 5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/999")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Item with ID 999 not found in order",
    });
  });

  // Test that tries to update an order but fails due invalid order number
  test("should try to update an order but fails due to invalid order number", async () => {
    const reqBody = { quantity: 5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAK-100001/items/999")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Order Number",
    });
  });

  // Test that tries to update an order but fails due invalid quantity
  test("should try to update an order but fails due to invalid quantity", async () => {
    const reqBody = { quantity: -5, newPrice: 11.99 };
    const response = await request(app)
      .put("/api/orders/TAKE-999999/items/1")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Quantity should be greater than 0",
    });
  });

  // Test that tries to update an order but fails due missing required details
  test("should try to update an order but fails due missing required details", async () => {
    const reqBody = {};
    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/999")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Missing required details: itemId, quantity, newPrice",
    });
  });
});
