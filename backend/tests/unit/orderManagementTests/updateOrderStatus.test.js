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
describe("Order Management Updating order status TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that updates an order
  test("should update order by order number for takeout", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,order_status FROM orders WHERE order_number"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              order_status: "Active",
            },
          ],
        });
      }

      if (sql.includes("UPDATE orders SET order_status=")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              order_number: "TAKE-100001",
              store_id: 1,
              order_type: "Take-Out",
              table_num: null,
              customer_name: "Sarah Smith",
              order_status: "Completed",
              order_time: "2025-03-18T21:23:54.690Z",
              special_instructions: "Light Cheese",
              total_price: 32.47,
              created_by: "employee_david",
            },
          ],
        });
      }

      if (
        sql.startsWith(
          "INSERT INTO order_status_history(order_id,status,changed_by) VALUES"
        )
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

    const reqBody = {
      updatedStatus: "Completed",
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Order Status updated successfully",
      order: {
        order_id: 1,
        order_number: "TAKE-100001",
        store_id: 1,
        order_type: "Take-Out",
        table_num: null,
        customer_name: "Sarah Smith",
        order_status: "Completed",
        order_time: "2025-03-18T21:23:54.690Z",
        special_instructions: "Light Cheese",
        total_price: 32.47,
        created_by: "employee_david",
      },
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,order_status FROM orders WHERE order_number"
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

    const reqBody = {
      updatedStatus: "Completed",
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-999999/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number TAKE-999999 not found",
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to same order status", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT order_id,order_status FROM orders WHERE order_number"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              order_number: "TAKE-100001",
              store_id: 1,
              order_type: "Take-Out",
              table_num: null,
              customer_name: "Sarah Smith",
              order_status: "Active",
              order_time: "2025-03-18T21:23:54.690Z",
              special_instructions: "Light Cheese",
              total_price: 32.47,
              created_by: "employee_david",
            },
          ],
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

    const reqBody = {
      updatedStatus: "Active",
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "Order is already in Active status",
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to invalid order number", async () => {
    const reqBody = {
      updatedStatus: "Active",
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAK-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid order number format",
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to no status given", async () => {
    const reqBody = {
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Status is required",
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to invalid status given", async () => {
    const reqBody = {
      updatedStatus: "Payed",
      changedBy: "employee_emma",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Status",
    });
  });

  // Test that tries to update order status but fails due to order number not found
  test("should try to update order status but fails due to no Changed By given", async () => {
    const reqBody = {
        updatedStatus: "Completed",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Changed By is required",
    });
  });
});
