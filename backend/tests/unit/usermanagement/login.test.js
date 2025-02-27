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

/************ POST /api/user/login ************/
describe("POST /api/user/login", () => {
    test("should return 400 if username or password is missing", async () => {
      const res = await request(app)
        .post("/api/user/login")
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: "Username and password are required" });
    });

    test("should return 401 if invalid credentials", async () => {
      // Simulate a valid user but invalid password comparison
      userModel.getUserByUsername.mockResolvedValue({
        username: "testuser",
        password_hash: "hashed_password",
        store_id: 1,
        type: "M",
      });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post("/api/user/login")
        .send({ username: "testuser", password: "wrongpass" });
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: "Invalid credentials" });
    });

    test("should login successfully and set HTTP-only cookie", async () => {
      const user = {
        username: "testuser",
        password_hash: "hashed_password",
        store_id: 1,
        type: "M",
      };
      userModel.getUserByUsername.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("dummy_token");

      const res = await request(app)
        .post("/api/user/login")
        .send({ username: "testuser", password: "correctpass" });
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { username: user.username, storeId: user.store_id, type: user.type },
        expect.any(String),
        { expiresIn: "2h" }
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Login successful" });
      // Check that the cookie header is set with our token
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toMatch(/token=dummy_token/);
    });

    test("should return 404 when user does not exist", async () => {
      // Simulate the getUserByUsername throwing an error
      const { UserNotExistError } = require("../../../exceptions/exceptions");
      userModel.getUserByUsername.mockRejectedValue(new UserNotExistError("User not found"));

      const res = await request(app)
        .post("/api/user/login")
        .send({ username: "nonexistent", password: "any" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({ error: "User with username 'User not found' does not exist" });
    });
  });
