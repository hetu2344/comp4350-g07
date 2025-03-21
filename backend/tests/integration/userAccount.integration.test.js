const request = require("supertest");
const app = require("../../index"); // Make sure the path is correct
const pool = require("../../db/test_db"); // Make sure the path is correct
const { resetTestDatabase } = require("../testHelpers");
const TIMESTAMP = "2025-03-19T05:20:59.268Z";
const jwt = require("jsonwebtoken");

describe("Integration Test: Orders API", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  
  test("POST /api/orders creates an order", async () => {
    const reqBody = {
      storeId: 1,
      orderType: "Take-Out",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };
    const response = await request(app).post("/api/orders/").send(reqBody);
    expect(response.statusCode).toBe(201);
    expectedResponse = {
      message: "Order created successfully.",
      order: {
        order: {
          order_id: 8,
          order_number: "TAKE-100008",
          store_id: 1,
          order_type: "Take-Out",
          table_num: null,
          customer_name: "Sarah Smith",
          order_status: "Active",
          order_time: TIMESTAMP,
          special_instructions: "No onions",
          total_price: 0,
          created_by: "employee_david",
        },
        total_price: 12.99,
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  
});
