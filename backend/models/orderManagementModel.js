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
  console.log("storeId", storeId);
  console.log("orderType", orderType);
  console.log("tableNum", tableNum);
  console.log("customerName", customerName);
  console.log("specialInstructions", specialInstructions);
  console.log("createdBy", createdBy);
  console.log("items", items);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    const orderId = newOrder.rows[0].order_id;
    console.log("Order ID:", orderId);
    let totalOrderPrice = 0;

    for (let item of items) {
      if (item.quantity <= 0) {
        throw new Error("Quantity should be greater than 0");
      }

      const menuItem = await client.query(
        `SELECT * FROM menu_items WHERE item_id=$1`,
        [item.menu_item_id]
      );

      if (menuItem.rows.length === 0) {
        throw new Error(`Menu item with ID ${item.menu_item_id} not found`);
      }

      const itemPrice = menuItem.rows[0].price;
      totalOrderPrice += itemPrice * item.quantity;

      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity,item_price,created_by) VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.menu_item_id, item.quantity, itemPrice, createdBy]
      );
    }

    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      totalOrderPrice,
      orderId,
    ]);

    await client.query("COMMIT");
    return { order: newOrder.rows[0], total_price: totalOrderPrice };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function getAllOrders() {
  try {
    const result = await pool.query(
      "SELECT * FROM order_summary_view ORDER BY order_time DESC"
    );
    return result.rows;
  } catch (error) {
    console.log(error.message);
    throw new Error("Database error:" + error.message);
  }
}

