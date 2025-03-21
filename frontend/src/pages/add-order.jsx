import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./add-order.module.css";
import RoleProtection from "../components/security/RoleProtection";

const orderTypes = ["Dine-In", "Take-Out"];

function AddOrder({ user }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);

  const [orderData, setOrderData] = useState({
    storeId: user?.storeId?.toString() || '1',
    orderType: orderTypes[0],
    tableNum: "",
    customerName: "",
    specialInstructions: "",
    createdBy: user?.username || "owner_john",
    items: [],
  });

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        const response = await fetch("http://localhost:8018/api/menu");
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error("Error fetching menu items:", err.message);
      }
    }

    fetchMenuItems();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (menuItemId, isChecked) => {
    setOrderData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          items: [...prev.items, { menuItemId, quantity: 1 }],
        };
      } else {
        return {
          ...prev,
          items: prev.items.filter((item) => item.menuItemId !== menuItemId),
        };
      }
    });
  };

  const handleQuantityChange = (menuItemId, quantity) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Submitting order:", orderData);

    if (orderData.orderType === "Dine-In" && !orderData.tableNum) {
      setError("Table number is required for Dine-In orders.");
      return;
    }

    if (!orderData.customerName) {
      setError("Customer name is required.");
      return;
    }

    if (!orderData.createdBy || !orderData.storeId || orderData.items.length === 0) {
      setError("Missing required order info.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8018/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error("Failed to create order.");
      alert("Order created successfully!");
      navigate("/dashboard"); 
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
          <input type="hidden" name="storeId" value={orderData.storeId} />
          <input type="hidden" name="createdBy" value={orderData.createdBy} />

          <div className={classes.control}>
            <label>Order Type:</label>
            <select
              name="orderType"
              value={orderData.orderType}
              onChange={handleChange}
              required
            >
              {orderTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {orderData.orderType === "Dine-In" && (
            <div className={classes.control}>
              <label>Table Number:</label>
              <input
                type="text"
                name="tableNum"
                value={orderData.tableNum}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className={classes.control}>
            <label>Customer Name:</label>
            <input
              type="text"
              name="customerName"
              value={orderData.customerName}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div className={classes.control}>
            <label>Special Instructions:</label>
            <textarea
              name="specialInstructions"
              value={orderData.specialInstructions}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className={classes.control}>
            <label>Select Items:</label>
            <div className={classes.checkboxGroup}>
              {menuItems.map((item) => {
                const isSelected = orderData.items.some(
                  (i) => i.menuItemId === item.item_id
                );
                return (
                  <div key={item.item_id} className={classes.menuItem}>
                    <label>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          handleItemChange(item.item_id, e.target.checked)
                        }
                      />
                      {item.item_name} (${item.price})
                    </label>
                    {isSelected && (
                      <input
                        type="number"
                        min="1"
                        value={
                          orderData.items.find(
                            (i) => i.menuItemId === item.item_id
                          )?.quantity || 1
                        }
                        onChange={(e) =>
                          handleQuantityChange(
                            item.item_id,
                            Number(e.target.value)
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
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

export default RoleProtection(AddOrder, ["S", "M", "E"]);
