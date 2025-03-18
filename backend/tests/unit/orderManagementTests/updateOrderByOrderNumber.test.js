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
describe("Order Management Updateing order TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that updates an order
  test("should update order by order number for takeout", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM orders WHERE order_number")) {
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
              order_time: "2025-03-18 19:57:11.577219",
              special_instructions: "Light Cheese",
              item_total: 32.47,
              created_by: "employee_david",
            },
          ],
        });
      }

      if (sql.includes("UPDATE orders SET")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              order_number: "TAKE-100001",
              store_id: 1,
              order_type: "Take-Out",
              table_number: null,
              customer_name: "Sarah S.",
              order_status: "Active",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: "Light Cheese and no onions",
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
      table_num: null,
      customer_name: "Sarah S.",
      specialInstructions: "Light Cheese and no onions",
    };
    const response = await request(app)
      .put("/api/orders/TAKE-100001")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Order updated successfully",
      order: {
        order_id: 1,
        order_number: "TAKE-100001",
        store_id: 1,
        order_type: "Take-Out",
        table_number: null,
        customer_name: "Sarah S.",
        order_status: "Active",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: "Light Cheese and no onions",
        total_price: 32.47,
        created_by: "employee_david",
      },
    });
  });

  test("should update order by order number for dine in", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM orders WHERE order_number")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 4,
              order_number: "DINE-100004",
              store_id: 1,
              order_type: "Dine-In",
              table_num: 1,
              customer_name: null,
              order_status: "Active",
              order_time: "2025-03-18T20:41:49.145Z",
              special_instructions: "No Cheese in Vegan Bowl",
              item_total: 18.48,
              created_by: "employee_emma",
            },
          ],
        });
      }

      if (sql.includes("UPDATE orders SET")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 4,
              order_number: "DINE-100004",
              store_id: 1,
              order_type: "Dine-In",
              table_num: 4,
              customer_name: null,
              order_status: "Active",
              order_time: "2025-03-18T20:41:49.145Z",
              special_instructions: "No Cheese in Vegan Bowl and no onions",
              total_price: 18.48,
              created_by: "employee_emma",
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
      table_num: 4,
      customer_name: null,
      specialInstructions: "No Cheese in Vegan Bowl and no onions",
    };
    const response = await request(app)
      .put("/api/orders/DINE-100004")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Order updated successfully",
      order: {
        order_id: 4,
        order_number: "DINE-100004",
        store_id: 1,
        order_type: "Dine-In",
        table_num: 4,
        customer_name: null,
        order_status: "Active",
        order_time: "2025-03-18T20:41:49.145Z",
        special_instructions: "No Cheese in Vegan Bowl and no onions",
        total_price: 18.48,
        created_by: "employee_emma",
      },
    });
  });

//   404 error
  test("should update order by order number but fails due to order number not found", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM orders WHERE order_number")) {
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
      table_num: 4,
      customer_name: null,
      specialInstructions: "No Cheese in Vegan Bowl and no onions",
    };
    const response = await request(app)
      .put("/api/orders/DINE-999999")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number DINE-999999 not found",
    });
  });


  test("should update order by order number for dine in but fails due to no details getting updated", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM orders WHERE order_number")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 4,
              order_number: "DINE-100004",
              store_id: 1,
              order_type: "Dine-In",
              table_num: 1,
              customer_name: null,
              order_status: "Active",
              order_time: "2025-03-18T20:41:49.145Z",
              special_instructions: "No Cheese in Vegan Bowl",
              item_total: 18.48,
              created_by: "employee_emma",
            },
          ],
        });
      }
    });

    const reqBody = {
      invalidDetails: "No Cheese in Vegan Bowl and no onions",
    };
    const response = await request(app)
      .put("/api/orders/DINE-100004")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "No valid details to update",});
  });

  test("should update order by order number but fails due to invalid order number", async () => {

    const reqBody = {
      table_num: 4,
      customer_name: null,
      specialInstructions: "No Cheese in Vegan Bowl and no onions",
    };
    const response = await request(app)
      .put("/api/orders/DIN-100004")
      .send(reqBody);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Order Number",
    });
  });
  
});
