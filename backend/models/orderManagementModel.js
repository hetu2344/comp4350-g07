const pool = require("../db/db");

// Create a new order
async function createNewOrderWithItems(
  storeId,
  orderType,
  tableNum,
  customerName,
  specialInstructions,
  createdBy,
  items
) {
  
  const client = await pool.connect();
  try {

    // Begin transaction
    await client.query("BEGIN");

    // Insert new order
    const newOrder = await client.query(
      `INSERT INTO orders (store_id, order_type, table_num, customer_name, special_instructions, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        storeId,
        orderType,
        tableNum,
        customerName,
        specialInstructions,
        createdBy,
      ]
    );

    // Get the order ID
    const orderId = newOrder.rows[0].order_id;
    
    // Calculate total order price
    let totalOrderPrice = 0;

    // Loop through each item
    for (let item of items) {
      if (item.quantity <= 0) {
        throw new Error("Quantity should be greater than 0");
      }

      // Get the menu item
      const menuItem = await client.query(
        `SELECT * FROM menu_items WHERE item_id=$1`,
        [item.menu_item_id]
      );

      // If menu item not found
      if (menuItem.rows.length === 0) {
        throw new Error(`Menu item with ID ${item.menu_item_id} not found`);
      }

      // Calculate the item price
      const itemPrice = menuItem.rows[0].price;

      // Calculate the total order price
      totalOrderPrice += itemPrice * item.quantity;

      // Insert the order item
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity,item_price,created_by) VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.menu_item_id, item.quantity, itemPrice, createdBy]
      );
    }

    // Update the total order price
    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      totalOrderPrice,
      orderId,
    ]);

    // Commit transaction
    await client.query("COMMIT");

    // Return the order and total price
    return { order: newOrder.rows[0], total_price: totalOrderPrice };
  } catch (err) {
    // Rollback transaction
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Release client
    client.release();
  }
}

// Get all orders
async function getAllOrders() {
  try {
    // Get all orders
    const result = await pool.query(
      "SELECT * FROM order_summary_view ORDER BY order_time DESC"
    );
    // Return the response
    return result.rows;
  } catch (error) {
    // ERROR
    throw new Error("Database error:" + error.message);
  }
}

// Get order by order number
async function getOrderByNumber(orderNumber) {
  try {
    // Get order by order number
    const result = await pool.query(
      "SELECT * FROM order_summary_view WHERE order_number=$1",
      [orderNumber]
    );

    // If order not found
    if (result.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = result.rows[0];

    // Get the items in the order
    const itemsResult = await pool.query(
      `SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.item_price
             FROM order_items oi
             JOIN menu_items m ON oi.menu_item_id = m.item_id
             WHERE oi.order_id = $1`,
      [order.order_id]
    );

    // Return the order and items
    return { order, items: itemsResult.rows };
  } catch (error) {
    // ERROR
    throw new Error(error.message);
  }
}

// Update order
async function updateOrder(orderNumber, orderDetailsUpdated) {
  const client = await pool.connect();

  try {
    // Begin transaction
    client.query("BEGIN");
    // Get the order
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];

    let updatedDetails = [];
    let updatedValues = [];
    let i = 1;

    // Update the order details
    if (
      orderDetailsUpdated.table_num !== undefined &&
      order.order_type === "Dine-In"
    ) {
      updatedDetails.push(`table_num=$${i}`);
      updatedValues.push(orderDetailsUpdated.table_num);
      i++;
    }

    // Update the customer name
    if (
      orderDetailsUpdated.customer_name !== undefined &&
      order.order_type === "Take-Out"
    ) {
      updatedDetails.push(`customer_name=$${i}`);
      updatedValues.push(orderDetailsUpdated.customer_name);
      i++;
    }

    // Update the special instructions
    if (orderDetailsUpdated.specialInstructions !== undefined) {
      updatedDetails.push(`special_instructions=$${i}`);
      updatedValues.push(orderDetailsUpdated.specialInstructions);
      i++;
    }

    // If no details to update
    if (updatedDetails.length === 0) {
      throw new Error("No valid details to update");
    }

    //Push order number to the end of the array
    updatedValues.push(orderNumber);

    // Update the order
    const updateOrderQuery = `UPDATE orders SET ${updatedDetails.join(
      ","
    )} WHERE order_number=$${i} RETURNING *`;

    // Execute the query
    const updatedOrder = await client.query(updateOrderQuery, updatedValues);

    // Commit transaction
    client.query("COMMIT");

    // Return the updated order
    return updatedOrder.rows[0];
  } catch (error) {
    // ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    // Release client
    client.release();
  }
}

// Update order status
async function updateOrderStatus(orderNumber, updatedStatus, changedBy) {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");
    // Get the order
    const orderResult = await client.query(
      `SELECT order_id,order_status FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];

    // If order is already in the updated status
    if (order.order_status === updatedStatus) {
      throw new Error(`Order is already in ${updatedStatus} status`);
    }

    // Update the order status
    const updateStatusResult = await client.query(
      `UPDATE orders SET order_status=$1 WHERE order_number=$2 RETURNING *`,
      [updatedStatus, orderNumber]
    );

    // Insert the status history
    await client.query(
      `INSERT INTO order_status_history(order_id,status,changed_by) VALUES($1,$2,$3)`,
      [order.order_id, updatedStatus, changedBy]
    );

    // Commit transaction
    await client.query("COMMIT");

    // Return the updated order
    return updateStatusResult.rows[0];
  } catch (error) {
    // ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    // Release client
    client.release();
  }
}

