const {
  insertMenuItem,
  updateItem,
  insertAllergens,
  removeAllAllergens,
  getAllItems,
  removeItem,
  getAnItemById,
} = require("../models/menuManagementModel");

// Method that creates new MenuItem
async function createMenuItem(req, res) {
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
    console.log(itemName);
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

    if (allergens && allergens.length > 0) {
      await insertAllergens(menuItemId, allergens);
    }

    res.json({ message: `${menuItemName} added successfully.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error : Unable to add item to the menu.");
  }
}

// Function that updates menu items
async function updateMenuItem(req, res) {
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

    await updateItem(
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

    await removeAllAllergens(id);

    if (allergens && allergens.length > 0) {
      await insertAllergens(id, allergens);
    }

    res.json({ message: `${itemName} updated successfully` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error : Unable to update the menu item.");
  }
}

// Method that removes a menu item
async function removeMenuItem(req, res) {
  try {
    const { id } = req.params;

    const removedItem = await removeItem(id);

    if (removedItem.rowCount == 0) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    res.json({
      message: `${removedItem.rows[0].item_name} deleted successfully from menu!`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error: Unable to remove menu item.");
  }
}

// Method that gets all items in menu
async function getAllMenuItems(req, res) {
  try {
    const allItems = await getAllItems();
    res.json(allItems);
  } catch (err) {
    console.log(err);
    console.log("an error occured");
  }
}

// Method that gets any one item in menu by id
async function getAnyOneItemByID(req, res) {
  try {
      const { id } = req.params;

    const item = await getAnItemById(id);
    res.json(item);
  } catch (err) {
    console.log(err);
    console.log("an error occured");
  }
}


module.exports = {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
  removeMenuItem,
  getAnyOneItemByID,
};
