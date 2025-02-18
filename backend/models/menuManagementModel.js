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
  const result = await pool.query(
    `INSERT INTO menu_items (item_name,item_description,price,category_id,is_available,is_vegetarian,is_vegan,is_gluten_free) VALUES ($1,$2,$3,(SELECT id FROM menu_categories WHERE name= $4),$5,$6,$7,$8) RETURNING item_id,item_name`,
    [
      itemName,
      itemDescription,
      price,
      category,
      isAvailable,
      isVegetarian,
      isVegan,
      isGlutenFree,
    ]
  );

  return {
    menuItemId: result.rows[0].item_id,
    menuItemName: result.rows[0].item_name,
  };
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
  return await pool.query(
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
}

// Method that makes SQL query to remove all allergens for menu item
async function removeAllAllergens(itemId) {
  return await pool.query(
    "DELETE FROM menu_item_allergens WHERE menu_item_id=$1",
    [itemId]
  );
}

// Method that makes SQL query to Insert new allergens for menu item
async function insertAllergens(itemId, allergens) {
  for (const allergenName of allergens) {
    await pool.query(
      `INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))`,
      [itemId, allergenName]
    );
  }
}

// Method that gets all the items in the menu
async function getAllItems(){
  const result= await pool.query("SELECT * FROM menu_items");
  return result.rows;
}

module.exports = {
  insertAllergens,
  removeAllAllergens,
  updateItem,
  insertMenuItem,
  getAllItems
};
