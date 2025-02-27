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

/************ PUT /api/user/update/:username ************/
describe("PUT /api/user/update/:username", () => {
    test("should update user successfully when password is provided", async () => {
      const payload = { username: "admin", storeId: 1, type: "S" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      bcrypt.hash.mockResolvedValue("hashed_newpass");
      const updatedUser = { username: "testuser", firstName: "Updated", firstName: "Updated", password: "newpass", lastName: "lname", storeId: 1, type: "M" };
      userModel.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/user/update/testuser")
        .set("Cookie", [`token=${token}`])
        .send({ firstName: "Updated", password: "newpass", lastName: "lname", storeId: 1, type: "M" });
      
      expect(bcrypt.hash).toHaveBeenCalledWith("newpass", 10);
      expect(userModel.updateUser).toHaveBeenCalledWith(
        "testuser",
        "Updated",
        "lname",
        "hashed_newpass",
        1,
        "M"
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
        .put("/api/user/update/testuser")
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

    test("should not update user as nothing is provided", async () => {
        const payload = { username: "admin", storeId: 1, type: "M" };
        const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
        jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
  
        const res = await request(app)
          .put("/api/user/update/testuser")
          .set("Cookie", [`token=${token}`])
          .send({});
        
        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ error: "At least one field must be provided for update" });
      });
  

    test("should not update user without username", async () => {
      const payload = { username: "admin", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
      jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

      const updatedUser = { firstName: "Updated" };
      userModel.updateUser.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put("/api/user/update/")
        .set("Cookie", [`token=${token}`])
        .send({ firstName: "Updated" });
      
      expect(res.statusCode).toBe(404);
      console.log(res.body);
      expect(res.body).toEqual({  });
    });
  });
