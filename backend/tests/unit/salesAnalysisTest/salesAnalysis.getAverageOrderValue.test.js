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

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/sales/averageOrderValue", () => {
  const payload = { username: "admin", storeId: 1, type: "M" };
  const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
  jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

  test("should return average order value when dates are provided", async () => {
    const query = { startDate: "2025-04-01", endDate: "2025-04-30" };
    const expectedAverage = 50.5;
    salesModel.averageOrderValue.mockResolvedValue(expectedAverage);

    const res = await request(app)
      .get("/api/sales/averageOrderValue")
      .set("Cookie", [`token=${token}`])
      .query(query);

    expect(salesModel.averageOrderValue).toHaveBeenCalledWith(
      query.startDate,
      query.endDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: query.startDate,
      endDate: query.endDate,
      averageOrderValue: expectedAverage,
    });
  });

  test("should default to current date when query params are missing", async () => {
    const expectedAverage = 75.25;
    salesModel.averageOrderValue.mockResolvedValue(expectedAverage);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    const expectedDate = localDate.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/sales/averageOrderValue")
      .set("Cookie", [`token=${token}`]);

    expect(salesModel.averageOrderValue).toHaveBeenCalledWith(
      expectedDate,
      expectedDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: expectedDate,
      endDate: expectedDate,
      averageOrderValue: expectedAverage,
    });
  });

  test("should return 500 if an error occurs", async () => {
    salesModel.averageOrderValue.mockRejectedValue(new Error("Test error"));

    const res = await request(app)
      .get("/api/sales/averageOrderValue")
      .set("Cookie", [`token=${token}`])
      .query({ startDate: "2025-04-01", endDate: "2025-04-30" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Test error" });
  });
});
