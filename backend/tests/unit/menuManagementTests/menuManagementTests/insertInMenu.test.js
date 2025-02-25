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
describe("Menu Mannagement API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that inserts an item in the menu
  test("should insert a new item in the menu", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT id FROM menu_categories")) {
        return Promise.resolve({ rows: [{ id: 2 }] });
      }
      if (sql.includes("INSERT INTO menu_items")) {
        return Promise.resolve({
          rows: [{ item_id: 4, item_name: "Veggie Burger" }],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const newMenuItem = {
      itemName: "Veggie Burger",
      itemDescription: "Delicious plant-based burger",
      price: 12.99,
      category: "Diet",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };

        const expectedMessage = {
          message: "Veggie Burger added successfully.",
          item_id: 4,
        };

    const res = await request(app)
      .post("/api/menu")
      .send(newMenuItem)
      .set("Accept", "application/json");
    console.log("Actual response:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(expectedMessage);
    expect(pool.__mockClient.query).toHaveBeenCalledTimes(7);


  });


    // Test that inserts an item in the menu
  test("should try to insert a new item in the menu but fail due to category not fund", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT id FROM menu_categories")) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] }); 
    });

    const expectedMessage = {
    "error": "Category not found"
    }

    const newMenuItem = {
      itemName: "Veggie Burger",
      itemDescription: "Delicious plant-based burger",
      price: 12.99,
      category: "Diet",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };

    const res = await request(app)
      .post("/api/menu")
      .send(newMenuItem)
      .set("Accept", "application/json");
    console.log("Actual response:", res.body);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual(expectedMessage);
    expect(pool.__mockClient.query).toHaveBeenCalledTimes(3);
  });

  // Test that fails to insert an item in the menu
  test("should fail to insert a new item in the menu", async () => {
    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT id FROM menu_categories")) {
        return Promise.resolve({ rows: [{ id: 2 }] });
      }
      if (sql.includes("INSERT INTO menu_items")) {
        return Promise.resolve({
          rows: [],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const expectedMessage = {
      error: "Server Error : Unable to add item to the menu.",
    };

    const newMenuItem = {
      itemName: "Veggie Burger",
      itemDescription: "Delicious plant-based burger",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: [],
    };


    const res = await request(app)
      .post("/api/menu")
      .send(newMenuItem)
      .set("Accept", "application/json");
    console.log("Actual response:", res.body);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual(expectedMessage);
    expect(pool.__mockClient.query).toHaveBeenCalledTimes(5);
  });
});

