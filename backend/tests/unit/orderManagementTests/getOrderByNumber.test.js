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
describe("Order Management Getting order by order number TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all orders
  test("should get order by order number", async () => {
    pool.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM order_summary_view WHERE order_number")) {
        return Promise.resolve({
          rows: [
            {
              order_id: 1,
              order_number: "TAKE-100001",
              order_type: "Take-Out",
              table_number: "N/A",
              customer_name: "Sarah Smith",
              order_status: "Active",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: "Light Cheese",
              item_total: 32.47,
              service_charge: 1.62,
              gst: 1.62,
              pst: 2.27,
              total_price: 37.99,
              created_by: "employee_david",
            },
          ],
        });
      }

      if (
        sql.includes(`SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.item_price
             FROM order_items oi
             JOIN menu_items m ON oi.menu_item_id = m.item_id
             WHERE oi.order_id`)
      ) {
        return Promise.resolve({
          rows: [
            {
              menu_item_id: 1,
              item_name: "Margherita Pizza",
              quantity: 2,
              item_price: 12.99,
            },
            {
              menu_item_id: 3,
              item_name: "Cheesecake",
              quantity: 1,
              item_price: 6.49,
            },
          ],
        });
      }
    });

    const response = await request(app).get("/api/orders/TAKE-100001");
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      order: {
        order_id: 1,
        order_number: "TAKE-100001",
        order_type: "Take-Out",
        table_number: "N/A",
        customer_name: "Sarah Smith",
        order_status: "Active",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: "Light Cheese",
        item_total: 32.47,
        service_charge: 1.62,
        gst: 1.62,
        pst: 2.27,
        total_price: 37.99,
        created_by: "employee_david",
      },
      items: [
        {
          menu_item_id: 1,
          item_name: "Margherita Pizza",
          quantity: 2,
          item_price: 12.99,
        },
        {
          menu_item_id: 3,
          item_name: "Cheesecake",
          quantity: 1,
          item_price: 6.49,
        },
      ],
    });
  });

  // Test that try to get order but fail due to 400 due to invalid order number
  test("should get order but fail due to 400 due to invalid order number", async () => {
    const response = await request(app).get("/api/orders/TAK-100001");
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "Invalid Order Number" });
  });

  // Test that try to get order but fail due to 404 due to order not found
  test("should get order but fail due to 404 due to order not found", async () => {
    pool.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM order_summary_view WHERE order_number")) {
        return Promise.resolve({ rows: [] });
      }
    });

    const response = await request(app).get("/api/orders/TAKE-999999");
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number TAKE-999999 not found",
    });
  });

  // Test that try to get order but fail due to 500 due to server error
  test("should get order but fail due to 500 due to server error", async () => {
    pool.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM order_summary_view WHERE order_number")) {
        return Promise.reject(new Error("Server Error"));
      }
    });

    const response = await request(app).get("/api/orders/TAKE-100001");
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({
      error: "Server Error",
    });
  });
});
