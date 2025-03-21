const request = require("supertest");
const app = require("../../../index");
const pool = require("../../../db/db");
const { removeAllAllergens } = require("../../../models/menuManagementModel");
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
describe("Menu Mannagement Remove ALL Allergen Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Test that gets all allergens items
  test("should try to remove all allergens but fails due to an error", async () => {
    const expectedItem = [];

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
          sql.startsWith(
            "DELETE FROM menu_item_allergens WHERE menu_item_id=$1"
          )
        ) {
          return Promise.reject(new Error("Database Error"));
        }

    });

    await expect(removeAllAllergens(1)).rejects.toThrow("Database Error");
    
    expect(pool.__mockClient.query).toHaveBeenCalledWith("BEGIN");

    expect(pool.__mockClient.query).toHaveBeenCalledWith(
      "DELETE FROM menu_item_allergens WHERE menu_item_id=$1",
      [1]
    );

    expect(pool.__mockClient.query).toHaveBeenCalledWith("ROLLBACK");

    expect(pool.__mockClient.release).toHaveBeenCalled();

  });

});
