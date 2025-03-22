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

describe("GET /api/sales/revenueByCategory", () => {
  const payload = { username: "admin", storeId: 1, type: "M" };
  const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
  jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

  test("should return revenue by category with items when dates are provided", async () => {
    const query = { startDate: "2025-03-01", endDate: "2025-03-31" };
    const expectedCategories = [{ category: "Drinks", revenue: 200 }];
    salesModel.revenueByCategoryWithItems.mockResolvedValue(expectedCategories);

    const res = await request(app)
      .get("/api/sales/revenueByCategory")
      .set("Cookie", [`token=${token}`])
      .query(query);

    expect(salesModel.revenueByCategoryWithItems).toHaveBeenCalledWith(
      query.startDate,
      query.endDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: query.startDate,
      endDate: query.endDate,
      categories: expectedCategories,
    });
  });

  test("should default to current date when query params are missing", async () => {
    const expectedCategories = [{ category: "Desserts", revenue: 150 }];
    salesModel.revenueByCategoryWithItems.mockResolvedValue(expectedCategories);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    const expectedDate = localDate.toISOString().split("T")[0];

    const res = await request(app)
      .get("/api/sales/revenueByCategory")
      .set("Cookie", [`token=${token}`]);

    expect(salesModel.revenueByCategoryWithItems).toHaveBeenCalledWith(
      expectedDate,
      expectedDate
    );
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      startDate: expectedDate,
      endDate: expectedDate,
      categories: expectedCategories,
    });
  });

  test("should return 500 if an error occurs", async () => {
    salesModel.revenueByCategoryWithItems.mockRejectedValue(
      new Error("Test error")
    );

    const res = await request(app)
      .get("/api/sales/revenueByCategory")
      .set("Cookie", [`token=${token}`])
      .query({ startDate: "2025-03-01", endDate: "2025-03-31" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Test error" });
  });
});
