const request = require("supertest");
const app = require("../../../index");
const pool = require("../../../db/db");
const { checkItemExist } = require("../../../models/menuManagementModel");
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
describe("Menu Mannagement Check Item Exists Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("should throw an error if menu item does not exist", async () => {
    pool.__mockClient.query.mockResolvedValue({ rowCount: 0, rows: [] });

    await expect(checkItemExist(999)).rejects.toThrow("Menu item not found.");

    expect(pool.__mockClient.query).toHaveBeenCalledWith(
      "SELECT * FROM menu_items WHERE item_id = $1",
      [999]
    );

    expect(pool.__mockClient.release).toHaveBeenCalled();
  });
});
