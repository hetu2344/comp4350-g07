const express = require("express");
const {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
  removeMenuItem,
  getAnyOneItemByID,
  getAllAllergen,
} = require("../controllers/menuManagementControllers");

const router = express.Router();

// Get all Menu Items
router.get("/", getAllMenuItems);

// Create a Menu Item
router.post("/", createMenuItem);

// Get all allergens
router.get("/allergens", getAllAllergen);

// Update a menu Item
router.put("/:id", updateMenuItem);

// Remove an item from menu
router.delete("/:id",removeMenuItem);

// Get a menu item by id
router.get("/:id", getAnyOneItemByID);




module.exports = router;
