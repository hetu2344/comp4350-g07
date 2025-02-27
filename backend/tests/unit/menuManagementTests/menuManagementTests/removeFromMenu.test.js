const request = require("supertest");
const app = require("../../../../index");
const pool = require("../../../../db/db");

// Creating a mock database connection
jest.mock("../../../../db/db", () => {
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
describe("Menu Management DELETE API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that removes a menu item
  test("should successfully remove an existing menu item", async () => {
    pool.query.mockResolvedValue({
      rows: [{ item_id: 3, item_name: "Cheesecake" }],
    });

    const res = await request(app).delete("/api/menu/3");

    const successMsg = {
      message: "Cheesecake deleted successfully from menu!",
      item_id: 3,
    };

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(successMsg);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  // Trying to remove an item but fails with 404
  test("should fail to remove an existing menu item responding 404", async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const res = await request(app).delete("/api/menu/10");

    const successMsg = {
      message: "Menu item not found.",
    };

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(successMsg);
  });

  // Test that fails to get any one specified menu item and retun 400
  test("should fail to remove a menu item with a specific id and return 400", async () => {
    const res = await request(app).delete("/api/menu/a");

    const errorMsg = {
      error: "Invalid item ID.",
    };

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual(errorMsg);
  });
});