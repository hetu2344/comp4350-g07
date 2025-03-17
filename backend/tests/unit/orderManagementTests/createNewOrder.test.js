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

    // Test that creates a new order
    test("should create a new order", async (done) => {
        const newOrder = {
          storeId: 1,
          orderType: "Take-Out",
          tableNum: null,
          customerName: "Sarah Smith",
          specialInstructions: "No onions",
          createdBy: "employee_david",
          items: [{ menu_item_id: 1, quantity: 1 }],
        };

    //    pool.__mockClient.query.mockImplementation((sql, params) => {
    //      if (sql.includes("SELECT id FROM menu_categories")) {
    //        return Promise.resolve({ rows: [{ id: 2 }] });
    //      }
    //      if (sql.includes("INSERT INTO menu_items")) {
    //        return Promise.resolve({
    //          rows: [{ item_id: 4, item_name: "Veggie Burger" }],
    //        });
    //      }
    //      return Promise.resolve({ rows: [] });
    //    });

        // mockClient.query.mockResolvedValueOnce({ rows: [{ order_id: 8, order_number:"TAKE-100008" }], });

        // mockClient.query.mockResolvedValueOnce({
        //      rows: [{ price: 12.99 }],
        //    });

        // mockClient.query.mockResolvedValueOnce({ rows: [] });

        // mockClient.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app).post("/orders").send(newOrder);
        console.log(response);
        // expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("message","Order created successfully.");
        expect(response.body.order).toHaveProperty("order_id");
        done();
    });
  
});
