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
  test("should create a new order", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Take-Out",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by)"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 8,
              order_number: "TAKE-100008",
              storeId: 1,
              orderType: "Take-Out",
              tableNum: null,
              customerName: "Sarah Smith",
              order_status: "Active",
              order_time: "2025-03-18 17:26:16.166083",
              specialInstructions: "No onions",
              total_price: 0.0,
              createdBy: "employee_david",
            },
          ],
        });
      }
      if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [
            {
              item_id: 1,
              item_name: "Margherita Pizza",
              item_description:
                "Classic pizza with mozzarella, tomatoes, and basil.",
              price: 12.99,
              category_id: 2,
              is_available: true,
              is_vegetarian: true,
              is_vegan: false,
              is_gluten_free: false,
              created_at: "2025-03-18 17:04:15.730762",
            },
          ],
        });
      }

      if (sql.includes("INSERT INTO order_items")) {
        return Promise.resolve();
      }

      if (sql.includes("UPDATE orders SET total_price=$1 WHERE order_id=")) {
        return Promise.resolve();
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      return Promise.resolve({ rows: [] });
    });


    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Order created successfully."
    );
  });

  // Test that creates a new order
  test("should create a new order", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Dine-In",
      tableNum: 2,
      customerName: null,
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by)"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 8,
              order_number: "TAKE-100008",
              storeId: 1,
              orderType: "Dine-In",
              tableNum: 2,
              customerName: null,
              order_status: "Active",
              order_time: "2025-03-18 17:26:16.166083",
              specialInstructions: "No onions",
              total_price: 0.0,
              createdBy: "employee_david",
            },
          ],
        });
      }
      if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [
            {
              item_id: 1,
              item_name: "Margherita Pizza",
              item_description:
                "Classic pizza with mozzarella, tomatoes, and basil.",
              price: 12.99,
              category_id: 2,
              is_available: true,
              is_vegetarian: true,
              is_vegan: false,
              is_gluten_free: false,
              created_at: "2025-03-18 17:04:15.730762",
            },
          ],
        });
      }

      if (sql.includes("INSERT INTO order_items")) {
        return Promise.resolve();
      }

      if (sql.includes("UPDATE orders SET total_price=$1 WHERE order_id=")) {
        return Promise.resolve();
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      return Promise.resolve({ rows: [] });
    });

    // mockClient.query.mockResolvedValueOnce({ rows: [{ order_id: 8, order_number:"TAKE-100008" }], });

    // mockClient.query.mockResolvedValueOnce({
    //      rows: [{ price: 12.99 }],
    //    });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Order created successfully."
    );
  });

  // Test that tries to create and order but fails with a 500 error
  test("should create a new order but fails with 500", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Take-Out",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 0 }],
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by)"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 8,
              order_number: "TAKE-100008",
              storeId: 1,
              orderType: "Take-Out",
              tableNum: null,
              customerName: "Sarah Smith",
              order_status: "Active",
              order_time: "2025-03-18 17:26:16.166083",
              specialInstructions: "No onions",
              total_price: 0.0,
              createdBy: "employee_david",
            },
          ],
        });
      }
      // if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
      //   return Promise.resolve();
      // }

      // if (sql.includes("INSERT INTO order_items")) {
      //   return Promise.resolve();
      // }

      // if (sql.includes("UPDATE orders SET total_price=$1 WHERE order_id=")) {
      //   return Promise.resolve();
      // }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      return Promise.resolve({ rows: [] });
    });

    // mockClient.query.mockResolvedValueOnce({ rows: [{ order_id: 8, order_number:"TAKE-100008" }], });

    // mockClient.query.mockResolvedValueOnce({
    //      rows: [{ price: 12.99 }],
    //    });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response);
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty(
      "error",
      "Quantity should be greater than 0"
    );
  });

  // Test that  tries to create a new order but fails with 404
  test("should create a new order but fails with 404", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Take-Out",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 5, quantity: 1 }],
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (
        sql.includes(
          "INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by)"
        )
      ) {
        return Promise.resolve({
          rows: [
            {
              order_id: 8,
              order_number: "TAKE-100008",
              storeId: 1,
              orderType: "Take-Out",
              tableNum: null,
              customerName: "Sarah Smith",
              order_status: "Active",
              order_time: "2025-03-18 17:26:16.166083",
              specialInstructions: "No onions",
              total_price: 0.0,
              createdBy: "employee_david",
            },
          ],
        });
      }
      if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
        return Promise.resolve({ rows: [] });
      }

      // if (sql.includes("INSERT INTO order_items")) {
      //   return Promise.resolve();
      // }

      // if (sql.includes("UPDATE orders SET total_price=$1 WHERE order_id=")) {
      //   return Promise.resolve();
      // }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      return Promise.resolve({ rows: [] });
    });

    // mockClient.query.mockResolvedValueOnce({ rows: [{ order_id: 8, order_number:"TAKE-100008" }], });

    // mockClient.query.mockResolvedValueOnce({
    //      rows: [{ price: 12.99 }],
    //    });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    // mockClient.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response.body);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty(
      "error",
      "Menu item with ID 5 not found"
    );
  });

  // Test that  tries to create a new order but fails with 400
  test("should create a new order but fails with 400 due to storeId missing", async () => {
    const newOrder = {
      storeId: 0,
      orderType: "Take-Out",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Missing required fields: storeId, orderType, createdBy, items"
    );
  });

  // Test that  tries to create a new order but fails with 400
  test("should create a new order but fails with 400 due to invalid order-type", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Delivery",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Invalid order type. Allowed types: Dine-In, Take-Out"
    );
  });

  // Test that  tries to create a new order but fails with 400
  test("should create a new order but fails with 400 due to being Dine in with no table num", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Dine-In",
      tableNum: null,
      customerName: "Sarah Smith",
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Table number is required for Dine-In orders."
    );
  });

  // Test that  tries to create a new order but fails with 400
  test("should create a new order but fails with 400 due to being Take out with no customer name", async () => {
    const newOrder = {
      storeId: 1,
      orderType: "Take-Out",
      tableNum: null,
      customerName: null,
      specialInstructions: "No onions",
      createdBy: "employee_david",
      items: [{ menu_item_id: 1, quantity: 1 }],
    };

    const response = await request(app).post("/api/orders/").send(newOrder);
    console.log(response.body);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty(
      "error",
      "Customer name is required for Take-Out orders."
    );
  });


    test("should fail to create a new order", async () => {
      const newOrder = {
        storeId: 1,
        orderType: "Take-Out",
        tableNum: null,
        customerName: null,
        specialInstructions: "No onions",
        createdBy: "employee_david",
        items: [{ menu_item_id: 1, quantity: 1 }],
      };

      pool.__mockClient.query.mockImplementation((sql, params) => {
        if (
          sql.includes(
            "INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by)"
          )
        ) {
          return Promise.resolve({
            rows: [
              {
                order_id: 8,
                order_number: "TAKE-100008",
                storeId: 1,
                orderType: "Take-Out",
                tableNum: null,
                customerName: "Sarah Smith",
                order_status: "Active",
                order_time: "2025-03-18 17:26:16.166083",
                specialInstructions: "No onions",
                total_price: 0.0,
                createdBy: "employee_david",
              },
            ],
          });
        }
        if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
          return Promise.resolve({
            rows: [
              {
                item_id: 1,
                item_name: "Margherita Pizza",
                item_description:
                  "Classic pizza with mozzarella, tomatoes, and basil.",
                price: 12.99,
                category_id: 2,
                is_available: true,
                is_vegetarian: true,
                is_vegan: false,
                is_gluten_free: false,
                created_at: "2025-03-18 17:04:15.730762",
              },
            ],
          });
        }

        if (sql.includes("INSERT INTO order_items")) {
          return Promise.resolve();
        }

        if (sql.includes("UPDATE orders SET total_price=$1 WHERE order_id=")) {
          return Promise.resolve();
        }

        if (sql.startsWith("BEGIN")) {
          return Promise.resolve();
        }
        if (sql.startsWith("COMMIT")) {
          return Promise.resolve();
        }

        return Promise.resolve({ rows: [] });
      });

      const response = await request(app).post("/api/orders/").send(newOrder);
      console.log(response);
      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Customer name is required for Take-Out orders.",
      });
    });

});
