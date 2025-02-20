const express = require("express");
const {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
  removeMenuItem,
} = require("../controllers/menuManagementControllers");

const router = express.Router();

// Get all Menu Items
router.get("/", getAllMenuItems);

// Create a Menu Item
router.post("/", createMenuItem);

// Update a menu Item
router.put("/:id", updateMenuItem);

// Remove an item from menu
router.delete("/:id",removeMenuItem);


module.exports = router;
