const express = require("express");
const {
  createMenuItem,
  updateMenuItem,
  getAllMenuItems,
} = require("../controllers/menuManagementControllers");

const router = express.Router();

// Get all Menu Items
router.get("/", getAllMenuItems);

// Create a Menu Item
router.post("/", createMenuItem);

// Update a menu Item
router.put("/:id", updateMenuItem);

module.exports = router;
