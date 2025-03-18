// const { authenticateToken, authorizeRoles } = require("./authController");
const {
  createNewOrderWithItems,
  getAllOrders,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
  addItemToOrder,
  updateAnItemInOrder,
  removeItemFromOrder,
} = require("../models/orderManagementModel");
// Method that creates new MenuItem
async function createNewOrder (req, res){
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

      console.log("storeId", storeId);
      console.log("orderType", orderType);
      console.log("tableNum", tableNum);
      console.log("customerName", customerName);
      console.log("specialInstructions", specialInstructions);
      console.log("createdBy", createdBy);
      console.log("items", items);

    if (
      !storeId ||
      !orderType ||
      !createdBy ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res
        .status(400)
        .json({
          error:
            "Missing required fields: storeId, orderType, createdBy, items",
        });
    }

    if (orderType !== "Dine-In" && orderType !== "Take-Out") {
      return res
        .status(400)
        .json({
          error: "Invalid order type. Allowed types: Dine-In, Take-Out",
        });
    }


    
    let checkedTableNum= null;
    let checkedCustomerName= null;

    if (orderType === "Dine-In") {
        if (!tableNum) {
      return res
        .status(400)
        .json({ error: "Table number is required for Dine-In orders." });
        }
        checkedTableNum = tableNum;
    }else if(orderType==="Take-Out"){
        if (!customerName) {
      return res
        .status(400)
        .json({ error: "Customer name is required for Take-Out orders." });
        }
        checkedCustomerName = customerName;
    }


    console.log(req.body[0]);
    const newOrder = await createNewOrderWithItems(
      storeId,
      orderType,
      checkedTableNum,
      checkedCustomerName,
      specialInstructions,
      createdBy,
      items
    );

    res
      .status(201)
      .json({ message: "Order created successfully.", order: newOrder });
  } catch (err) {
    console.log(err.message);
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    res
      .status(500)
      .json({ error: err.message });
  }
  
}

async function handleGetAllOrders(req, res) {
  try{
    const result =await getAllOrders();
    res.status(200).json(result);
  }catch(error){
    console.log(error.message);
    res.status(500).json({error:error.message});
  }
}

async function handleGetOrderByNumber(req, res) {
  try{
    const orderNumber = req.params.orderNumber;
    const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }

    if(!regex.test(orderNumber)){
      return res.status(400).json({error:"Invalid Order Number"});
    }

    const result=await getOrderByNumber(orderNumber);
    res.status(200).json(result);

  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error.message});
  }
}

async function handleUpdateOrder(req, res) {
try{
  const orderNumber = req.params.orderNumber;
  const {table_num,customer_name,specialInstructions}=req.body;
  const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }

    if(!regex.test(orderNumber)){
      return res.status(400).json({error:"Invalid Order Number"});
    }

    const updatedDetails={
      table_num,
      customer_name,
      specialInstructions
    };

    const result=await updateOrder(orderNumber,updatedDetails);
    res.status(200).json({message:"Order updated successfully",order:result});
  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error.message});
  }

}

async function handleUpdateOrderStatus(req, res) {
  try{
    const orderNumber=req.params.orderNumber;
    const {updatedStatus,changedBy}=req.body;
    const validStatus=["Active","Completed","Cancelled"];
    const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }

    if (!regex.test(orderNumber)) {
            return res.status(400).json({ error: "Invalid order number format" });
    }

    if(!updatedStatus){
      return res.status(400).json({error:"Status is required"});
    }

    if(!validStatus.includes(updatedStatus)){
      return res.status(400).json({error:"Invalid Status"});
    }

    if(!changedBy){
      return res.status(400).json({error:"Changed By is required"});
    }

    const updateOrder=await updateOrderStatus(orderNumber,updatedStatus,changedBy);
    res.status(200).json({message:"Order Status updated successfully",order:updateOrder});

  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error.message});
  }
}

async function handleAddItemToOrder(req, res) {
  try{
    const orderNumber=req.params.orderNumber;
    const {menuItemId,quantity,createdBy}=req.body;
    const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }

    if (!regex.test(orderNumber)) {
            return res.status(400).json({ error: "Invalid order number format" });
    }

    if(quantity<=0){
      return res.status(400).json({error:"Quantity should be greater than 0"});
    }

    if(!menuItemId || !quantity|| !createdBy){
      return res.status(400).json({error:"Missing required details: menu_item_id, quantity, createdBy"});
    }

    const result=await addItemToOrder(orderNumber,menuItemId,quantity,createdBy);
    res.status(201).json({message:"Item added successfully",order:result});
  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error.message});
  }
}

async function handleUpdateAnItemInOrder(req,res){
  console.log("Updating Item in Order");
  try{
    const {orderNumber,itemId}=req.params;
    console.log("orderNumber",orderNumber);
    console.log("itemId",itemId);
    const {quantity,newPrice}=req.body;
    const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }
    if(!regex.test(orderNumber)){
      return res.status(400).json({error:"Invalid Order Number"});
    }

    
    if (quantity <= 0) {
      return res.status(400).json({error:"Quantity should be greater than 0"});
    }

    if(!itemId || !quantity || !newPrice ){
      return res.status(400).json({error:"Missing required details: itemId, quantity, newPrice"});
    }

    const updatedOrder=await updateAnItemInOrder(orderNumber,itemId,quantity,newPrice);
    res.status(200).json({message:"Item updated successfully",order:updatedOrder});

  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error});
  }
}

async function handleRemoveItemFromOrder(req,res){
  try{
    const {orderNumber,itemId}=req.params;
    const {removedBy}=req.body;
    const regex=/^(TAKE|DINE)-\d+$/;
    if(!orderNumber){
      return res.status(400).json({error:"Order Number is required"});
    }
    if(!regex.test(orderNumber)){
      return res.status(400).json({error:"Invalid Order Number"});
    }
    if(!itemId||!removedBy){
      return res.status(400).json({error:"Missing required details: itemId, removedBy"});
    }

    const updatedOrder=await removeItemFromOrder(orderNumber,itemId,removedBy);
    res.status(200).json({message:"Item removed successfully",order:updatedOrder});

  }catch(error){
    console.log(error.message);
    if(error.message.toLowerCase().includes("not found")){
      return res.status(404).json({error:error.message});
    }
    res.status(500).json({error:error});
  }

}




module.exports = {
  createNewOrder,
  handleGetAllOrders,
  handleGetOrderByNumber,
  handleUpdateOrder,
  handleUpdateOrderStatus,
  handleAddItemToOrder,
  handleUpdateAnItemInOrder,
  handleRemoveItemFromOrder,
};