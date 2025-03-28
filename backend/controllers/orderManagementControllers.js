const { authenticateToken, authorizeRoles } = require("./authController");
const {
  createNewOrderWithItems,
  getAllOrders,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
  addItemToOrder,
  updateAnItemInOrder,
  removeItemFromOrder,
  deleteOrder,
} = require("../models/orderManagementModel");

// Method that creates new MenuItem
async function handleCreateNewOrder(req, res) {
  console.log("Creating New Order");
  try {
    const {
      storeId,
      orderType,
      tableNum,
      customerName,
      specialInstructions,
      createdBy,
      items,
    } = req.body;

    // Checking the parameters coming in
    if (
      !storeId ||
      !orderType ||
      !createdBy ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: storeId, orderType, createdBy, items",
      });
    }

    if (orderType !== "Dine-In" && orderType !== "Take-Out") {
      return res.status(400).json({
        error: "Invalid order type. Allowed types: Dine-In, Take-Out",
      });
    }

    let checkedTableNum = null;
    let checkedCustomerName = null;

    // Checking if Dine In orders have table numbers and takeout orders have customer name
    if (orderType === "Dine-In") {
      if (!tableNum) {
        return res
          .status(400)
          .json({ error: "Table number is required for Dine-In orders." });
      }
      checkedTableNum = tableNum;
    } else if (orderType === "Take-Out") {
      if (!customerName) {
        return res
          .status(400)
          .json({ error: "Customer name is required for Take-Out orders." });
      }
      checkedCustomerName = customerName;
    }

    // Create a new order
    const newOrder = await createNewOrderWithItems(
      storeId,
      orderType,
      checkedTableNum,
      checkedCustomerName,
      specialInstructions,
      createdBy,
      items
    );

    // Sending Response
    res
      .status(201)
      .json({ message: "Order created successfully.", order: newOrder });
  } catch (err) {
    // Error
    console.log(err.message);
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

// Method that gets all the order
async function handleGetAllOrders(req, res) {
  try {
    // Getting orders
    const result = await getAllOrders();
    // Sending response
    res.status(200).json(result);
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
}

// Getting order by number
async function handleGetOrderByNumber(req, res) {
  try {
    // Getting order numer requested from param
    const orderNumber = req.params.orderNumber;

    // Regex to check the order number
    const regex = /^(TAKE|DINE)-\d+$/;

    // Checking format of order number
    if (!regex.test(orderNumber)) {
      console.log("Invalid Order Number");
      return res.status(400).json({ error: "Invalid Order Number" });
    }

    // Getting order by number
    const result = await getOrderByNumber(orderNumber);

    // Sending Response
    res.status(200).json(result);
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Method that updates orders
async function handleUpdateOrder(req, res) {
  try {
    // Getting order number
    const orderNumber = req.params.orderNumber;
    const { table_num, customer_name, specialInstructions } = req.body;

    // Regex to check order number
    const regex = /^(TAKE|DINE)-\d+$/;

    // check order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid Order Number" });
    }

    const updatedDetails = {
      table_num,
      customer_name,
      specialInstructions,
    };

    // Updating Order
    const result = await updateOrder(orderNumber, updatedDetails);

    // Sending response
    res
      .status(200)
      .json({ message: "Order updated successfully", order: result });
  } catch (error) {
    // Error
    console.log(error.message);
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Updating order status
async function handleUpdateOrderStatus(req, res) {
  try {
    // Getting order number
    const orderNumber = req.params.orderNumber;
    const { updatedStatus, changedBy } = req.body;

    const validStatus = ["Active", "Completed", "Cancelled"];

    // Regex to check order number
    const regex = /^(TAKE|DINE)-\d+$/;

    // Check order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid order number format" });
    }

    // Checking if status has been given in the request
    if (!updatedStatus) {
      return res.status(400).json({ error: "Status is required" });
    }

    // Checking if the status is not same
    if (!validStatus.includes(updatedStatus)) {
      return res.status(400).json({ error: "Invalid Status" });
    }

    // Checking who is updating status
    if (!changedBy) {
      return res.status(400).json({ error: "Changed By is required" });
    }

    // Updating the order status in the database
    const updateOrder = await updateOrderStatus(
      orderNumber,
      updatedStatus,
      changedBy
    );

    // Sending the response
    res.status(200).json({
      message: "Order Status updated successfully",
      order: updateOrder,
    });
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Adding item to order
async function handleAddItemToOrder(req, res) {
  try {
    // getting order number
    const orderNumber = req.params.orderNumber;
    const { menuItemId, quantity, createdBy } = req.body;

    // Regex to check order number type
    const regex = /^(TAKE|DINE)-\d+$/;

    // Check order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid order number format" });
    }

    // Checking valid quantity
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity should be greater than 0" });
    }

    // Checking valid params
    if (!menuItemId || !quantity || !createdBy) {
      return res.status(400).json({
        error: "Missing required details: menu_item_id, quantity, createdBy",
      });
    }
    // Adding item to order
    const result = await addItemToOrder(
      orderNumber,
      menuItemId,
      quantity,
      createdBy
    );
    // Send response
    res.status(201).json({ message: "Item added successfully", order: result });
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Update Item in an order only quantity and price
async function handleUpdateAnItemInOrder(req, res) {
  console.log("Updating Item in Order");
  try {
    // Getting required params
    const { orderNumber, itemId } = req.params;

    // Getting body
    const { quantity, newPrice } = req.body;

    const intItemId = Number(itemId);

    // regex to check order number
    const regex = /^(TAKE|DINE)-\d+$/;

    // Checking order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid Order Number" });
    }

    // Quantity should be valid
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Quantity should be greater than 0" });
    }

    // Checking params
    if (!intItemId || !quantity || !newPrice) {
      return res.status(400).json({
        error: "Missing required details: itemId, quantity, newPrice",
      });
    }

    // Updating order
    const updatedOrder = await updateAnItemInOrder(
      orderNumber,
      intItemId,
      quantity,
      newPrice
    );

    // Sending response
    res
      .status(200)
      .json({ message: "Item updated successfully", order: updatedOrder });
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Removing item from order
async function handleRemoveItemFromOrder(req, res) {
  try {
    // Getting params
    const { orderNumber, itemId } = req.params;
    const { removedBy } = req.body;

    // Regex to chek order number
    const regex = /^(TAKE|DINE)-\d+$/;
    const intItemId = Number(itemId);

    // Checkingg order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid Order Number" });
    }

    // Checking params as required
    if (!intItemId || !removedBy) {
      return res
        .status(400)
        .json({ error: "Missing required details: itemId, removedBy" });
    }

    // Removing item from order
    const updatedOrder = await removeItemFromOrder(
      orderNumber,
      intItemId,
      removedBy
    );

    // Sending response
    res
      .status(200)
      .json({ message: "Item removed successfully", order: updatedOrder });
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Handling delete order
async function handleDeleteOrder(req, res) {
  try {
    // Getting order number
    const { orderNumber } = req.params;

    // Regex to check order number
    const regex = /^(TAKE|DINE)-\d+$/;

    // Check order number
    if (!regex.test(orderNumber)) {
      return res.status(400).json({ error: "Invalid Order Number" });
    }

    // Deleting order
    const result = await deleteOrder(orderNumber);

    // Sending response
    res.status(200).json(result);
  } catch (error) {
    // Error
    if (error.message.toLowerCase().includes("not found")) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

// Authorizing delete order to be possible only when a manager or owner is logged in and doing it
const protectedDeleteOrder = [
  authenticateToken,
  authorizeRoles,
  handleDeleteOrder,
];

// Exporting Methods
module.exports = {
  handleCreateNewOrder,
  handleGetAllOrders,
  handleGetOrderByNumber,
  handleUpdateOrder,
  handleUpdateOrderStatus,
  handleAddItemToOrder,
  handleUpdateAnItemInOrder,
  handleRemoveItemFromOrder,
  protectedDeleteOrder,
};
