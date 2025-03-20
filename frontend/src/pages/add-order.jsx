import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./add-order.module.css";

// Order types
const orderTypes = ["Dine-In", "Take-Out"];

function AddOrder() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]); // Store menu items for selection
  const [error, setError] = useState(null);

  const [orderData, setOrderData] = useState({
    storeId: "",
    orderType: orderTypes[0], // Default to first option
    tableNum: "",
    customerName: "",
    specialInstructions: "",
    createdBy: "",
    items: [],
  });

  // Fetch available menu items
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch("http://localhost:8018/api/menu");
        if (!response.ok) throw new Error("Failed to fetch menu items.");
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err.message);
      }
    }
    fetchMenuItems();
  }, []);

  // Handle input change
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setOrderData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle item selection & quantity
  const handleItemChange = (menuItemId, quantity) => {
    setOrderData((prevData) => {
      const existingItem = prevData.items.find((item) => item.menuItemId === menuItemId);
      if (existingItem) {
        return {
          ...prevData,
          items: prevData.items.map((item) =>
            item.menuItemId === menuItemId ? { ...item, quantity } : item
          ),
        };
      } else {
        return {
          ...prevData,
          items: [...prevData.items, { menuItemId, quantity }],
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Ensure proper validation before submitting
    if (orderData.orderType === "Dine-In" && !orderData.tableNum) {
      setError("Table number is required for Dine-In orders.");
      return;
    }
    if (orderData.orderType === "Take-Out" && !orderData.customerName) {
      setError("Customer name is required for Take-Out orders.");
      return;
    }
    if (!orderData.storeId || !orderData.createdBy || orderData.items.length === 0) {
      setError("Store ID, Creator, and at least one item are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8018/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order.");
      
      alert("Order created successfully!");
      navigate("/orders");
    } catch (err) {
      console.error("Error creating order:", err.message);
      setError("Failed to create order. Try again.");
    }
  };

  return (
    <Card>
      <div className={classes.container}>
        <h1 className={classes.title}>🛒 Create a New Order</h1>
        {error && <p className={classes.error}>{error}</p>}
        <form className={classes.form} onSubmit={handleSubmit}>
          <div className={classes.control}>
            <label>Store ID:</label>
            <input type="text" name="storeId" value={orderData.storeId} onChange={handleChange} required />
          </div>

          <div className={classes.control}>
            <label>Order Type:</label>
            <select name="orderType" value={orderData.orderType} onChange={handleChange} required>
              {orderTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {orderData.orderType === "Dine-In" && (
            <div className={classes.control}>
              <label>Table Number:</label>
              <input type="text" name="tableNum" value={orderData.tableNum} onChange={handleChange} required />
            </div>
          )}

          {orderData.orderType === "Take-Out" && (
            <div className={classes.control}>
              <label>Customer Name:</label>
              <input type="text" name="customerName" value={orderData.customerName} onChange={handleChange} required />
            </div>
          )}

          <div className={classes.control}>
            <label>Special Instructions:</label>
            <textarea name="specialInstructions" value={orderData.specialInstructions} onChange={handleChange} />
          </div>

          <div className={classes.control}>
            <label>Created By:</label>
            <input type="text" name="createdBy" value={orderData.createdBy} onChange={handleChange} required />
          </div>

          {/* Menu Item Selection */}
          <div className={classes.control}>
            <label>Select Items:</label>
            <div className={classes.checkboxGroup}>
              {menuItems.map((item) => (
                <div key={item.id} className={classes.menuItem}>
                  <label>
                    <input
                      type="checkbox"
                      value={item.id}
                      onChange={(e) => handleItemChange(item.id, e.target.checked ? 1 : 0)}
                    />
                    {item.itemName} (${item.price})
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={!orderData.items.some((i) => i.menuItemId === item.id)}
                    onChange={(e) => handleItemChange(item.id, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={classes.actions}>
            <button type="submit">Create Order</button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export default AddOrder;