// Add item to order
async function addItemToOrder(orderNumber, menuItemId, quantity, createdBy) {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");
    // Get the order
    const orderResult = await client.query(
      `SELECT order_id, total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];

    // Get the menu item
    const menuItemResult = await client.query(
      `SELECT item_id,price FROM menu_items WHERE item_id=$1`,
      [menuItemId]
    );

    // If menu item not found
    if (menuItemResult.rows.length === 0) {
      throw new Error(`Menu item with ID ${menuItemId} not found`);
    }

    // Get the menu item
    const menuItem = menuItemResult.rows[0];

    // Check if the item already exists in the order
    const existingItemResult = await client.query(
      `SELECT order_item_id, quantity FROM order_items WHERE order_id = $1 AND menu_item_id = $2`,
      [order.order_id, menuItemId]
    );

    // Calculate the new total price
    let newTotal = order.total_price;

    // If item already exists in the order
    if (existingItemResult.rows.length > 0) {
      const existingItem = existingItemResult.rows[0];
      const updatedQuantity = existingItem.quantity + quantity;

      // Update the quantity
      await client.query(
        `UPDATE order_items SET quantity = $1 WHERE order_item_id = $2`,
        [updatedQuantity, existingItem.order_item_id]
      );

      // Calculate the new total price
      newTotal += menuItem.price * quantity;
    } else {
      // Insert the new item
      await client.query(
        `INSERT INTO order_items(order_id,menu_item_id,quantity,item_price,created_by) VALUES($1,$2,$3,$4,$5)`,
        [order.order_id, menuItemId, quantity, menuItem.price, createdBy]
      );
      newTotal += menuItem.price * quantity;
    }

    // Update the total price
    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      newTotal,
      order.order_id,
    ]);

  
// Commit transaction
    await client.query("COMMIT");

    // Return the updated order
    return { orderNumber, menuItemId, quantity, totalprice: newTotal };
  } catch (error) {
    // ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    // Release client
    client.release();
  }
}


// Update an item in order
async function updateAnItemInOrder(orderNumber, itemId, quantity, newPrice) {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");
    
    // Get the order
    const orderResult = await client.query(
      `SELECT order_id,total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];

    // Get the item
    const itemResult = await client.query(
      `SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2`,
      [order.order_id, itemId]
    );

    // Get the item
    const existingItem = itemResult.rows[0];

    // If item not found
    if (!existingItem) {
      throw new Error(`Item with ID ${itemId} not found in order`);
    }

    // Calculate the new total price
    const oldItemTotal = existingItem.quantity * existingItem.item_price;
    const newItemTotal = quantity * newPrice;
    const priceDiff = newItemTotal - oldItemTotal;
    const newTotal = order.total_price + priceDiff;

    // Update the item
    await client.query(
      `UPDATE order_items SET quantity=$1,item_price=$2 WHERE order_item_id=$3`,
      [quantity, newPrice, existingItem.order_item_id]
    );

    // Update the total price
    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      newTotal,
      order.order_id,
    ]);

    // Commit transaction
    await client.query("COMMIT");

    // Return the updated order
    return { orderNumber, itemId:Number(itemId), quantity, newPrice, totalprice: newTotal };
  } catch (error) {
    // ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    throw new Error(error.message);
  } finally {
    // Release client
    client.release();
  }
}


// Remove an item from order
async function removeItemFromOrder(orderNumber, itemId, removedBy) {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");

    // Get the order
    const orderResult = await client.query(
      `SELECT order_id,total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];
    // Get the item
    const itemResult = await client.query(
      `SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2`,
      [order.order_id, itemId]
    );

    // If item not found
    if (itemResult.rows.length === 0) {
      throw new Error(`Item with ID ${itemId} not found in order`);
    }

    // Get the item
    const existingItem = itemResult.rows[0];
    const itemTotal = existingItem.quantity * existingItem.item_price;
    const newTotal = order.total_price - itemTotal;

    // Remove the item
    await client.query(
      `DELETE FROM order_items WHERE order_item_id=$1 AND order_id=$2`,
      [existingItem.order_item_id, order.order_id]
    );

    // Get the remaining items
    const remainingItemsResult = await client.query(
      `SELECT * FROM order_items WHERE order_id=$1`,
      [order.order_id]
    );

    // update the total price
      await client.query(
        `UPDATE orders SET total_price = $1 WHERE order_id = $2`,
        [newTotal, order.order_id]
      );

      // Commit transaction
    await client.query("COMMIT");
    // Return the updated order
    return { orderNumber, itemId, totalprice: newTotal };
  } catch (error) {
    //  ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    // Release client
    client.release();
  }
}

// Delete an order
async function deleteOrder(orderNumber) {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query("BEGIN");

    // Get the order
    const orderResult = await client.query(
      `SELECT order_id FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    // If order not found
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    // Get the order
    const order = orderResult.rows[0];

    // Delete the order items
    await client.query(`DELETE FROM order_items WHERE order_id=$1`, [
      order.order_id,
    ]);

    // Delete the order
    await client.query(`DELETE FROM orders WHERE order_id=$1`, [
      order.order_id,
    ]);

    // Commit transaction
    await client.query("COMMIT");
    
    // Return the response
    return { message: "Order deleted successfully" };
  } catch (error) {
    // ERROR
    // Rollback transaction
    client.query("ROLLBACK");
    throw new Error(error.message);
  }finally{
    // Release client
  client.release();
}
}

// Export the module
module.exports = {
  createNewOrderWithItems,
  getAllOrders,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
  addItemToOrder,
  updateAnItemInOrder,
  removeItemFromOrder,
  deleteOrder,
};
