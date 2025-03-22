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

describe("GET /api/sales/weeklySales", () => {
  const payload = { username: "admin", storeId: 1, type: "M" };
  const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
  jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

  test("should return weekly sales details", async () => {
    const expectedData = [{ week: "2025-W22", sales: 1200 }];
    salesModel.weeklySalesDetails.mockResolvedValue(expectedData);

    const res = await request(app)
      .get("/api/sales/weeklySales")
      .set("Cookie", [`token=${token}`]);

    expect(salesModel.weeklySalesDetails).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ weeklySalesData: expectedData });
  });

  test("should return 500 if an error occurs", async () => {
    salesModel.weeklySalesDetails
      .mockRejectedValue(new Error("Test error"));

    const res = await request(app)
      .get("/api/sales/weeklySales")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Test error" });
  });
});
