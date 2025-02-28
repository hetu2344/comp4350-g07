const request = require("supertest");
const app = require("../../../index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../../../models/userManagementModels");
const pool = require("../../../db/db");

// Mock external modules used by the controllers
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

// After each test, clear all mock calls
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

// (Optional) After all tests, perform any cleanup if needed
// For example, if you are mocking a DB pool that requires closing
// afterAll(async () => {
//   await pool.end();
// });
  /************ GET /api/user/logout ************/
  describe("GET /api/user/logout", () => {
    test("should logout out current user", async () => {
      const res = await request(app).post("/api/user/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Logged out successfully" });
      // Verify that the token cookie is cleared (cookie value is empty)
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toMatch(/token=;/);
    });
  });