async function getOrderByNumber(orderNumber) {
  try {
    const result = await pool.query(
      "SELECT * FROM order_summary_view WHERE order_number=$1",
      [orderNumber]
    );

    if (result.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order = result.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.item_price
             FROM order_items oi
             JOIN menu_items m ON oi.menu_item_id = m.item_id
             WHERE oi.order_id = $1`,
      [order.order_id]
    );

    return { order, items: itemsResult.rows };
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message);
  }
}

async function updateOrder(orderNumber, orderDetailsUpdated) {
  const client = await pool.connect();

  try {
    client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT * FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order = orderResult.rows[0];

    let updatedDetails = [];
    let updatedValues = [];
    let i = 1;

    if (
      orderDetailsUpdated.table_num !== undefined &&
      order.order_type === "Dine-In"
    ) {
      updatedDetails.push(`table_num=$${i}`);
      updatedValues.push(orderDetailsUpdated.table_num);
      i++;
    }

    if (
      orderDetailsUpdated.customer_name !== undefined &&
      order.order_type === "Take-Out"
    ) {
      updatedDetails.push(`customer_name=$${i}`);
      updatedValues.push(orderDetailsUpdated.customer_name);
      i++;
    }

    if (orderDetailsUpdated.special_instructions !== undefined) {
      updatedDetails.push(`special_instructions=$${i}`);
      updatedValues.push(orderDetailsUpdated.special_instructions);
      i++;
    }

    if (updatedDetails.length === 0) {
      throw new Error("No valid details to update");
    }

    updatedValues.push(orderNumber);

    const updateOrderQuery = `UPDATE orders SET ${updatedDetails.join(
      ","
    )} WHERE order_number=$${i} RETURNING *`;

    const updatedOrder = await client.query(updateOrderQuery, updatedValues);

    client.query("COMMIT");

    return updatedOrder.rows[0];
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

async function updateOrderStatus(orderNumber, updatedStatus, changedBy) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT order_id,order_status FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order = orderResult.rows[0];

    if (order.order_status === updatedStatus) {
      throw new Error(`Order is already in ${updatedStatus} status`);
    }

    const updateStatusResult = await client.query(
      `UPDATE orders SET order_status=$1 WHERE order_number=$2 RETURNING *`,
      [updatedStatus, orderNumber]
    );

    await client.query(
      `INSERT INTO order_status_history(order_id,status,changed_by) VALUES($1,$2,$3)`,
      [order.order_id, updatedStatus, changedBy]
    );

    await client.query("COMMIT");
    return updateStatusResult.rows[0];
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

async function addItemToOrder(orderNumber, menuItemId, quantity, createdBy) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT order_id, total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order = orderResult.rows[0];

    const menuItemResult = await client.query(
      `SELECT item_id,price FROM menu_items WHERE item_id=$1`,
      [menuItemId]
    );

    if (menuItemResult.rows.length === 0) {
      throw new Error(`Menu item with ID ${menuItemId} not found`);
    }

    const menuItem = menuItemResult.rows[0];

    const existingItemResult = await client.query(
      `SELECT order_item_id, quantity FROM order_items WHERE order_id = $1 AND menu_item_id = $2`,
      [order.order_id, menuItemId]
    );

    let newTotal = order.total_price;
    if (existingItemResult.rows.length > 0) {
      const existingItem = existingItemResult.rows[0];
      const updatedQuantity = existingItem.quantity + quantity;

      await client.query(
        `UPDATE order_items SET quantity = $1 WHERE order_item_id = $2`,
        [updatedQuantity, existingItem.order_item_id]
      );

      newTotal += menuItem.price * quantity;
    } else {
      await client.query(
        `INSERT INTO order_items(order_id,menu_item_id,quantity,item_price,created_by) VALUES($1,$2,$3,$4,$5)`,
        [order.order_id, menuItemId, quantity, menuItem.price, createdBy]
      );
      newTotal += menuItem.price * quantity;
    }

    console.log(
      "order.total_price (before):",
      order.total_price,
      typeof order.total_price
    );

    console.log("menuItem.price:", menuItem.price, typeof menuItem.price);
    console.log("quantity:", quantity, typeof quantity);
    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      newTotal,
      order.order_id,
    ]);

    await client.query("COMMIT");

    return { orderNumber, menuItemId, quantity, totalprice: newTotal };
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

async function updateAnItemInOrder(orderNumber, itemId, quantity, newPrice) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT order_id,total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );
    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }
    const order = orderResult.rows[0];

    const itemResult = await client.query(
      `SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2`,
      [order.order_id, itemId]
    );

    const existingItem = itemResult.rows[0];

    if (!existingItem) {
      throw new Error(`Item with ID ${itemId} not found in order`);
    }

    const oldItemTotal = existingItem.quantity * existingItem.item_price;
    const newItemTotal = quantity * newPrice;
    const priceDiff = newItemTotal - oldItemTotal;
    const newTotal = order.total_price + priceDiff;

    await client.query(
      `UPDATE order_items SET quantity=$1,item_price=$2 WHERE order_item_id=$3`,
      [quantity, newPrice, existingItem.order_item_id]
    );

    await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
      newTotal,
      order.order_id,
    ]);

    await client.query("COMMIT");

    return { orderNumber, itemId, quantity, newPrice, totalprice: newTotal };
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

async function removeItemFromOrder(orderNumber, itemId, removedBy) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query(
      `SELECT order_id,total_price FROM orders WHERE order_number=$1`,
      [orderNumber]
    );

    if (orderResult.rows.length === 0) {
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order = orderResult.rows[0];

    const itemResult = await client.query(
      `SELECT order_item_id,quantity,item_price FROM order_items WHERE order_id=$1 AND menu_item_id=$2`,
      [order.order_id, itemId]
    );

    if (itemResult.rows.length === 0) {
      throw new Error(`Item with ID ${itemId} not found in order`);
    }

    const existingItem = itemResult.rows[0];
    const itemTotal = existingItem.quantity * existingItem.item_price;
    const newTotal = order.total_price - itemTotal;

    await client.query(
      `DELETE FROM order_items WHERE order_item_id=$1 AND order_id=$2`,
      [existingItem.order_item_id, order.order_id]
    );

    const remainingItemsResult = await client.query(
      `SELECT * FROM order_items WHERE order_id=$1`,
      [order.order_id]
    );

    if (parseInt(remainingItemsResult.rowCount) === 0) {
      await client.query(
        `UPDATE orders SET total_price = $1 WHERE order_id = $2`,
        [newTotal, order.order_id]
      );
    } else {
      await client.query(`UPDATE orders SET total_price=$1 WHERE order_id=$2`, [
        newTotal,
        order.order_id,
      ]);
    }

    await client.query("COMMIT");
    return { orderNumber, itemId, totalprice: newTotal };
  } catch (error) {
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  } finally {
    client.release();
  }
}

module.exports = {
  createNewOrderWithItems,
  getAllOrders,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
  addItemToOrder,
  updateAnItemInOrder,
  removeItemFromOrder,
};
