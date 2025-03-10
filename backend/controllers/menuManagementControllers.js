const {
  insertMenuItem,
  updateItem,
  insertAllergens,
  removeAllAllergens,
  getAllItems,
  removeItem,
  getAnItemById,
  checkItemExist,
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
    console.log(req.body[0]);
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
    res.status(201);
    res.json({
      message: `${menuItemName} added successfully.`,
      item_id: menuItemId,
    });
  } catch (err) {
    console.log(err.message);
    if (err.message.includes("not found")){
      console.log("HIIII returnning 404")
      return res.status(404).json({error:err.message});
    }
      res
        .status(500)
        .json({ error: "Server Error : Unable to add item to the menu." });
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

    if(!id || isNaN(id)){
      return res.status(400).json({error:"Invalid item ID"});
    }
    if (
      !itemName ||
      !itemDescription ||
      !category ||
      price <= 0 ||
      typeof isAvailable !== "boolean" ||
      typeof isVegetarian !== "boolean" ||
      typeof isVegan !== "boolean" ||
      typeof isGlutenFree !== "boolean") {
        console.log(!itemName);
        console.log(!itemDescription);
        console.log(!category);
        console.log(price<=0);
        console.log(typeof isAvailable !== "boolean");
        console.log(typeof isVegetarian !== "boolean");
        console.log(typeof isVegan !== "boolean");
        console.log(typeof isGlutenFree !== "boolean");

        console.log("BOOL");
      return res.status(400).json({ error: "Invalid input provided." });
    }

    console.log("ID is ",id);
    const itemExist = await checkItemExist(id);
    
    console.log(itemExist);

    // if(!itemExist || itemExist.length === 0 ){
    //   return res.status(404).json({error:`Menu item with ID ${id} not found.`});
    // }

     const updatedItem= await updateItem(
        id,
        itemName,
        itemDescription,
        price,
        category,
        isAvailable,
        isVegetarian,
        isVegan,
        isGlutenFree,
      );

      console.log("UPDATE ITEM",updatedItem)
      if(updatedItem.rowCount===0){
        return res.status(404).json({error:"Menu item not found."});
      }

      console.log("ALLERGENS", allergens);


    await removeAllAllergens(id);
    if (allergens && allergens.length > 0) {
      await insertAllergens(id, allergens);
    }

    res.json({ message: `${itemName} updated successfully`,item_id:id });
  } catch (err) {
    console.error("Error while updating:",err.message);
    if (err.message.includes("No menu item found")|| err.message.includes("not found")){
      return res.status(404).json({ error: "Menu item not found." });
    }
      res
        .status(500)
        .json({ error: "Server Error : Unable to update the menu item." });
  }
}

// Method that removes a menu item
async function removeMenuItem(req, res) {
  try {
    const { id } = req.params;

      if (!id || isNaN(id)) {
          return res.status(400).json({ error: "Invalid item ID." });
        }

    const removedItem = await removeItem(id);

    res.json({
      message: `${removedItem.rows[0].item_name} deleted successfully from menu!`,
      item_id:removedItem.rows[0].item_id
    });
  } catch (err) {
    // console.error(err.message);
    if(err.message.includes("not found")){
     return res.status(404).json({ message: "Menu item not found." });
    }
    res
      .status(500)
      .json({ error: "Server Error: Unable to remove menu item." });
  }
}

// Method that gets all items in menu
async function getAllMenuItems(req, res) {
  try {
    const allItems = await getAllItems();
    res.json(allItems);
  } catch (err) {
    console.log(err);

    if (err.message.includes("No menu items found.")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Server Error: Unable to fetch menu item." });
  }
}

// Method that gets any one item in menu by id
async function getAnyOneItemByID(req, res) {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Invalid item ID." });
    }

    const item = await getAnItemById(id);

    res.json(item);
  } catch (err) {
    console.log(err);
    if (err.message.includes("No menu item found")) {
      return res.status(404).json({ error: err.message });
    }

    res.status(500).json({ error: "Server Error: Unable to fetch menu item." });
  }
}

module.exports = {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
  removeMenuItem,
  getAnyOneItemByID,
};
