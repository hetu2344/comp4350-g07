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

/************ GET /api/user/current ************/
describe("GET /api/user/me", () => {
  test("should return current user info when authenticated", async () => {
    // Create a fake payload and token for authentication
    const payload = { username: "currentUser", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    // Stub jwt.verify to return our payload
    jwt.verify = jest.fn((token, secret, callback) => callback(null, payload));
    
    const res = await request(app)
      .get("/api/user/me")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: payload });
  });
});

/************ GET /api/user/:username ************/
describe("GET /api/user/:username", () => {
  test("should get user by username successfully", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const user = { username: "testuser" };
    userModel.getUserByUsername.mockResolvedValue(user);

    const res = await request(app)
      .get("/api/user/testuser")
      .set("Cookie", [`token=${token}`]);

    expect(userModel.getUserByUsername).toHaveBeenCalledWith("testuser");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(user);
  });
});

/************ GET /api/user/store/:storeId ************/
describe("GET /api/user/store/:storeId", () => {
  test("should get users by store id successfully", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const users = [{ username: "testuser" }];
    userModel.getUsersByStoreId.mockResolvedValue(users);

    const res = await request(app)
      .get("/api/user/store/1")
      .set("Cookie", [`token=${token}`]);

    expect(userModel.getUsersByStoreId).toHaveBeenCalledWith("1");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(users);
  });
});
