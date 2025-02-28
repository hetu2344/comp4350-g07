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

/************ DELETE /api/user/:username ************/
describe("DELETE /api/user/delete/:username", () => {
    test("should delete user successfully", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      userModel.removeUser.mockResolvedValue();

      const res = await request(app)
        .delete("/api/user/delete/testuser")
        .set("Cookie", [`token=${token}`]);

      expect(userModel.removeUser).toHaveBeenCalledWith("testuser");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "User deleted successfully" });
    });
  });
  