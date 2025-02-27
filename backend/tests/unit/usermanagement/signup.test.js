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

/************ POST /api/user/signup ************/
describe("POST /api/user/signup", () => {
    test("should return 400 if required fields are missing", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      const res = await request(app)
        .post("/api/user/signup")
        .set("Cookie", [`token=${token}`])
        .send({}); // missing all required fields
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Missing required fields: username, firstName, lastName, password, type" });
    });

    test("should return 400 for invalid user type", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      const res = await request(app)
        .post("/api/user/signup")
        .set("Cookie", [`token=${token}`])
        .send({
          username: "newuser",
          firstName: "New",
          lastName: "User",
          password: "pass",
          type: "X"
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: "Invalid user type. Allowed types: S (Store Owner), E (Employee), M (Manager)"
      });
    });

    test("should create a new user successfully", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      bcrypt.hash.mockResolvedValue("hashed_pass");
      const newUser = { username: "newuser" };
      userModel.addUser.mockResolvedValue(newUser);

      const res = await request(app)
        .post("/api/user/signup")
        .set("Cookie", [`token=${token}`])
        .send({
          username: "newuser",
          firstName: "New",
          lastName: "User",
          password: "pass",
          type: "M"
        });
      
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(userModel.addUser).toHaveBeenCalledWith("newuser", "New", "User", "hashed_pass", payload.storeId, "M");
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ message: "User created successfully", user: newUser });
    });

    test("should handle ConflictError during signup", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      bcrypt.hash.mockResolvedValue("hashed_pass");
      const { ConflictError } = require("../../../exceptions/exceptions");
      userModel.addUser.mockRejectedValue(new ConflictError("User already exists"));

      const res = await request(app)
        .post("/api/user/signup")
        .set("Cookie", [`token=${token}`])
        .send({
          username: "existinguser",
          firstName: "Existing",
          lastName: "User",
          password: "pass",
          type: "M"
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body).toEqual({ error: "User already exists" });
    });
  });
  