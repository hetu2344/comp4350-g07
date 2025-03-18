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
describe("Order Management Adding Item to order TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that updates an order
  test("should insert new item in an order", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id, total_price FROM orders WHERE order_number"
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

      if (sql.includes("SELECT item_id,price FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [
            {
              item_id: 2,
              price: 11.99,
            },
          ],
        });
      }

      if (
        sql.startsWith(
          "SELECT order_item_id, quantity FROM order_items WHERE order_id "
        )
      ) {
        return Promise.resolve({ rows: [] });
      }
      if (
        sql.startsWith(
          "INSERT INTO order_items(order_id,menu_item_id,quantity,item_price,created_by) VALUES"
        )
      ) {
        return Promise.resolve();
      }

      if (sql.startsWith("UPDATE orders SET total_price=")) {
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

    const reqBody = { menuItemId: 2, quantity: 5, createdBy: "employee_emma" };
    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Item added successfully",
      order: {
        orderNumber: "TAKE-100001",
        menuItemId: 2,
        quantity: 5,
        totalprice: 92.42,
      },
    });
  });

  // Test that updates an order
  test("should insert existing item in an order", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id, total_price FROM orders WHERE order_number"
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

      if (sql.includes("SELECT item_id,price FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [
            {
              item_id: 1,
              price: 12.99,
            },
          ],
        });
      }

      if (
        sql.startsWith(
          "SELECT order_item_id, quantity FROM order_items WHERE order_id "
        )
      ) {
        return Promise.resolve({ rows: [{ order_item_id: 1, quantity: 2 }] });
      }
      if (
        sql.startsWith(
          "UPDATE order_items SET quantity = $1 WHERE order_item_id = $2"
        )
      ) {
        return Promise.resolve();
      }

      if (sql.startsWith("UPDATE orders SET total_price=")) {
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

    const reqBody = { menuItemId: 1, quantity: 5, createdBy: "employee_emma" };
    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      message: "Item added successfully",
      order: {
        orderNumber: "TAKE-100001",
        menuItemId: 1,
        quantity: 5,
        totalprice: 97.42,
      },
    });
  });

  // Test that tries to add item to order but fails due to order number not found
  test("should try to add item to order but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id, total_price FROM orders WHERE order_number"
        )
      ) {
        return Promise.resolve({ rows: [] });
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

    const reqBody = { menuItemId: 1, quantity: 5, createdBy: "employee_emma" };

    const response = await request(app)
      .post("/api/orders/TAKE-999999/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number TAKE-999999 not found",
    });
  });

  // Test that tries to add item to order but fails due to menu item not found
  test("should try to add item to order but fails due to menu item not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id, total_price FROM orders WHERE order_number"
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

      if (sql.includes("SELECT item_id,price FROM menu_items WHERE item_id")) {
        return Promise.resolve({ rows: [] });
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

    const reqBody = {
      menuItemId: 999,
      quantity: 5,
      createdBy: "employee_emma",
    };

    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Menu item with ID 999 not found",
    });
  });

  // Test that tries to add item to order but fails due to invalid order number
  test("should try to add item to order but fails due to invalid order number.", async () => {
    const reqBody = {
      menuItemId: 1,
      quantity: 5,
      createdBy: "employee_emma",
    };

    const response = await request(app)
      .post("/api/orders/TAK-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid order number format",
    });
  });

  // Test that tries to add item to order but fails due invalid quantity
  test("should try to add item to order but fails due to invalid quantity", async () => {
    const reqBody = {
      menuItemId: 1,
      quantity: -5,
      createdBy: "employee_emma",
    };

    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Quantity should be greater than 0",
    });
  });

  // Test that tries to add item to order but fails due abscence of menuItemId
  test("should try to add item to order but fails due to abscence of menuItemId", async () => {
    const reqBody = {
      quantity: 5,
      createdBy: "employee_emma",
    };

    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Missing required details: menu_item_id, quantity, createdBy",
    });
  });
});
