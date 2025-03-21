import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import classes from "./active-orders.module.css";
import { useNavigate } from "react-router-dom";
import RoleProtection from "../components/security/RoleProtection";
import OrderManagementNavigation from "../components/layout/OrderManagementNavigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ActiveOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllOrderDetails();
    const interval = setInterval(fetchAllOrderDetails, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrderDetails = async () => {
    try {
      const response = await fetch("http://localhost:8018/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders list");
      const rawOrders = await response.json();

      const fullDetailsPromises = rawOrders
        .filter((order) => order.order_status !== "Completed")
        .sort((a, b) => a.order_id - b.order_id)
        .map((order) =>
          fetch(`http://localhost:8018/api/orders/${order.order_number}`).then(
            (res) => res.json()
          )
        );

      const detailedOrders = await Promise.all(fullDetailsPromises);
      setOrders(detailedOrders);
    } catch (err) {
      console.error("Error loading orders:", err.message);
      setError("Failed to load active orders.");
      toast.error("Failed to load active orders.");
    }
  };

  const handleMarkCompleted = async (orderNumber) => {
    try {
      const response = await fetch(
        `http://localhost:8018/api/orders/${orderNumber}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updatedStatus: "Completed",
            changedBy: user?.username || "unknown",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      toast.success(`Order ${orderNumber} marked as completed!`);
      fetchAllOrderDetails();
    } catch (err) {
      console.error("Failed to mark completed:", err.message);
      toast.error("Failed to mark order as completed.");
    }
  };

  return (
    <>
      <OrderManagementNavigation />

      <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>📦 Active Orders</h1>
          {error && <p className={classes.error}>{error}</p>}

          <div className={classes.grid}>
            {orders.length > 0 ? (
              orders.map(({ order, items }) => (
                <div key={order.order_number} className={classes.card}>
                  <div className={classes.header}>
                    <h3>{order.order_number}</h3>
                    <span className={classes.type}>{order.order_type}</span>
                  </div>

                  <div className={classes.info}>
                    {order.order_type === "Dine-In" && (
                      <p>
                        <strong>Table:</strong> {order.table_number}
                      </p>
                    )}
                    {order.customer_name && (
                      <p>
                        <strong>Customer:</strong> {order.customer_name}
                      </p>
                    )}
                    {order.special_instructions && (
                      <p>
                        <strong>Instructions:</strong>{" "}
                        {order.special_instructions}
                      </p>
                    )}
                    <p>
                      <strong>Created by:</strong> {order.created_by}
                    </p>
                  </div>

                  <div className={classes.items}>
                    <p>
                      <strong>Items:</strong>
                    </p>
                    <ul>
                      {items.map((item) => (
                        <li key={item.menu_item_id}>
                          {item.item_name} × {item.quantity} ($
                          {item.item_price.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={classes.totals}>
                    <p>
                      <strong>Subtotal:</strong> ${order.item_total.toFixed(2)}
                    </p>
                    <p>
                      <strong>Service:</strong> $
                      {order.service_charge.toFixed(2)}
                    </p>
                    <p>
                      <strong>GST:</strong> ${order.gst.toFixed(2)}
                    </p>
                    <p>
                      <strong>PST:</strong> ${order.pst.toFixed(2)}
                    </p>
                    <p>
                      <strong>Total:</strong> ${order.total_price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    className={classes.completeBtn}
                    onClick={() => handleMarkCompleted(order.order_number)}
                  >
                    ✅ Mark as Completed
                  </button>
                  <button
                    className={classes.editBtn}
                    onClick={() =>
                      navigate(`/edit-order/${order.order_number}`)
                    }
                  >
                    ✏️ Edit Order
                  </button>
                </div>
              ))
            ) : (
              <p className={classes.noOrders}>No active orders.</p>
            )}
          </div>
        </div>
      </Card>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default RoleProtection(ActiveOrders, ["S", "M", "E"]);
