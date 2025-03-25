const {
  insertMenuItem,
  updateItem,
  insertAllergens,
  removeAllAllergens,
  getAllItems,
  removeItem,
  getAnItemById,
  checkItemExist,
  getAllAllergens,
} = require("../models/menuManagementModel");

// Method that creates new MenuItem
async function createMenuItem(req, res) {
  console.log("Creating menu item");
  try {
    const {
      itemName,
      itemDescription,
      price,
      category,
      isAvailable,
      isVegetarian,
      isVegan,
      isGlutenFree,
      allergens,
    } = req.body;
    console.log(req.body[0]);

    // Inserting a new menu item
    const { menuItemId, menuItemName } = await insertMenuItem(
      itemName,
      itemDescription,
      price,
      category,
      isAvailable,
      isVegetarian,
      isVegan,
      isGlutenFree
    );

    // Insert allergens
    await insertAllergens(menuItemId, allergens);

    // Send Response
    res.status(201);
    res.json({
      message: `${menuItemName} added successfully.`,
      item_id: menuItemId,
    });
  } catch (err) {
    // Error
    console.log(err.message);
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    res
      .status(500)
      .json({ error: "Server Error : Unable to add item to the menu." });
  }
}

// Function that updates menu items
async function updateMenuItem(req, res) {
  console.log("Updating menu item");
  try {
    const { id } = req.params;
    const {
      itemName,
      itemDescription,
      price,
      category,
      isAvailable,
      isVegetarian,
      isVegan,
      isGlutenFree,
      allergens,
    } = req.body;

    // Checking is id is not a number
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    if (
      !itemName ||
      !itemDescription ||
      !category ||
      price <= 0 ||
      typeof isAvailable !== "boolean" ||
      typeof isVegetarian !== "boolean" ||
      typeof isVegan !== "boolean" ||
      typeof isGlutenFree !== "boolean"
    ) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    // Checking if the item exists
    const itemExist = await checkItemExist(id);

    // Updating the item
    const updatedItem = await updateItem(
      id,
      itemName,
      itemDescription,
      price,
      category,
      isAvailable,
      isVegetarian,
      isVegan,
      isGlutenFree
    );

    // Updating allergens by removing all of them and reinserting with updated ones
    await removeAllAllergens(id);
    await insertAllergens(id, allergens);

    // Send response
    res.json({ message: `${itemName} updated successfully`, item_id: id });
  } catch (err) {
    // Error
    console.error("Error while updating:", err.message);

    // Item not found
    if (
      err.message.includes("No menu item found") ||
      err.message.includes("not found")
    ) {
      return res.status(404).json({ error: "Menu item not found." });
    }
    res
      .status(500)
      .json({ error: "Server Error : Unable to update the menu item." });
  }
}

// Method that removes a menu item
async function removeMenuItem(req, res) {
  console.log("Removing menu item");
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    // Removing an item
    const removedItem = await removeItem(id);

    // Sending the response
    res.json({
      message: `${removedItem.rows[0].item_name} deleted successfully from menu!`,
      item_id: removedItem.rows[0].item_id,
    });
  } catch (err) {
    // Error
    if (err.message.includes("not found")) {
      return res.status(404).json({ message: "Menu item not found." });
    }
    res
      .status(500)
      .json({ error: "Server Error: Unable to remove menu item." });
  }
}

// Method that gets all items in menu
async function getAllMenuItems(req, res) {
  console.log("Getting all items");
  try {
    // Getting all menu items
    const allItems = await getAllItems();
    // Sending response
    res.json(allItems);
  } catch (err) {
    // Error
    if (err.message.includes("No menu items found.")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error: Unable to fetch menu item." });
  }
}

// Method that gets any one item in menu by id
async function getAnyOneItemByID(req, res) {
  console.log("Getting item by ID");
  try {
    // Getting id from params
    const { id } = req.params;

    // Checking invalid ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    // Get an item by id
    const item = await getAnItemById(id);

    // Send Response
    res.json(item);
  } catch (err) {
    // Error
    if (err.message.includes("No menu item found")) {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: "Server Error: Unable to fetch menu item." });
  }
}

// Getting all the allergens
async function getAllAllergen(req, res) {
  console.log("Getting allergens");
  try {
    // Getting all allergens
    const allAllergens = await getAllAllergens();
    // Send Response
    res.json(allAllergens);
  } catch (err) {
    // Error
    console.log(err);
    res.status(500).json({ error: "Server Error: Unable to fetch allergens." });
  }
}

// Exporting methods
module.exports = {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
  removeMenuItem,
  getAnyOneItemByID,
  getAllAllergen,
};
