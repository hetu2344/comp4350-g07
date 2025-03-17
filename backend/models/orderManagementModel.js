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
      if(item.quantity<=0){
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
    const result = await pool.query("SELECT * FROM order_summary_view ORDER BY order_time DESC");
    return result.rows;
  } catch (error) {
    console.log(error.message);
    throw new Error("Database error:" + error.message);
  }
}

async function getOrderByNumber(orderNumber) {
  try{
    const result = await pool.query("SELECT * FROM order_summary_view WHERE order_number=$1",[orderNumber]);
    
    if(result.rows.length===0){
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order=result.rows[0];

    const itemsResult=await pool.query(`SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.item_price
             FROM order_items oi
             JOIN menu_items m ON oi.menu_item_id = m.item_id
             WHERE oi.order_id = $1`,[order.order_id]);
    
    return {order,items:itemsResult.rows};
  }catch(error){
    console.log(error.message);
    throw new Error(error.message);
  }
  
}

async function updateOrder(orderNumber, orderDetailsUpdated){
    const client = await pool.connect();

  try{
    client.query("BEGIN");
    const orderResult=await client.query(`SELECT * FROM orders WHERE order_number=$1`,[orderNumber]);

    if(orderResult.rows.length===0){
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order=orderResult.rows[0];

    let updatedDetails=[];
    let updatedValues=[];
    let i=1;

    if(orderDetailsUpdated.table_num!==undefined && order.order_type==="Dine-In"){
      updatedDetails.push(`table_num=$${i}`);
      updatedValues.push(orderDetailsUpdated.table_num);
      i++;
    }

    if(orderDetailsUpdated.customer_name!==undefined && order.order_type==="Take-Out"){
      updatedDetails.push(`customer_name=$${i}`);
      updatedValues.push(orderDetailsUpdated.customer_name);
      i++;
    }

    if(orderDetailsUpdated.special_instructions!==undefined){
      updatedDetails.push(`special_instructions=$${i}`);
      updatedValues.push(orderDetailsUpdated.special_instructions);
      i++;
    }

    if(updatedDetails.length===0){
      throw new Error("No valid details to update");
    }

    updatedValues.push(orderNumber);

    const updateOrderQuery=`UPDATE orders SET ${updatedDetails.join(",")} WHERE order_number=$${i} RETURNING *`;

    const updatedOrder=await client.query(updateOrderQuery,updatedValues);

    client.query("COMMIT");

    return updatedOrder.rows[0];
  }catch(error){
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  }finally{
    client.release();
  }
}

async function updateOrderStatus(orderNumber,updatedStatus,changedBy){
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    const orderResult=await client.query(`SELECT order_id,order_status FROM orders WHERE order_number=$1`,[orderNumber]);
  
    if(orderResult.rows.length===0){
      throw new Error(`Order with number ${orderNumber} not found`);
    }

    const order=orderResult.rows[0];

    if(order.order_status===updatedStatus){
      throw new Error(`Order is already in ${updatedStatus} status`);
    }

    const updateStatusResult=await client.query(`UPDATE orders SET order_status=$1 WHERE order_number=$2 RETURNING *`,[updatedStatus,orderNumber]);

    await client.query(`INSERT INTO order_status_history(order_id,status,changed_by) VALUES($1,$2,$3)`,[order.order_id,updatedStatus,changedBy]);

    await client.query("COMMIT");
    return updateStatusResult.rows[0];

  }catch(error){
    client.query("ROLLBACK");
    console.log(error.message);
    throw new Error(error.message);
  }finally{
    client.release();
  }
}


module.exports = {
  createNewOrderWithItems,
  getAllOrders,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
};