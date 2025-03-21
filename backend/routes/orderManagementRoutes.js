const express = require("express");
const router = express.Router();
const {
  handleCreateNewOrder,
  handleGetAllOrders,
  handleGetOrderByNumber,
  handleUpdateOrder,
  handleUpdateOrderStatus,
  handleAddItemToOrder,
  handleUpdateAnItemInOrder,
  handleRemoveItemFromOrder,
  // handleDeleteOrder,
  protectedDeleteOrder,
} = require("../controllers/orderManagementControllers");

// Create new order
router.post("/", handleCreateNewOrder); 

 // Get all orders
router.get("/", handleGetAllOrders);

 // Get order by ID
router.get("/:orderNumber",handleGetOrderByNumber);

 // Update order
router.put("/:orderNumber", handleUpdateOrder);

// Update order Status
router.put("/:orderNumber/status",handleUpdateOrderStatus);

// Add item to order
router.post("/:orderNumber/items",handleAddItemToOrder);

// Update item in order
router.put("/:orderNumber/items/:itemId",handleUpdateAnItemInOrder);

// Remove item from order
router.delete("/:orderNumber/items/:itemId",handleRemoveItemFromOrder);

// Delete order
router.delete("/:orderNumber",protectedDeleteOrder);

module.exports = router;

