const request = require("supertest");
const app = require("../../../index");
const salesModel = require("../../../models/salesAnalysisModel");
const pool = require("../../../db/db");
const jwt = require("jsonwebtoken");

jest.mock("../../../models/salesAnalysisModel");
jest.mock("../../../models/userManagementModels");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
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

jest.mock("../../../models/salesAnalysisModel");

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/sales/dailyTrend", () => {
  const payload = { username: "admin", storeId: 1, type: "M" };
  const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
  jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

  test("should return daily sales trend when dates are provided", async () => {
    const query = { startDate: "2025-05-01", endDate: "2025-05-31" };
    const expectedTrend = [{ day: "2025-05-01", sales: 200 }];
    salesModel.dailyTrend.mockResolvedValue(expectedTrend);

    const res = await request(app)
      .get("/api/sales/dailyTrend")
      .set("Cookie", [`token=${token}`])
      .query(query);

    expect(salesModel.dailyTrend).toHaveBeenCalledWith(
      query.startDate,
      query.endDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: query.startDate,
      endDate: query.endDate,
      dailySales: expectedTrend,
    });
  });

  test("should default to current date when query params are missing", async () => {
    const expectedTrend = [{ day: "2025-05-15", sales: 300 }];
    salesModel.dailyTrend.mockResolvedValue(expectedTrend);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    const expectedDate = localDate.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/sales/dailyTrend")
      .set("Cookie", [`token=${token}`]);

    expect(salesModel.dailyTrend).toHaveBeenCalledWith(
      expectedDate,
      expectedDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: expectedDate,
      endDate: expectedDate,
      dailySales: expectedTrend,
    });
  });

  test("should return 500 if an error occurs", async () => {
    salesModel.dailyTrend.mockRejectedValue(new Error("Test error"));

    const res = await request(app)
      .get("/api/sales/dailyTrend")
      .set("Cookie", [`token=${token}`])
      .query({ startDate: "2025-05-01", endDate: "2025-05-31" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Test error" });
  });
});
