const request = require("supertest");
const app = require("../../index");
const pool = require("../../db/test_db");
const { resetTestDatabase } = require("../testHelpers");
const TIMESTAMP = "2025-03-19T05:20:59.268Z";
const jwt = require("jsonwebtoken");

describe("Integration Test: Sales API", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/sales/totalRevenue gets total revenue and order details for specified date range", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/totalRevenue?startDate=2025-03-19&endDate=2025-03-19")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      revenueDetails: {
        byStatus: [
          {
            order_status: "Active",
            total_orders: "4",
            total_revenue: 112.9,
          },
          {
            order_status: "Completed",
            total_orders: "3",
            total_revenue: 57.44,
          },
        ],
        total: {
          total_orders: "7",
          total_revenue: 170.34,
        },
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/topMenuItems gets top menu items sold for specified date range", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/topMenuItems?startDate=2025-03-19&endDate=2025-03-19")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      items: [
        {
          item_id: 1,
          item_name: "Margherita Pizza",
          quantity_sold: "6",
        },
        {
          item_id: 2,
          item_name: "Vegan Buddha Bowl",
          quantity_sold: "5",
        },
        {
          item_id: 3,
          item_name: "Cheesecake",
          quantity_sold: "5",
        },
      ],
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/revenueByCategory gets revenue generated for each menu item category within a specified date range.", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get(
        "/api/sales/revenueByCategory?startDate=2025-03-19&endDate=2025-03-19"
      )
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      categories: [
        {
          category: "Dessert",
          revenue: 32.45,
          itemssold: [
            {
              itemName: "Cheesecake",
              itemPrice: 6.49,
              quantitySold: 5,
              totalRevenue: 32.45,
            },
          ],
        },
        {
          category: "Main Course",
          revenue: 137.89,
          itemssold: [
            {
              itemName: "Vegan Buddha Bowl",
              itemPrice: 11.99,
              quantitySold: 5,
              totalRevenue: 59.95,
            },
            {
              itemName: "Margherita Pizza",
              itemPrice: 12.99,
              quantitySold: 6,
              totalRevenue: 77.94,
            },
          ],
        },
      ],
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/dinevstake gets breakdown of revenue and order counts for Dine-In and Take-Out order types within a specified date range.", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/dinevstake?startDate=2025-03-19&endDate=2025-03-19")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      dineVsTakeDetails: {
        byOrderType: [
          {
            order_type: "Dine-In",
            total_orders: "2",
            total_revenue: 38.96,
          },
          {
            order_type: "Take-Out",
            total_orders: "1",
            total_revenue: 18.48,
          },
        ],
        overallTotal: {
          total_orders: "3",
          total_revenue: 57.44,
        },
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/dailyTrend?startDate=2025-03-19&endDate=2025-03-19 ", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/dailyTrend?startDate=2025-03-19&endDate=2025-03-19")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      dailySales: [
        {
          date: "2025-03-19T00:00:00.000Z",
          revenue: 57.44,
        },
      ],
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/averageOrderValue?startDate=2025-03-19&endDate=2025-03-19 ", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get(
        "/api/sales/averageOrderValue?startDate=2025-03-19&endDate=2025-03-19"
      )
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      averageOrderValue: 19.14666666666667,
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/totalRevenue gets total revenue and order details ", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/totalRevenue")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      revenueDetails: {
        byStatus: [],
        total: {
          total_orders: "0",
          total_revenue: null,
        },
      },
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/topMenuItems gets top menu items sold ", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/topMenuItems")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      items: [],
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET  /api/sales/weeklySales gets  daily revenue for the current week, along with the total revenue for the week.", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/weeklySales")
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);
    expectedResponse = {
      weeklySalesData: {
        dailySales: [
          {
            day_name: "Wednesday",
            date: "2025-03-19",
            daily_revenue: 57.44,
          }
        ],
        weeklyTotal: 57.44,
      }
    };
    console.log(response.body);

    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/sales/dailyTrend", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/sales/dailyTrend")
      .query({ startDate: "2025-03-19", endDate: "2025-03-19" })
      .set("Cookie", [`token=${token}`]);

    expect(response.statusCode).toBe(200);

    expectedResponse = {
      startDate: "2025-03-19",
      endDate: "2025-03-19",
      dailySales: [ { date: '2025-03-19T00:00:00.000Z', revenue: 57.44 } ]
    };

    console.log(response.body);
    expect(response.body).toEqual(expectedResponse);
  });
});
