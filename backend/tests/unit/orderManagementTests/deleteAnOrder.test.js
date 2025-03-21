const request = require("supertest");
const app = require("../../../index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../../../models/userManagementModels");
const pool = require("../../../db/db");

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

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await pool.end();
});

describe("Order Management Deleting order TESTS", () => {
  test("should delete order successfully", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));


    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT order_id FROM orders WHERE order_number=$1")) {
        return Promise.resolve({rows:[{order_id:1}]});
      }

      if (sql.includes("DELETE FROM order_items WHERE order_id=$1")) {
        return Promise.resolve();
      }
      if (sql.includes("DELETE FROM orders WHERE order_id=$1")) {
        return Promise.resolve();
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }
    });

    const response = await request(app)
      .delete("/api/orders/DINE-100004")
      .set("Cookie", [`token=${token}`])
    console.log(response);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: "Order deleted successfully",
    });
    
    
  });



  test("should delete order but fails due to no order found", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT order_id FROM orders WHERE order_number=$1")) {
        return Promise.resolve({ rows: [] });
      }

      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }
      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }
    });

    const response = await request(app)
      .delete("/api/orders/DINE-999999")
      .set("Cookie", [`token=${token}`]);
    console.log(response);
    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      error: "Order with number DINE-999999 not found",
    });
  });


   test("should delete order but fails due to no Server Error", async () => {
     const payload = { username: "admin", storeId: 1, type: "M" };
     const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
     jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

     pool.__mockClient.query.mockImplementation((sql, params) => {
       if (sql.includes("SELECT order_id FROM orders WHERE order_number=$1")) {
         return Promise.reject(new Error("Server Error"));
       }

       if (sql.startsWith("BEGIN")) {
         return Promise.resolve();
       }
       if (sql.startsWith("COMMIT")) {
         return Promise.resolve();
       }

       if (sql.startsWith("ROLLBACK")) {
         return Promise.resolve();
       }
     });

     const response = await request(app)
       .delete("/api/orders/DINE-100004")
       .set("Cookie", [`token=${token}`]);
     console.log(response);
     expect(response.statusCode).toBe(500);
     expect(response.body).toEqual({
       error: "Server Error",
     });
   });


  test("should delete order but fails due invalid order number", async () => {
    const payload = { username: "admin", storeId: 1, type: "M" };
    const token = jwt.sign(payload, "your_jwt_secret", { expiresIn: "2h" });
    jwt.verify = jest.fn((t, secret, callback) => callback(null, payload));

    const response = await request(app)
      .delete("/api/orders/DIN-100004")
      .set("Cookie", [`token=${token}`]);
    console.log(response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Order Number",
    });
  });
});
