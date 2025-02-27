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
describe("Menu Mannagement GET ALL API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all menu items
  test("should return all menu items along with category name and a list of allergens", async () => {
    const expectedItem = [
      {
        item_id: 1,
        item_name: "Margherita Pizza",
        item_description: "Classic pizza with mozzarella, tomatoes, and basil.",
        price: "12.99",
        category_id: 2,
        is_available: true,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        created_at: "2025-02-21T23:21:46.158Z",
        category_name: "Main Course",
        allergens: [],
      },
      {
        item_id: 2,
        item_name: "Vegan Buddha Bowl",
        item_description: "Quinoa, chickpeas, avocado, and tahini dressing.",
        price: "11.99",
        category_id: 2,
        is_available: true,
        is_vegetarian: false,
        is_vegan: true,
        is_gluten_free: true,
        created_at: "2025-02-21T23:21:46.160Z",
        category_name: "Main Course",
        allergens: [],
      },
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

    const res = await request(app).get("/api/menu/");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedItem);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  // Test that tries to get all menu items and returns Not found(404)
  test("should fail to return menu item with a specific id and return 404", async () => {
    pool.query.mockResolvedValue({ rows: [] });

    const res = await request(app).get("/api/menu/");

    const errorMsg = {
      error: "No menu items found.",
    };

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(errorMsg);
  });

  // Test that gets all  menu items
  test("should fail to return all menu items and return 500", async () => {
    pool.query.mockRejectedValue(new Error("Database Connection Failed"));

    const res = await request(app).get("/api/menu/");

    const errorMsg = {
      error: "Server Error: Unable to fetch menu item.",
    };

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(errorMsg);
  });
});