const pool = require("../db/db");

async function insertMenuItem(
  itemName,
  itemDescription,
  price,
  category,
  isAvailable,
  isVegetarian,
  isVegan,
  isGlutenFree
) {
  console.log("itemName", itemName);
  console.log("itemDescription", itemDescription);
  console.log("price", price);
  console.log("Category", category);
  console.log("isAvailable", isAvailable);
  console.log("isVegetarian", isVegetarian);
  console.log("isVegan", isVegan);
  console.log("isGlutenFree ", isGlutenFree);

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const categoryResult = await client.query(
      `SELECT id FROM menu_categories WHERE name = $1 FOR UPDATE`,
      [category]
    );

    if (categoryResult.rows.length === 0) {
      throw new Error("Category not found");
    }
    const categoryId = categoryResult.rows[0].id;

    const result = await client.query(
      `INSERT INTO menu_items (item_name,item_description,price,category_id,is_available,is_vegetarian,is_vegan,is_gluten_free) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING item_id,item_name`,
      [
        itemName,
        itemDescription,
        price,
        categoryId,
        isAvailable,
        isVegetarian,
        isVegan,
        isGlutenFree,
      ]
    );

    await client.query("COMMIT");

    return {
      menuItemId: result.rows[0].item_id,
      menuItemName: result.rows[0].item_name,
    };
  } catch (error) {
    if (client){
    await client.query("ROLLBACK");
    }
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    if(client){
      client.release();
    }
  }
}

// Method that makes SQL query to update menu item
async function updateItem(
  itemId,
  itemName,
  itemDescription,
  price,
  category,
  isAvailable,
  isVegetarian,
  isVegan,
  isGlutenFree
) {

  let client;
  try {
    client = await pool.connect();

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE menu_items SET item_name=$1,item_description=$2,price=$3,category_id=(SELECT id FROM menu_categories WHERE name=$4), is_available= $5 , is_vegetarian=$6,is_vegan=$7,is_gluten_free=$8 WHERE item_id=$9`,
      [
        itemName,
        itemDescription,
        price,
        category,
        isAvailable,
        isVegetarian,
        isVegan,
        isGlutenFree,
        itemId,
      ]
    );
    await client.query("COMMIT");

    return result;
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Method that makes SQL query to remove all allergens for menu item
async function removeAllAllergens(itemId) {
  let client;
  try {
    client = await pool.connect();

    await client.query("BEGIN");

    const result = await client.query(
      "DELETE FROM menu_item_allergens WHERE menu_item_id=$1",
      [itemId]
    );

    await client.query("COMMIT");

    return result;
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Method that makes SQL query to Insert new allergens for menu item
async function insertAllergens(itemId, allergens) {
  let client;
  try {
    client = await pool.connect();

    await client.query("BEGIN");
    for (const allergenName of allergens) {
      await client.query(
        `INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))`,
        [itemId, allergenName]
      );

    }
      await client.query("COMMIT");

  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
  }


// Method that gets all the items in the menu
async function getAllItems() {
  try {
    const result = await pool.query("SELECT * FROM menu_items");
    return result.rows;
  } catch (err) {
    console.error("Error fetching menu items:", err);
    throw err;
  }
}

module.exports = {
  insertAllergens,
  removeAllAllergens,
  updateItem,
  insertMenuItem,
  getAllItems,
};
