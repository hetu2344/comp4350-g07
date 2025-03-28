/**
 * OrderHistory Page with Manual Date Filter
 * ------------------------------------------
 * - Loads all orders on initial page load.
 * - Lets the user filter orders only when "Filter by Date" is clicked.
 *
 * Role Access:
 *  - S: Store Owner
 *  - M: Manager
 *  - E: Employee
 */

import { useEffect, useState } from "react";
import Card from "react-bootstrap/Card";
import classes from "./active-orders.module.css";
import { useNavigate } from "react-router-dom";
import RoleProtection from "../components/security/RoleProtection";
import OrderManagementNavigation from "../components/layout/OrderManagementNavigation";

function OrderHistory({ user }) {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch all orders once 
  useEffect(() => {
    fetchAllOrderDetails();
  }, []);

  const fetchAllOrderDetails = async () => {
    try {
      const response = await fetch("http://localhost:8018/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      const sorted = data.sort((a, b) => b.order_id - a.order_id);
      setAllOrders(sorted);
      setFilteredOrders(sorted); // Initially show all
    } catch (err) {
      console.error("Error loading orders:", err.message);
      setError("Failed to load orders.");
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const applyDateFilter = () => {
    if (!selectedDate) return;
    const filtered = allOrders.filter((order) => {
      const orderDate = new Date(order.order_time).toISOString().split("T")[0];
      return orderDate === selectedDate;
    });
    setFilteredOrders(filtered);
  };

  return (
    <>
      <OrderManagementNavigation />

      <Card>
        <div className={classes.container}>
          <h1 className={classes.title}>📦 Order History</h1>

          {/* Date Filter Controls */}
          <div className={classes.filterBar}>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split("T")[0]}
            />
            <button onClick={applyDateFilter} className={classes.filterBtn}>
              Filter by Date
            </button>
          </div>

          {/* Error Message */}
          {error && <p className={classes.error}>{error}</p>}

          <div className={classes.grid}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.order_number} className={classes.card}>
                  <div className={classes.header}>
                    <h3>{order.order_number}</h3>
                    <span className={classes.type}>{order.order_type}</span>
                  </div>

                  <div className={classes.info}>
                    {order.order_type === "Dine-In" && (
                      <p><strong>Table:</strong> {order.table_number}</p>
                    )}
                    {order.customer_name && (
                      <p><strong>Customer:</strong> {order.customer_name}</p>
                    )}
                    {order.special_instructions && (
                      <p><strong>Instructions:</strong> {order.special_instructions}</p>
                    )}
                    <p><strong>Created by:</strong> {order.created_by}</p>
                  </div>

                  <div className={classes.totals}>
                    <p><strong>Subtotal:</strong> ${order.item_total.toFixed(2)}</p>
                    <p><strong>Service:</strong> ${order.service_charge.toFixed(2)}</p>
                    <p><strong>GST:</strong> ${order.gst.toFixed(2)}</p>
                    <p><strong>PST:</strong> ${order.pst.toFixed(2)}</p>
                    <p><strong>Total:</strong> ${order.total_price.toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className={classes.noOrders}>
                {selectedDate
                  ? "No orders found for selected date."
                  : "No orders available."}
              </p>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}

export default RoleProtection(OrderHistory, ["S", "M", "E"]);
