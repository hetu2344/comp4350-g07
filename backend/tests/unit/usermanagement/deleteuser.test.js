const request = require("supertest");
const app = require("../../../index");
const jwt = require("jsonwebtoken");
const userModel = require("../../../models/userManagementModels");
const pool = require("../../../db/db");
const { UnauthorizedError, ValidationError } = require("../../../exceptions/exceptions");

jest.mock("../../../models/userManagementModels");
jest.mock("jsonwebtoken");
jest.mock("../../../db/db", () => {
  const mockClient = { query: jest.fn(), release: jest.fn() };
  return { query: jest.fn(), connect: jest.fn().mockResolvedValue(mockClient), end: jest.fn().mockResolvedValue(), __mockClient: mockClient };
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

/************ DELETE /api/user/:username ************/
describe("DELETE /api/user/:username", () => {
  const payload = { username: "manager", storeId: 1, type: "M" };
  const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });

  beforeEach(() => {
    jwt.verify.mockImplementation((t, secret, callback) => callback(null, payload));
  });

  test("should return 403 if user tries to delete themselves", async () => {
    const res = await request(app)
      .delete("/api/user/manager")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "You cannot delete yourself." });
  });

  test("should return 400 if target user does not exist", async () => {
    userModel.getUserByUsername.mockResolvedValue(null);

    const res = await request(app)
      .delete("/api/user/nonexistent")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "User does not exist." });
  });

  test("should return 403 if trying to delete store owner", async () => {
    // userModel.addUser.mockResolvedValue({ username: "owner", type: "S" });

    userModel.getUserByUsername.mockResolvedValue({ username: "owner", type: "S" });
    // userModel.removeUser.mockResolvedValue({ username: "owner" });

    const res = await request(app)
      .delete("/api/user/owner")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: "Cannot delete the store owner." });
  });

  // test("should return 403 if manager tries to delete another manager", async () => {
  //   userModel.getUserByUsername.mockResolvedValue({ username: "othermanager", type: "M" });

  //   const res = await request(app)
  //     .delete("/api/user/othermanager")
  //     .set("Cookie", [`token=${token}`]);

  //   expect(res.statusCode).toBe(403);
  //   expect(res.body).toEqual({ error: "Managers cannot delete other managers." });
  // });

  test("should successfully delete an employee by manager", async () => {
    userModel.getUserByUsername.mockResolvedValue({ username: "employee", type: "E" });
    userModel.removeUser.mockResolvedValue({ username: "employee" });

    const res = await request(app)
      .delete("/api/user/employee")
      .set("Cookie", [`token=${token}`]);

    expect(userModel.removeUser).toHaveBeenCalledWith("employee");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "User deleted successfully." });
  });

  test("should handle server error gracefully", async () => {
    userModel.getUserByUsername.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .delete("/api/user/someuser")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Internal Server Error" });
  });
});
