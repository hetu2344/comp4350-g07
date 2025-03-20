const request = require("supertest");
const app = require("../../../index");
const pool = require("../../../db/db");

// Creating a mock database connection
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

// Setting things to do after each test
describe("Menu Mannagement GET ALL API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets any one specified menu item
  test("should return a menu item with a specific id", async () => {
    const expectedItem = [
      {
        item_id: 3,
        item_name: "Cheesecake",
        item_description:
          "Rich and creamy cheesecake topped with strawberries.",
        price: "6.49",
        category_id: 3,
        is_available: true,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        created_at: "2025-02-21T23:21:46.161Z",
        category_name: "Dessert",
        allergens: [],
      },
    ];

    pool.query.mockResolvedValue({ rows: expectedItem });

    const res = await request(app).get("/api/menu/3");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedItem);
    expect(pool.query).toHaveBeenCalledTimes(1);
    // pool.end.mockResolvedValue();
  });

  // Test that gets any one specified menu item
  test("should fail to return menu item with a specific id and return 400", async () => {
    const res = await request(app).get("/api/menu/a");

    const errorMsg = {
      error: "Invalid item ID.",
    };

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(errorMsg);
  });

  // Test that gets any one specified menu item
  test("should fail to return menu item with a specific id and return 404", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get("/api/menu/10");

    const errorMsg = {
      error: "No menu item found with ID: 10",
    };

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(errorMsg);
  });

  // Test that gets any one specified menu item
  test("should fail to return menu item with a specific id and return 500", async () => {
    pool.query.mockRejectedValue(new Error("Database Connection Failed"));

    const res = await request(app).get("/api/menu/3");

    const errorMsg = {
      error: "Server Error: Unable to fetch menu item.",
    };

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(errorMsg);
  });
});