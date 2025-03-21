const request = require("supertest");
const app = require("../../../index");
const pool = require("../../../db/db");
const { insertAllergens } = require("../../../models/menuManagementModel");
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
describe("Menu Mannagement Insert ALL Allergen Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all allergens items
  test("should try to insert allergens but fails due to an error", async () => {

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.startsWith("BEGIN")) {
        return Promise.resolve();
      }

      if (sql.startsWith("COMMIT")) {
        return Promise.resolve();
      }

      if (sql.startsWith("ROLLBACK")) {
        return Promise.resolve();
      }

      if (
        sql.startsWith("INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))")
      ) {
        return Promise.reject(new Error("Database Error"));
      }
    });

    await expect(insertAllergens(1,["Dairy"])).rejects.toThrow("Database Error");

    expect(pool.__mockClient.query).toHaveBeenCalledWith("BEGIN");

    expect(pool.__mockClient.query).toHaveBeenCalledWith(
     `INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))`,
        [1, "Dairy"]
    );

    expect(pool.__mockClient.query).toHaveBeenCalledWith("ROLLBACK");

    expect(pool.__mockClient.release).toHaveBeenCalled();
  });
});
