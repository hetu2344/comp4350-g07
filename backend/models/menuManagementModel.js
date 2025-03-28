const pool = require("../db/db");

// Method that makes SQL query to insert new menu item
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

  let client;
  try {
    client = await pool.connect();

    // Transaction
    await client.query("BEGIN");

    // SELECT Query to get category
    const categoryResult = await client.query(
      `SELECT id FROM menu_categories WHERE name = $1 FOR UPDATE`,
      [category]
    );
    
    // If category not found
    if (categoryResult.rows.length === 0) {
      throw new Error("Category not found");
    }

    // Get category id
    const categoryId = categoryResult.rows[0].id;

    // INSERT Query
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

    //COMMIT TRANSACTION
    await client.query("COMMIT");

    // Return the inserted menu item
    return {
      menuItemId: result.rows[0].item_id,
      menuItemName: result.rows[0].item_name,
    };
  } catch (error) {
    // ERROR

    // ROLLBACK TRANSACTION
      await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    // RELEASE CLIENT
      client.release();
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

    // Transaction
    await client.query("BEGIN");

    // SELECT Query TO GET CATEGORY
    const categoryResult=await client.query(`SELECT id FROM menu_categories WHERE name=$1 FOR UPDATE`,[category]);

    // If category not found
    if(!categoryResult || categoryResult.rows.length===0){
      throw new Error(`Category ${category} not found.`);
    }

    // Get category id
    const categoryId=categoryResult.rows[0].id;
    // UPDATE Query
    const result = await client.query(
      `UPDATE menu_items SET item_name=$1,item_description=$2,price=$3,category_id=$4, is_available= $5 , is_vegetarian=$6,is_vegan=$7,is_gluten_free=$8 WHERE item_id=$9`,
      [
        itemName,
        itemDescription,
        price,
        categoryId,
        isAvailable,
        isVegetarian,
        isVegan,
        isGlutenFree,
        itemId,
      ]
    );

  
    // COMMIT TRANSACTION
    await client.query("COMMIT");
    
    //  Return the updated menu item 
    return result;

  } catch (error) {
    // ERROR
    // ROLLBACK TRANSACTION
      await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    // RELEASE CLIENT
      client.release();
  }
}

// Method that makes SQL query to remove all allergens for menu item
async function removeAllAllergens(itemId) {
  let client;
  try {

    client = await pool.connect();

    // Transaction
    await client.query("BEGIN");

    // DELETE Query
    const result = await client.query(
      "DELETE FROM menu_item_allergens WHERE menu_item_id=$1",
      [itemId]
    );

    // COMMIT TRANSACTION
    await client.query("COMMIT");
    
    // Return the result
    return result;
  } catch (error) {
    // ERROR
    // ROLLBACK TRANSACTION
      await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
    // RELEASE CLIENT
      client.release();
  }
}

// Method that makes SQL query to Insert new allergens for menu item
async function insertAllergens(itemId, allergens) {
  let client;
  try {
    client = await pool.connect();

    // Transaction
    await client.query("BEGIN");
    let insertCount=0;
    // Loop through allergens
    for (const allergenName of allergens) {
      // INSERT Query
      const result=await client.query(
        `INSERT INTO menu_item_allergens (menu_item_id,allergen_id) VALUES ($1, (SELECT id FROM menu_allergens WHERE name = $2))`,
        [itemId, allergenName]
      );

      // If allergen inserted
      if(result.rowCount>0){
        insertCount++;
      }
    }
    // COMMIT TRANSACTION
    await client.query("COMMIT");

    // Return the count of inserted allergens
    return insertCount;
  } catch (error) {
    // ERROR
    // ROLLBACK TRANSACTION
      await client.query("ROLLBACK");
    throw error;
  } finally {
    // RELEASE CLIENT
      client.release();
  }
}

// Method that checks if an item exists
async function checkItemExist(id,){
  let client;
  try {
    client = await pool.connect();

    // Transaction
    await client.query("BEGIN");

    // SELECT Query
    const result = await client.query(
      "SELECT * FROM menu_items WHERE item_id = $1",
      [id]
    );

    // if got no menu items
    if (result.rowCount===0) {
         throw new Error(`Menu item not found.`);
       }

      //  COMMIT TRANSACTION
      await client.query("COMMIT");
    return result.rows;
  } catch (error) {
    // ERROR
      await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw error;
  } finally {
      client.release();
  }
}

// Method that removes and item from menu_items table
async function removeItem(id) {
  try {
    // DELETE Query
    const result = await pool.query(
      "DELETE FROM menu_items WHERE item_id=$1 RETURNING *",
      [id]
    );
    // If no item found
    if(result.rows.length===0){
      throw new Error(`Item with id = ${id} not found.`)
    }

    // Return the result
    return result;
  } catch (err) {
    // ERROR
    console.error("Error removing menu item:", err);
    throw err;
  }
}

// Method that gets all the items in the menu
async function getAllItems() {
  try {
    // SELECT Query
    const result = await pool.query(
      `SELECT mi.*,c.name AS category_name,
      ARRAY_REMOVE(ARRAY_AGG(a.name),NULL) AS allergens 
      FROM menu_items AS mi 
      LEFT JOIN menu_categories AS c ON mi.category_id=c.id 
      LEFT JOIN menu_item_allergens AS mia ON mi.item_id=mia.menu_item_id 
      LEFT JOIN menu_allergens AS a ON mia.allergen_id=a.id 
      GROUP BY mi.item_id,c.name`
    );

    // If no menu items found
      if (result.rows.length === 0) {
          throw new Error(`No menu items found.`);
        }

    // Return the menu items
    return result.rows;
  } catch (err) {
    // ERROR
    console.error("Error fetching menu items:", err);
    throw err;
  }
}

// Method that gets any one item by id
async function getAnItemById(id) {
  try {
    // SELECT Query
    const result = await pool.query(
      `SELECT mi.*,c.name AS category_name,
      ARRAY_REMOVE(ARRAY_AGG(a.name),NULL) AS allergens 
      FROM menu_items AS mi 
      LEFT JOIN menu_categories AS c ON mi.category_id=c.id 
      LEFT JOIN menu_item_allergens AS mia ON mi.item_id=mia.menu_item_id 
      LEFT JOIN menu_allergens AS a ON mia.allergen_id=a.id 
      WHERE mi.item_id=$1      
      GROUP BY mi.item_id,c.name`,
      [id]
    );

    // If no menu item found
    if(!result || result.rows.length === 0){
      throw new Error(`No menu item found with ID: ${id}`);
    }

    // Return the menu item
    return result.rows;
  } catch (err) {
    // ERROR
    throw err;
  }
}

// Method that gets all allergens
async function getAllAllergens() {
  try {
    // SELECT Query
    const result = await pool.query("SELECT * FROM menu_allergens");

    // return the allergens
    return result.rows;
  } catch (err) {
    // ERROR
    console.error("Error fetching allergens:", err);
    throw err;
  }
}

module.exports = {
  insertAllergens,
  removeAllAllergens,
  updateItem,
  insertMenuItem,
  getAllItems,
  removeItem,
  getAnItemById,
  checkItemExist,
  getAllAllergens,
};
