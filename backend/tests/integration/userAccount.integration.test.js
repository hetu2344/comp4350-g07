const request = require("supertest");
const app = require("../../index"); // Make sure the path is correct
const pool = require("../../db/test_db"); // Make sure the path is correct
const { resetTestDatabase } = require("../testHelpers");
const TIMESTAMP = "2025-03-19T05:20:59.268Z";
const jwt = require("jsonwebtoken");

describe("Integration Test: Orders API", () => {
  jest.setTimeout(30000);
  
  beforeAll(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("POST /login logs in the app", async () => {
    const reqBody = {
      username: "owner_john",
      password: "password123",
    };
    const response = await request(app).post("/api/user/login").send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Login successful",
    };

    expect(response.body).toEqual(expectedResponse);
  });


  test("POST /login logs in the app but fails due to 404", async () => {
    const reqBody = {
      username: "owner_4350",
      password: "password123",
    };
    const response = await request(app).post("/api/user/login").send(reqBody);
    expect(response.statusCode).toBe(404);
    expectedResponse = {
      error: "User with username 'owner_4350' does not exist",
    };

    expect(response.body).toEqual(expectedResponse);
  });


  
  test("POST /login logs in the app but fails due to 400", async () => {
    const reqBody = {
      password: "password123",
    };
    const response = await request(app).post("/api/user/login").send(reqBody);
    expect(response.statusCode).toBe(400);
    expectedResponse = {
      error: "Username and password are required",
    };

    expect(response.body).toEqual(expectedResponse);
  });

  test("POST /logout logs out of the app", async () => {
    const response = await request(app).post("/api/user/logout");
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Logged out successfully",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /me gets current user logged in the app", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .get("/api/user/me")
      .set("Cookie", [`token=${token}`]);
    expect(response.statusCode).toBe(200);
  });

  test("POST /api/user/signup creates a user", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
    const reqBody = {
      username: "newuser",
      firstName: "New",
      lastName: "User",
      password: "pass",
      type: "M",
    };
    const response = await request(app)
      .post("/api/user/signup")
      .set("Cookie", [`token=${token}`])
      .send(reqBody);

    const expectedResponse = {
      message: "User created successfully",
      user: {
        username: "newuser",
        first_name: "New",
        last_name: "User",
        type: "M",
      },
    };
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(expectedResponse);
  });



   test("POST /api/user/signup creates a user but fails due to 400", async () => {
     const payload = { username: "admin", storeId: 1, type: "M" };
     const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
     jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
     const reqBody = {
       username: "newuser",
       firstName: "New",
       lastName: "User",
       password: "pass",
     };
     const response = await request(app)
       .post("/api/user/signup")
       .set("Cookie", [`token=${token}`])
       .send(reqBody);

     const expectedResponse = {
       error:
         "Missing required fields: username, firstName, lastName, password, type",
     };
     expect(response.statusCode).toBe(400);
     expect(response.body).toEqual(expectedResponse);
   });


   
   test("POST /api/user/signup creates a user but fails due to 400", async () => {
     const payload = { username: "admin", storeId: 1, type: "M" };
     const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
     jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
     const reqBody = {
       username: "newuser",
       firstName: "New",
       lastName: "User",
       password: "pass",
       type:'Owner'
     };
     const response = await request(app)
       .post("/api/user/signup")
       .set("Cookie", [`token=${token}`])
       .send(reqBody);

     const expectedResponse = {
       error:
         "Invalid user type. Allowed types: S (Store Owner), E (Employee), M (Manager)",
     };
     expect(response.statusCode).toBe(400);
     expect(response.body).toEqual(expectedResponse);
   });

   test("GET /api/user/:username give a user by username", async () => {
     const payload = { username: "admin", storeId: 1, type: "M" };
     const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
     jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

     const user = { username: "testuser" };
     // userModel.getUserByUsername.mockResolvedValue(user);

     const res = await request(app)
       .get("/api/user/employee_emma")
       .set("Cookie", [`token=${token}`]);

     // expect(res.statusCode).toBe(200);
     const expectedResponse = {
       username: "employee_emma",
       first_name: "Emma",
       last_name: "Jones",
       password_hash:
         "$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6",
       type: "E",
       store_id: 1,
     };
     expect(res.body).toEqual(expectedResponse);
   });


  test("POST /api/update/:username updates a user detail", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));
    const reqBody = {
      username: "newuser",
      firstName: "New",
      lastName: "User",
      type: "M",
    };
    const response = await request(app)
      .put("/api/user/update/employee_emma")
      .set("Cookie", [`token=${token}`])
      .send(reqBody);

    const expectedResponse = {
      message: "User updated successfully",
      updatedUser: {
        username: "employee_emma",
        first_name: "New",
        last_name: "User",
        password_hash:
          "$2b$10$6FG6GpA4rRSSu3RP/syyzOEbh5/thfOYGGodaEk3KcUhWYDgiQPF6",
        type: "M",
        store_id: 1,
      },
    };
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

   

  test("DELETE /api/user/:username updates a user detail", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .delete("/api/user/employee_emma")
      .set("Cookie", [`token=${token}`]);

    const expectedResponse = {
      message: "User deleted successfully.",
    };
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expectedResponse);
  });

 
  test("GET /api/user/me gives logged in user", async () => {
    // Create a fake payload and token for authentication
    const payload = { username: "currentUser", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", {
      expiresIn: "2h",
    });
    // Stub jwt.verify to return our payload
    jwt.verify = jest.fn((token, secret, callback) => callback(null, payload));

    const res = await request(app)
      .get("/api/user/me")
      .set("Cookie", [`token=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ user: payload });
  });

    test("GET /api/user/store/:storeID gives all users in a store", async () => {
      // Create a fake payload and token for authentication
      const payload = { username: "currentUser", storeId: 1, type: "M" };
      const token = jwt.sign(payload, "your_jwt_secret", {
        expiresIn: "2h",
      });
      jwt.verify = jest.fn((token, secret, callback) =>
        callback(null, payload)
      );

      const res = await request(app)
        .get("/api/user/store/1")
        .set("Cookie", [`token=${token}`]);
      const expectedResponse = [
        {
          username: "owner_john",
          first_name: "John",
          last_name: "Doe",
          type: "S",
        },
        {
          username: "manager_bob",
          first_name: "Bob",
          last_name: "Brown",
          type: "M",
        },
        {
          username: "newuser",
          first_name: "New",
          last_name: "User",
          type: "M",
        },
      ];
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(expectedResponse);
    });



});

/**
 * //**Authentication Routes**
 router.post("/login", userController.login); // User login
 router.post("/logout", userController.logout); // User logout
 router.get("/me", userController.getCurrentUser); // Get current logged-in user info
 
 //**User Management (Only Store Owners & Managers)**
 router.post("/signup", userController.signup); // Create new user
 router.put("/update/:username", userController.updateUser); // Update user details
 // Delete a user with checks
 router.delete("/:username", userController.deleteUserWithChecks);
 
 //**User Query Routes**
 router.get("/:username", userController.getUserByUsername); // Get user by username
 router.get("/store/:storeId", userController.getUsersByStoreId); // Get all users in a store
 
 module.exports = router;
 
 
 */
