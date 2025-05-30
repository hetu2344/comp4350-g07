/**
 * EditOrder Page
 * ----------------
 * This page allows Store Owners, Managers, and Employees to edit an existing order.
 * 
 * Functionality includes:
 *  - Fetching and displaying current order details by order number.
 *  - Editing table number, customer name, and special instructions.
 *  - Updating order items: modify quantity, add new items, remove existing ones.
 * 
 * All updates are made via API calls to the backend. A success toast confirms the update,
 * and the user is redirected to the dashboard.
 * 
 * Role Access:
 *  - S: Store Owner
 *  - M: Manager
 *  - E: Employee
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "react-bootstrap/Card";
import classes from "./add-order.module.css";
import RoleProtection from "../components/security/RoleProtection";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Static order types
const orderTypes = ["Dine-In", "Take-Out"];

function EditOrder({ user }) {
  const { order_number } = useParams();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // Fetch menu items and order details on mount
  useEffect(() => {
    fetchOrderDetails();
    fetchMenuItems();
  }, []);

  // Fetch current order details
  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8018/api/orders/${order_number}`);
      const { order, items } = await response.json();

      setOrderData({
        storeId: user?.storeId?.toString() || "1",
        orderType: order.order_type,
        tableNum: order.table_number || "",
        customerName: order.customer_name || "",
        specialInstructions: order.special_instructions || "",
        createdBy: order.created_by,
        items: items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      console.error("Failed to load order:", err.message);
      setError("Unable to fetch order details.");
      toast.error("Unable to fetch order details.");
    }
  };

  // Fetch menu item list
  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:8018/api/menu");
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err.message);
      toast.error("Failed to fetch menu items.");
    }
  };

  // Handle general field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding/removing items
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
          items: prev.items.filter((item) => item.menu_item_id !== menu_item_id),
        };
      }
    });
  };

  // Handle quantity changes
  const handleQuantityChange = (menu_item_id, quantity) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.menu_item_id === menu_item_id ? { ...item, quantity } : item
      ),
    }));
  };

  // Submit updated order
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!orderData) return;

    try {
      // Step 1: Update base order info (table number, customer name, notes)
      const baseUpdateRes = await fetch(`http://localhost:8018/api/orders/${order_number}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_num: orderData.tableNum,
          customer_name: orderData.customerName,
          specialInstructions: orderData.specialInstructions,
        }),
      });

      if (!baseUpdateRes.ok) throw new Error("Failed to update order details");

      // Step 2: Sync order items (add/update/remove)
      const currentRes = await fetch(`http://localhost:8018/api/orders/${order_number}`);
      const { items: existingItems } = await currentRes.json();
      const existingMap = new Map(existingItems.map(item => [item.menu_item_id, item]));

      // Update or add items
      for (const item of orderData.items) {
        const existing = existingMap.get(item.menu_item_id);
        if (existing) {
          if (existing.quantity !== item.quantity) {
            await fetch(`http://localhost:8018/api/orders/${order_number}/items/${item.menu_item_id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quantity: item.quantity,
                newPrice: existing.item_price,
              }),
            });
          }
          existingMap.delete(item.menu_item_id);
        } else {
          await fetch(`http://localhost:8018/api/orders/${order_number}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              menuItemId: item.menu_item_id,
              quantity: item.quantity,
              createdBy: user?.username || "unknown",
            }),
          });
        }
      }

      // Remove unchecked items
      for (const [itemId] of existingMap) {
        await fetch(`http://localhost:8018/api/orders/${order_number}/items/${itemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ removedBy: user?.username || "unknown" }),
        });
      }

      toast.success("Order updated successfully!");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      console.error("Error updating order:", err.message);
      setError("Failed to update order. Try again.");
      toast.error("Failed to update order. Try again.");
    }
  };

  if (!orderData) {
    return <p style={{ padding: "1rem" }}>Loading order data...</p>;
  }

  return (
    <>
      <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>✏️ Edit Order</h1>
          {error && <p className={classes.error}>{error}</p>}

          <form className={classes.form} onSubmit={handleSubmit}>
            {/* Hidden fields for reference */}
            <input type="hidden" name="storeId" value={orderData.storeId} />
            <input type="hidden" name="createdBy" value={orderData.createdBy} />

            {/* Order type (not editable) */}
            <div className={classes.control}>
              <label>Order Type:</label>
              <select name="orderType" value={orderData.orderType} disabled>
                <option>{orderData.orderType}</option>
              </select>
            </div>

            {/* Table number if dine-in */}
            {orderData.orderType === "Dine-In" && (
              <div className={classes.control}>
                <label>Table Number:</label>
                <input
                  type="text"
                  name="tableNum"
                  value={orderData.tableNum}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Customer name if take-out */}
            {orderData.orderType === "Take-Out" && (
              <div className={classes.control}>
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customerName"
                  value={orderData.customerName}
                  onChange={handleChange}
                />
              </div>
            )}

            {/* Optional notes */}
            <div className={classes.control}>
              <label>Special Instructions:</label>
              <textarea
                name="specialInstructions"
                value={orderData.specialInstructions}
                onChange={handleChange}
              />
            </div>

            {/* Item selection with quantity */}
            <div className={classes.control}>
              <label>Update Items:</label>
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
              <button type="submit">Update Order</button>
            </div>
          </form>
        </div>
      </Card>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default RoleProtection(EditOrder, ["S", "M", "E"]);
