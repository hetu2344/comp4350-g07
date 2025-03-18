const express = require("express");
const router = express.Router();
const {
  createNewOrder,
  handleGetAllOrders,
  handleGetOrderByNumber,
  handleUpdateOrder,
  handleUpdateOrderStatus,
  handleAddItemToOrder,
  handleUpdateAnItemInOrder,
  handleRemoveItemFromOrder,
} = require("../controllers/orderManagementControllers");

router.post("/", createNewOrder); // Create new order
router.get("/", handleGetAllOrders); // Get all orders
router.get("/:orderNumber",handleGetOrderByNumber); // Get order by ID
router.put("/:orderNumber", handleUpdateOrder); // Update order
router.put("/:orderNumber/status",handleUpdateOrderStatus);// Update order Status
router.post("/:orderNumber/items",handleAddItemToOrder);// Add item to order
console.log("ADDING ITEM TO ORDER");
router.put("/:orderNumber/items/:itemId",handleUpdateAnItemInOrder);// Update item in order
router.delete("/:orderNumber/items/:itemId",handleRemoveItemFromOrder);// Remove item from order
// router.delete("/:orderId",orderController.deleteOrder);// Delete order

module.exports = router;

