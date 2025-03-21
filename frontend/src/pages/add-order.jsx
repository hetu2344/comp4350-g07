import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./add-order.module.css";
import RoleProtection from "../components/security/RoleProtection";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderManagementNavigation from "../components/layout/OrderManagementNavigation";

const orderTypes = ["Dine-In", "Take-Out"];

function AddOrder({ user }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);

  const [orderData, setOrderData] = useState({
    storeId: user?.storeId?.toString() || "1",
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

  const handleItemChange = (menu_item_id, isChecked) => {
    setOrderData((prev) => {
      if (isChecked) {
        return {
          ...prev,
          items: [...prev.items, { menu_item_id, quantity: 1 }],
        };
      } else {
        return {
          ...prev,
          items: prev.items.filter(
            (item) => item.menu_item_id !== menu_item_id
          ),
        };
      }
    });
  };

  const handleQuantityChange = (menu_item_id, quantity) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.menu_item_id === menu_item_id ? { ...item, quantity } : item
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (orderData.orderType === "Dine-In" && !orderData.tableNum) {
      const msg = "Table number is required for Dine-In orders.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!orderData.customerName) {
      const msg = "Customer name is required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (
      !orderData.createdBy ||
      !orderData.storeId ||
      orderData.items.length === 0
    ) {
      const msg = "Missing required order info.";
      setError(msg);
      toast.error(msg);
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
      toast.success("Order created successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (err) {
      console.error("Error creating order:", err.message);
      toast.error("Failed to create order. Try again.");
      setError("Failed to create order. Try again.");
    }
  };

  return (
    <>
      <OrderManagementNavigation />
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
                    (i) => i.menu_item_id === item.item_id
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
                              (i) => i.menu_item_id === item.item_id
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

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
    </>
  );
}

export default RoleProtection(AddOrder, ["S", "M", "E"]);
