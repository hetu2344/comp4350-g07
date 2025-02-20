const {
  insertMenuItem,
  updateItem,
  insertAllergens,
  removeAllAllergens,
  getAllItems
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

async function getAllMenuItems(req,res){
    try {
      const allItems = await getAllItems();
      res.json(allItems);
    } catch (err) {
      console.log(err);
      console.log("an error occured");
    }
}

module.exports = { createMenuItem, updateMenuItem,getAllMenuItems};
