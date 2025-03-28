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
describe("Menu Mannagement API Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("should successfully update a menu item", async () => {
    const updatedItem = {
      itemName: "Updated Pizza",
      itemDescription: "New pizza description",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy","Gluten"],
    };

    const expectedResponse = {
      message: "Updated Pizza updated successfully",
      item_id: "1",
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [
            {
              item_id: 1,
              item_name: "Margherita Pizza",
              item_description:
                "Classic pizza with mozzarella, tomatoes, and basil.",
              price: "12.99",
              category_id: 2,
              is_available: true,
              is_vegetarian: true,
              is_vegan: false,
              is_gluten_free: false,
              created_at: "2025-02-24T18:38:18.273Z",
            },
          ],
        });
      }
      if (sql.includes("SELECT id FROM menu_categories WHERE name")) {
        return Promise.resolve({ rows: [{ id: 2 }] });
      }
      return Promise.resolve({ rows: [] });
    });

    // Make the API request
    const res = await request(app)
      .put("/api/menu/1")
      .send(updatedItem)
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expectedResponse);
    expect(pool.__mockClient.query).toHaveBeenCalledTimes(14);
  });


  test("should return 404 if menu item does not exist", async () => {
    const updatedItem = {
      itemName: "Non-Existent Item",
      itemDescription: "This item does not exist.",
      price: 9.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };

    pool.__mockClient.query.mockImplementation((sql, params) => {
      if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
        return Promise.resolve({
          rows: [{ error: "Menu item with ID 10 not found." }],
        });
      }

      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .put("/api/menu/10")
      .send(updatedItem)
      .set("Accept", "application/json");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Menu item not found." });
  });


  
 test("should return 400 if id is not in correct format while updating", async () => {
   const updatedItem = {
     itemName: "Non-Existent Item",
     itemDescription: "This item does not exist.",
     price: 9.99,
     category: "Main Course",
     isAvailable: true,
     isVegetarian: false,
     isVegan: false,
     isGlutenFree: false,
     allergens: ["Dairy"],
   };

   const res = await request(app)
     .put("/api/menu/abc")
     .send(updatedItem)
     .set("Accept", "application/json");

   expect(res.statusCode).toBe(400);
   expect(res.body).toEqual({ error: "Invalid item ID" });
 });

 test("should return 500 and fail updating if database update fails", async () => {
   const updatedItem = {
     itemName: "Margherita Pizza with Error",
     itemDescription: "This will cause an error.",
     price: 8.99,
     category: "Main Course",
     isAvailable: true,
     isVegetarian: false,
     isVegan: false,
     isGlutenFree: false,
     allergens: [""],
   };

   const mockClient = {
     query: jest.fn().mockRejectedValue(new Error("Database Error")),
     release: jest.fn(),
   };

   pool.connect.mockResolvedValue(mockClient);

   const res = await request(app)
     .put("/api/menu/1")
     .send(updatedItem)
     .set("Accept", "application/json");

   expect(res.statusCode).toBe(500);
   expect(res.body).toEqual({
     error: "Server Error : Unable to update the menu item.",
   });
 });

 test("should return 400 if invalid input is provided", async () => {
   const invalidItem = {
     itemName: "", // Empty name (invalid)
     itemDescription: "Invalid description",
     price: -1, // Negative price (invalid)
     category: "",
     isAvailable: true,
     isVegetarian: false,
     isVegan: false,
     isGlutenFree: false,
     allergens: [],
   };

   const res = await request(app)
     .put("/api/menu/1")
     .send(invalidItem)
     .set("Accept", "application/json");

   expect(res.statusCode).toBe(400);
   expect(res.body).toEqual({ error: "Invalid input provided." });
 });


 test("should successfully update a menu item", async () => {
   const updatedItem = {
     itemName: "Updated Pizza",
     itemDescription: "New pizza description",
     price: 12.99,
     category: "Main Course",
     isAvailable: true,
     isVegetarian: true,
     isVegan: false,
     isGlutenFree: false,
     allergens: ["Dairy", "Gluten"],
   };

   const expectedResponse = {
     error: "Server Error : Unable to update the menu item.",
   };

   pool.__mockClient.query.mockImplementation((sql, params) => {
     if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
       return Promise.resolve({
         rows: [
           {
             item_id: 1,
             item_name: "Margherita Pizza",
             item_description:
               "Classic pizza with mozzarella, tomatoes, and basil.",
             price: "12.99",
             category_id: 2,
             is_available: true,
             is_vegetarian: true,
             is_vegan: false,
             is_gluten_free: false,
             created_at: "2025-02-24T18:38:18.273Z",
           },
         ],
       });
     }
     if (sql.includes("SELECT id FROM menu_categories WHERE name")) {
       return Promise.resolve({ rows: [{ id: 2 }] });
     }

     if (
       sql.include(
         "INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))"
       )
     )
       return Promise.reject(new Error("Database Error"));
   });

   // Make the API request
   const res = await request(app)
     .put("/api/menu/1")
     .send(updatedItem)
     .set("Accept", "application/json");

   expect(res.statusCode).toBe(500);
   expect(res.body).toEqual(expectedResponse);
 });


 test("should fail to update a menu item", async () => {
   const updatedItem = {
     itemName: "Updated Pizza",
     itemDescription: "New pizza description",
     price: 12.99,
     category: "Main Course",
     isAvailable: true,
     isVegetarian: true,
     isVegan: false,
     isGlutenFree: false,
     allergens: ["Dairy", "Gluten"],
   };

   const expectedResponse = {
     error: "Server Error : Unable to update the menu item.",
   };

   pool.__mockClient.query.mockImplementation((sql, params) => {
     if (sql.includes("SELECT * FROM menu_items WHERE item_id")) {
       return Promise.reject(new Error("Database Error"));
     }
     if (sql.includes("SELECT id FROM menu_categories WHERE name")) {
       return Promise.resolve({ rows: [{ id: 2 }] });
     }

     if (
       sql.include(
         "INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))"
       )
     )
       return Promise.reject(new Error("Database Error"));
   });

   // Make the API request
   const res = await request(app)
     .put("/api/menu/1")
     .send(updatedItem)
     .set("Accept", "application/json");

   expect(res.statusCode).toBe(500);
   expect(res.body).toEqual(expectedResponse);
 });


  
});