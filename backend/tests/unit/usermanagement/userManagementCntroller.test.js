const request = require("supertest");
const app = require("../../../index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../../../models/userManagementModels");
// const pool = require("../../../db/db");

// Mock external modules used by the controllers
// jest.mock("../../../../models/userManagementModels");
// jest.mock("bcryptjs");
// jest.mock("jsonwebtoken");
// jest.mock("../../../db/db", () => {
//   const mockClient = {
//     query: jest.fn(),
//     release: jest.fn(),
//   };

//   return {
//     query: jest.fn(),
//     connect: jest.fn().mockResolvedValue(mockClient),
//     end: jest.fn().mockResolvedValue(),
//     __mockClient: mockClient,
//   };
// });
// After each test, clear all mock calls
afterEach(() => {
  jest.clearAllMocks();
});

// (Optional) After all tests, perform any cleanup if needed
// For example, if you are mocking a DB pool that requires closing
// afterAll(async () => {
//   await pool.end();
// });

describe("User Management API Tests", () => {
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
      expect(res.body).toEqual({ error: "User not found" });
    });
  });

  /************ GET /api/user/logout ************/
  describe("GET /api/user/logout", () => {
    test("should clear token cookie and return logout message", async () => {
      const res = await request(app).get("/api/user/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "Logged out successfully" });
      // Verify that the token cookie is cleared (cookie value is empty)
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toMatch(/token=;/);
    });
  });

  /************ GET /api/user/current ************/
  describe("GET /api/user/current", () => {
    test("should return current user info when authenticated", async () => {
      // Create a fake payload and token for authentication
      const payload = { username: "currentUser", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      // Stub jwt.verify to return our payload
      jwt.verify = jest.fn((token, secret, callback) => callback(null, payload));
      
      const res = await request(app)
        .get("/api/user/current")
        .set("Cookie", [`token=${token}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ user: payload });
    });
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

  /************ PUT /api/user/:username ************/
  describe("PUT /api/user/:username", () => {
    test("should update user successfully when password is provided", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      bcrypt.hash.mockResolvedValue("hashed_newpass");
      const updatedUser = { username: "testuser", firstName: "Updated" };
      userModel.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/user/testuser")
        .set("Cookie", [`token=${token}`])
        .send({ firstName: "Updated", password: "newpass" });
      
      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
      expect(userModel.updateUser).toHaveBeenCalledWith(
        "testuser",
        "Updated",
        undefined,
        "hashed_newpass",
        undefined,
        undefined
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "User updated successfully", updatedUser });
    });

    test("should update user successfully without password", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      const updatedUser = { username: "testuser", firstName: "Updated" };
      userModel.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/user/testuser")
        .set("Cookie", [`token=${token}`])
        .send({ firstName: "Updated" });
      
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userModel.updateUser).toHaveBeenCalledWith(
        "testuser",
        "Updated",
        undefined,
        null,
        undefined,
        undefined
      );
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "User updated successfully", updatedUser });
    });
  });

  /************ DELETE /api/user/:username ************/
  describe("DELETE /api/user/:username", () => {
    test("should delete user successfully", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      userModel.removeUser.mockResolvedValue();

      const res = await request(app)
        .delete("/api/user/testuser")
        .set("Cookie", [`token=${token}`]);

      expect(userModel.removeUser).toHaveBeenCalledWith("testuser");
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: "User deleted successfully" });
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
});
