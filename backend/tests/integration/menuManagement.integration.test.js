const request = require("supertest");
const app = require("../../index");
const pool = require("../../db/test_db");
const { resetTestDatabase } = require("../testHelpers");
const TIMESTAMP = "2025-03-19T05:20:59.268Z";

describe("Integration Test: Menu API", () => {
  jest.setTimeout(30000);
  beforeAll(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/menu gets all item in menu an order", async () => {
    const response = await request(app).get("/api/menu/");
    expect(response.statusCode).toBe(200);
    expectedResponse = [
      {
        item_id: 1,
        item_name: "Margherita Pizza",
        item_description: "Classic pizza with mozzarella, tomatoes, and basil.",
        price: 12.99,
        category_id: 2,
        is_available: true,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        created_at: TIMESTAMP,
        category_name: "Main Course",
        allergens: [],
      },
      {
        item_id: 2,
        item_name: "Vegan Buddha Bowl",
        item_description: "Quinoa, chickpeas, avocado, and tahini dressing.",
        price: 11.99,
        category_id: 2,
        is_available: true,
        is_vegetarian: false,
        is_vegan: true,
        is_gluten_free: true,
        created_at: TIMESTAMP,
        category_name: "Main Course",
        allergens: [],
      },
      {
        item_id: 3,
        item_name: "Cheesecake",
        item_description:
          "Rich and creamy cheesecake topped with strawberries.",
        price: 6.49,
        category_id: 3,
        is_available: true,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        created_at: TIMESTAMP,
        category_name: "Dessert",
        allergens: [],
      },
    ];
    expect(response.body).toEqual(expectedResponse);
  });

  test("POST /api/menu creates a menu item", async () => {
    const reqBody = {
      itemName: "Veggie Burger",
      itemDescription: "Delicious plant-based burger",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };

    const response = await request(app).post("/api/menu/").send(reqBody);
    expect(response.statusCode).toBe(201);
    expectedResponse = {
      message: "Veggie Burger added successfully.",
      item_id: 4,
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("POST /api/menu creates a menu item but fails due to missing category", async () => {
    const reqBody = {
      itemName: "Veggie Burger",
      itemDescription: "Delicious plant-based burger",
      price: 12.99,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };

    const response = await request(app).post("/api/menu/").send(reqBody);
    expect(response.statusCode).toBe(404);
    expectedResponse = {
      error: "Category not found",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/menu/allergens gives all menu allergens", async () => {
    const response = await request(app).get("/api/menu/allergens");
    expect(response.statusCode).toBe(200);
    expectedResponse = [
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
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/menu/1 updates a menu item", async () => {
    const reqBody = {
      itemName: "Updated Pizza",
      itemDescription: "New pizza description",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };
    const response = await request(app).put("/api/menu/1").send(reqBody);
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Updated Pizza updated successfully",
      item_id: "1",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/menu/abc updates a menu item but fails due to invalid id", async () => {
    const reqBody = {
      itemName: "Updated Pizza",
      itemDescription: "New pizza description",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };
    const response = await request(app).put("/api/menu/abc").send(reqBody);
    expect(response.statusCode).toBe(400);
    expectedResponse = {
      error: "Invalid item ID",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("PUT /api/menu/1 updates a menu item but fails with 404", async () => {
    const reqBody = {
      itemName: "Updated Pizza",
      itemDescription: "New pizza description",
      price: 12.99,
      category: "Main Course",
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ["Dairy"],
    };
    const response = await request(app).put("/api/menu/5").send(reqBody);
    expect(response.statusCode).toBe(404);
    expectedResponse = {
      error: "Menu item not found.",
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("GET /api/menu/3 gets a menu item with id", async () => {
    const response = await request(app).get("/api/menu/3");
    // expect(response.statusCode).toBe(200);
    expectedResponse = [
      {
        item_id: 3,
        item_name: "Cheesecake",
        item_description:
          "Rich and creamy cheesecake topped with strawberries.",
        price: 6.49,
        category_id: 3,
        is_available: true,
        is_vegetarian: true,
        is_vegan: false,
        is_gluten_free: false,
        created_at: TIMESTAMP,
        category_name: "Dessert",
        allergens: [],
      },
    ];
    expect(response.body).toEqual(expectedResponse);
  });

  test("DELETE /api/menu/3 deletes a menu item", async () => {
    const response = await request(app).delete("/api/menu/3");
    expect(response.statusCode).toBe(200);
    expectedResponse = {
      message: "Cheesecake deleted successfully from menu!",
      item_id: 3,
    };
    expect(response.body).toEqual(expectedResponse);
  });

  test("DELETE /api/menu/5 deletes a menu item but fails due to item not found", async () => {
    const response = await request(app).delete("/api/menu/5");
    expect(response.statusCode).toBe(404);
    expectedResponse = {
      message: "Menu item not found.",
    };
    expect(response.body).toEqual(expectedResponse);
  });
});
