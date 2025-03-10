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
describe("Menu Mannagement GET ALL Allergen API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all allergens items
  test("should return all allergens along with category name and a list of allergens", async () => {
    const expectedItem = [
      {
        id: 1,
        name: "Dairy",
      },
      {
        id: 2,
        name: "Gluten",
      },
      {
        id: 3,
        name: "Eggs",
      },
      {
        id: 4,
        name: "Soy",
      },
      {
        id: 5,
        name: "Peanuts",
      },
      {
        id: 6,
        name: "Tree Nuts",
      },
      {
        id: 7,
        name: "Shellfish",
      },
      {
        id: 8,
        name: "Fish",
      },
    ];

    pool.query.mockResolvedValue({ rows: expectedItem });

    const res = await request(app).get("/api/menu/allergens");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedItem);
    expect(pool.query).toHaveBeenCalledTimes(1);
  });


    // Test that gets all allergens
    test("should fail to return all allergens and return 500", async () => {
      pool.query.mockRejectedValue(new Error("Database Connection Failed"));

      const res = await request(app).get("/api/menu/allergens");

      const errorMsg = {
        error: "Server Error: Unable to fetch allergens.",
      };

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual(errorMsg);
    });
});