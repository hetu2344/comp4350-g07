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
describe("Order Mannagement CREATE NEW ORDER TESTS", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all orders
  test("should get all orders", async () => {
    pool.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT * FROM order_summary_view ORDER BY order_time DESC"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 7,
              order_number: "DINE-100007",
              order_type: "Dine-In",
              table_number: "7",
              customer_name: null,
              order_status: "Completed",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: null,
              item_total: 19.48,
              service_charge: 0.97,
              gst: 0.97,
              pst: 1.36,
              total_price: 22.79,
              created_by: "employee_lisa",
            },
            {
              order_id: 6,
              order_number: "DINE-100006",
              order_type: "Dine-In",
              table_number: "5",
              customer_name: null,
              order_status: "Active",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: null,
              item_total: 36.97,
              service_charge: 1.85,
              gst: 1.85,
              pst: 2.59,
              total_price: 43.25,
              created_by: "manager_susan",
            },
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
            {
              order_id: 5,
              order_number: "DINE-100005",
              order_type: "Dine-In",
              table_number: "2",
              customer_name: null,
              order_status: "Completed",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: null,
              item_total: 19.48,
              service_charge: 0.97,
              gst: 0.97,
              pst: 1.36,
              total_price: 22.79,
              created_by: "manager_bob",
            },
            {
              order_id: 3,
              order_number: "TAKE-100003",
              order_type: "Take-Out",
              table_number: "N/A",
              customer_name: "Olivia Brown",
              order_status: "Active",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: null,
              item_total: 24.98,
              service_charge: 1.25,
              gst: 1.25,
              pst: 1.75,
              total_price: 29.23,
              created_by: "employee_lisa",
            },
            {
              order_id: 4,
              order_number: "DINE-100004",
              order_type: "Dine-In",
              table_number: "1",
              customer_name: null,
              order_status: "Active",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: "No Cheese in Vegan Bowl",
              item_total: 18.48,
              service_charge: 0.92,
              gst: 0.92,
              pst: 1.29,
              total_price: 21.62,
              created_by: "employee_emma",
            },
            {
              order_id: 2,
              order_number: "TAKE-100002",
              order_type: "Take-Out",
              table_number: "N/A",
              customer_name: "James Anderson",
              order_status: "Completed",
              order_time: "2025-03-18T18:44:51.467Z",
              special_instructions: "Extra Ketchup",
              item_total: 18.48,
              service_charge: 0.92,
              gst: 0.92,
              pst: 1.29,
              total_price: 21.62,
              created_by: "manager_susan",
            },
          ],
        });
      }

      return Promise.resolve({ rows: [] });
    });

    const response = await request(app).get("/api/orders/");
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        order_id: 7,
        order_number: "DINE-100007",
        order_type: "Dine-In",
        table_number: "7",
        customer_name: null,
        order_status: "Completed",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: null,
        item_total: 19.48,
        service_charge: 0.97,
        gst: 0.97,
        pst: 1.36,
        total_price: 22.79,
        created_by: "employee_lisa",
      },
      {
        order_id: 6,
        order_number: "DINE-100006",
        order_type: "Dine-In",
        table_number: "5",
        customer_name: null,
        order_status: "Active",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: null,
        item_total: 36.97,
        service_charge: 1.85,
        gst: 1.85,
        pst: 2.59,
        total_price: 43.25,
        created_by: "manager_susan",
      },
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
      {
        order_id: 5,
        order_number: "DINE-100005",
        order_type: "Dine-In",
        table_number: "2",
        customer_name: null,
        order_status: "Completed",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: null,
        item_total: 19.48,
        service_charge: 0.97,
        gst: 0.97,
        pst: 1.36,
        total_price: 22.79,
        created_by: "manager_bob",
      },
      {
        order_id: 3,
        order_number: "TAKE-100003",
        order_type: "Take-Out",
        table_number: "N/A",
        customer_name: "Olivia Brown",
        order_status: "Active",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: null,
        item_total: 24.98,
        service_charge: 1.25,
        gst: 1.25,
        pst: 1.75,
        total_price: 29.23,
        created_by: "employee_lisa",
      },
      {
        order_id: 4,
        order_number: "DINE-100004",
        order_type: "Dine-In",
        table_number: "1",
        customer_name: null,
        order_status: "Active",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: "No Cheese in Vegan Bowl",
        item_total: 18.48,
        service_charge: 0.92,
        gst: 0.92,
        pst: 1.29,
        total_price: 21.62,
        created_by: "employee_emma",
      },
      {
        order_id: 2,
        order_number: "TAKE-100002",
        order_type: "Take-Out",
        table_number: "N/A",
        customer_name: "James Anderson",
        order_status: "Completed",
        order_time: "2025-03-18T18:44:51.467Z",
        special_instructions: "Extra Ketchup",
        item_total: 18.48,
        service_charge: 0.92,
        gst: 0.92,
        pst: 1.29,
        total_price: 21.62,
        created_by: "manager_susan",
      },
    ]);
  });

  // Test that tries but fails to get all orders
  test("should fail to get all orders", async () => {
    pool.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "SELECT * FROM order_summary_view ORDER BY order_time DESC"
        )
      ) {
        return Promise.reject(new Error("Unable to fetch orders."));
      }

      return Promise.resolve({ rows: [] });
    });

    const response = await request(app).get("/api/orders/");
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: "Database error:Unable to fetch orders." });
  });
});
