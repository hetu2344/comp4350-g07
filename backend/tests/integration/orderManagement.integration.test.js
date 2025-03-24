const request = require("supertest");
const app = require("../../index"); // Make sure the path is correct
const pool = require("../../db/test_db"); // Make sure the path is correct
const { resetTestDatabase } = require("../testHelpers");
const TIMESTAMP = "2025-03-19T05:20:59.268Z";
const jwt = require("jsonwebtoken");

describe("Integration Test: Orders API", () => {
  jest.setTimeout(30000);
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/orders returns a list of orders", async () => {
    const response = await request(app).get("/api/orders/");
    expect(response.statusCode).toBe(200);
    expectedResponse = [
      {
        order_id: 7,
        order_number: "DINE-100007",
        order_type: "Dine-In",
        table_number: "7",
        customer_name: null,
        order_status: "Completed",
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
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
        order_time: TIMESTAMP,
        special_instructions: "Extra Ketchup",
        item_total: 18.48,
        service_charge: 0.92,
        gst: 0.92,
        pst: 1.29,
        total_price: 21.62,
        created_by: "manager_susan",
      },
    ];
    expect(response.body).toEqual(expectedResponse);
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

  test("PUT /api/orders/DINE-100004 updates order", async () => {
    const reqBody = {
      table_num: 4,
      customer_name: null,
      specialInstructions: "No Cheese in Vegan Bowl and no onions",
    };

    const response = await request(app)
      .put("/api/orders/DINE-100004")
      .send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Order updated successfully",
      order: {
        order_id: 4,
        order_number: "DINE-100004",
        store_id: 1,
        order_type: "Dine-In",
        table_num: 4,
        customer_name: null,
        order_status: "Active",
        order_time: TIMESTAMP,
        special_instructions: "No Cheese in Vegan Bowl and no onions",
        total_price: 18.48,
        created_by: "employee_emma",
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/orders/DINE100004 fails to update order status", async () => {
    const reqBody = {
      updatedStatus: "Completed",
      changedBy: "employee_emma",
    };

    const response = await request(app)
      .put("/api/orders/DINE100004")
      .send(reqBody);
    expect(response.statusCode).toBe(400);
    expectedResponse = {
      error: "Invalid Order Number",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/orders/TAKE-100001 updates order status", async () => {
    const reqBody = {
      updatedStatus: "Completed",
      changedBy: "employee_emma",
    };

    const response = await request(app)
      .put("/api/orders/TAKE-100001/status")
      .send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Order Status updated successfully",
      order: {
        order_id: 1,
        order_number: "TAKE-100001",
        store_id: 1,
        order_type: "Take-Out",
        table_num: null,
        customer_name: "Sarah Smith",
        order_status: "Completed",
        order_time: TIMESTAMP,
        special_instructions: "Light Cheese",
        total_price: 32.47,
        created_by: "employee_david",
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/orders/TAKE-100001 gets order details with order number", async () => {
    const response = await request(app).get("/api/orders/TAKE-100001");

    expect(response.statusCode).toBe(200);
    expectedResponse = {
      order: {
        order_id: 1,
        order_number: "TAKE-100001",
        order_type: "Take-Out",
        table_number: "N/A",
        customer_name: "Sarah Smith",
        order_status: "Active",
        order_time: TIMESTAMP,
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
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("POST /api/orders/TAKE-100001/items adds item in order", async () => {
    const reqBody = {
      menuItemId: 2,
      quantity: 5,
      createdBy: "employee_emma",
    };

    const response = await request(app)
      .post("/api/orders/TAKE-100001/items")
      .send(reqBody);
    expect(response.statusCode).toBe(201);
    expectedResponse = {
      message: "Item added successfully",
      order: {
        orderNumber: "TAKE-100001",
        menuItemId: 2,
        quantity: 5,
        totalprice: 92.42,
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/orders/TAKE-100001/items/3 UPDATES item in order", async () => {
    const reqBody = { quantity: 5, newPrice: 12.99 };

    const response = await request(app)
      .put("/api/orders/TAKE-100001/items/3")
      .send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Item updated successfully",
      order: {
        orderNumber: "TAKE-100001",
        itemId: 3,
        quantity: 5,
        newPrice: 12.99,
        totalprice: 90.93,
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("DELETE /api/orders/TAKE-100001/items/1 deletes item in order", async () => {
    const reqBody = {
      removedBy: "employee_emma",
    };

    const response = await request(app)
      .delete("/api/orders/TAKE-100001/items/1")
      .send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Item removed successfully",
      order: {
        orderNumber: "TAKE-100001",
        itemId: 1,
        totalprice: 6.489999999999998,
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });
  
  
  test("DELETE /api/orders/DINE-100004 deletes order", async () => {

     const payload = { username: "admin", storeId: 1, type: "M" };
         const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
         jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
    
    const response = await request(app)
      .delete("/api/orders/DINE-100004")
      .set("Cookie", [`token=${token}`]);

      expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Order deleted successfully",
    };
    expect(response.body).toEqual(expectedResponse);
  });
});


