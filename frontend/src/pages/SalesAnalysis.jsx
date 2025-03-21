"use client";

import { useState, useEffect, useRef } from "react";
import RoleProtection from "../components/security/RoleProtection";
import {
  getTotalRevenue,
  getTopMenuItems,
  getRevenueByCategory,
  getWeeklySales,
  getDineVsTake,
} from "../services/salesApi";
import SalesChart from "../components/sales/SalesChart";
import styles from "./SalesAnalysis.module.css";
import SalesAnalysisNavigation from "../components/layout/SalesAnalysisNavigation";

function SalesAnalysisPage({ user }) {
  // State for date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state to track if dates have been changed but not applied
  const [datesChanged, setDatesChanged] = useState(false);

  // Store the applied dates to compare with current input values
  const appliedStartDate = useRef("");
  const appliedEndDate = useRef("");

  // State for data
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [topMenuItems, setTopMenuItems] = useState(null);
  const [revenueByCategory, setRevenueByCategory] = useState(null);
  const [weeklySales, setWeeklySales] = useState(null);
  const [dineVsTake, setDineVsTake] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Set both date inputs to today and fetch data immediately
  const handleSetToday = () => {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);

    // Update the applied dates
    appliedStartDate.current = today;
    appliedEndDate.current = today;

    // Reset the datesChanged flag
    setDatesChanged(false);

    // Fetch data with today's date
    fetchData(today, today);
  };

  // Handle date input changes
  const handleDateChange = (setter, value) => {
    // Update the state
    setter(value);

    // Check if the dates are different from the applied dates
    // Use the new value directly instead of relying on state
    if (setter === setStartDate) {
      setDatesChanged(
        value !== appliedStartDate.current || endDate !== appliedEndDate.current
      );
    } else {
      setDatesChanged(
        startDate !== appliedStartDate.current ||
          value !== appliedEndDate.current
      );
    }
  };

  // Check if both dates are selected
  const areDatesSelected = () => {
    return startDate && endDate;
  };

  // Check if user has access to this feature
  const hasAccess = user && (user.type === "S" || user.type === "M");

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all data
  const fetchData = async (start = startDate, end = endDate) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        totalRevenueData,
        topMenuItemsData,
        revenueByCategoryData,
        weeklySalesData,
        dineVsTakeData,
      ] = await Promise.all([
        getTotalRevenue(start, end),
        getTopMenuItems(start, end),
        getRevenueByCategory(start, end),
        getWeeklySales(),
        getDineVsTake(start, end),
      ]);

      setTotalRevenue(totalRevenueData);
      setTopMenuItems(topMenuItemsData);
      setRevenueByCategory(revenueByCategoryData);
      setWeeklySales(weeklySalesData);
      setDineVsTake(dineVsTakeData);

      // Update the applied dates
      appliedStartDate.current = start;
      appliedEndDate.current = end;

      // Reset the datesChanged flag
      setDatesChanged(false);
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError("Failed to load sales data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range change
  const handleApplyDateRange = () => {
    fetchData();
  };

  // Prepare chart data for weekly sales
  const getWeeklySalesChartData = () => {
    if (
      !weeklySales ||
      !weeklySales.weeklySalesData ||
      !weeklySales.weeklySalesData.dailySales
    )
      return null;

    return {
      labels: weeklySales.weeklySalesData.dailySales.map((day) => day.day_name),
      datasets: [
        {
          label: "Daily Revenue",
          data: weeklySales.weeklySalesData.dailySales.map(
            (day) => day.daily_revenue
          ),
          backgroundColor: "rgba(255, 140, 66, 0.6)",
          borderColor: "rgba(255, 140, 66, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for dine-in vs take-out
  const getDineVsTakeChartData = () => {
    if (
      !dineVsTake ||
      !dineVsTake.dineVsTakeDetails ||
      !dineVsTake.dineVsTakeDetails.byOrderType
    )
      return null;

    return {
      labels: dineVsTake.dineVsTakeDetails.byOrderType.map(
        (type) => type.order_type
      ),
      datasets: [
        {
          label: "Revenue",
          data: dineVsTake.dineVsTakeDetails.byOrderType.map(
            (type) => type.total_revenue
          ),
          backgroundColor: [
            "rgba(255, 140, 66, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderColor: ["rgba(255, 140, 66, 1)", "rgba(75, 192, 192, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for revenue by category
  const getRevenueByCategoryChartData = () => {
    if (!revenueByCategory || !revenueByCategory.categories) return null;

    return {
      labels: revenueByCategory.categories.map((category) => category.category),
      datasets: [
        {
          label: "Revenue by Category",
          data: revenueByCategory.categories.map(
            (category) => category.revenue
          ),
          backgroundColor: [
            "rgba(255, 140, 66, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(54, 162, 235, 0.6)",
          ],
          borderColor: [
            "rgba(255, 140, 66, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(54, 162, 235, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare chart data for top menu items
  const getTopMenuItemsChartData = () => {
    if (!topMenuItems || !topMenuItems.items) return null;

    return {
      labels: topMenuItems.items.map((item) => item.item_name),
      datasets: [
        {
          label: "Quantity Sold",
          data: topMenuItems.items.map((item) => item.quantity_sold),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div>
      <SalesAnalysisNavigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Sales Analysis</h1>
            <p className={styles.subtitle}>
              {totalRevenue
                ? `Data for ${totalRevenue.startDate} to ${totalRevenue.endDate}`
                : "Loading date range..."}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div
          className={`${styles.dateRangeContainer} ${
            !hasAccess ? styles.disabledOverlay : ""
          }`}
        >
          <div>
            <label htmlFor="startDate">Start Date:</label>
            <input
              id="startDate"
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => handleDateChange(setStartDate, e.target.value)}
              disabled={!hasAccess}
              max={getTodayDate()}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => handleDateChange(setEndDate, e.target.value)}
              disabled={!hasAccess}
              max={getTodayDate()}
            />
          </div>
          <button
            className={styles.todayButton}
            onClick={handleSetToday}
            disabled={!hasAccess}
          >
            Today
          </button>
          <button
            className={styles.applyButton}
            onClick={handleApplyDateRange}
            disabled={!hasAccess || !areDatesSelected()}
          >
            Apply
          </button>
        </div>

        {/* Date Changed Warning */}
        {datesChanged && (
          <div className={styles.dateChangedWarning}>
            Date range has changed. Click "Apply" to update the data.
          </div>
        )}

        {/* Error Message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Loading State */}
        {isLoading && <p>Loading sales data...</p>}

        {/* Main Content */}
        <div className={`${!hasAccess ? styles.disabledOverlay : ""}`}>
          {!isLoading && !error && (
            <>
              {/* All cards in a grid with max 3 per row */}
              <div
                className={`${styles.dashboardGrid} ${
                  datesChanged ? styles.dataOutdated : ""
                }`}
              >
                {/* Total Revenue Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Revenue Overview</h2>
                  {totalRevenue &&
                  totalRevenue.revenueDetails &&
                  totalRevenue.revenueDetails.total ? (
                    <>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Total Revenue:</span>
                        <span className={styles.statValue}>
                          {formatCurrency(
                            totalRevenue.revenueDetails.total.total_revenue
                          )}
                        </span>
                      </div>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Total Orders:</span>
                        <span className={styles.statValue}>
                          {totalRevenue.revenueDetails.total.total_orders}
                        </span>
                      </div>
                      {totalRevenue.revenueDetails.byStatus &&
                        totalRevenue.revenueDetails.byStatus.length > 0 && (
                          <div className={styles.tableContainer}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Order Status</th>
                                  <th>Orders</th>
                                  <th>Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {totalRevenue.revenueDetails.byStatus.map(
                                  (status, index) => (
                                    <tr key={index}>
                                      <td>{status.order_status}</td>
                                      <td>{status.total_orders}</td>
                                      <td>
                                        {formatCurrency(status.total_revenue)}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </>
                  ) : (
                    <p>No revenue data available for the selected period.</p>
                  )}
                </div>

                {/* Dine-In vs Take-Out Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Dine-In vs Take-Out</h2>
                  {dineVsTake && dineVsTake.dineVsTakeDetails ? (
                    <>
                      <div className={styles.chartContainer}>
                        {getDineVsTakeChartData() && (
                          <SalesChart
                            type="pie"
                            data={getDineVsTakeChartData()}
                          />
                        )}
                      </div>
                      {dineVsTake.dineVsTakeDetails.byOrderType &&
                        dineVsTake.dineVsTakeDetails.byOrderType.length > 0 && (
                          <div className={styles.tableContainer}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>Order Type</th>
                                  <th>Orders</th>
                                  <th>Revenue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dineVsTake.dineVsTakeDetails.byOrderType.map(
                                  (type, index) => (
                                    <tr key={index}>
                                      <td>{type.order_type}</td>
                                      <td>{type.total_orders}</td>
                                      <td>
                                        {formatCurrency(type.total_revenue)}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                    </>
                  ) : (
                    <p>
                      No dine-in vs take-out data available for the selected
                      period.
                    </p>
                  )}
                </div>

                {/* Weekly Sales Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Weekly Sales</h2>
                  {weeklySales && weeklySales.weeklySalesData ? (
                    <>
                      <div className={styles.chartContainer}>
                        {getWeeklySalesChartData() && (
                          <SalesChart
                            type="bar"
                            data={getWeeklySalesChartData()}
                          />
                        )}
                      </div>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Weekly Total:</span>
                        <span className={styles.statValue}>
                          {formatCurrency(
                            weeklySales.weeklySalesData.weeklyTotal
                          )}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p>No weekly sales data available.</p>
                  )}
                </div>

                {/* Top Menu Items */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Top Selling Items</h2>
                  {topMenuItems &&
                  topMenuItems.items &&
                  topMenuItems.items.length > 0 ? (
                    <>
                      <div className={styles.chartContainer}>
                        {getTopMenuItemsChartData() && (
                          <SalesChart
                            type="bar"
                            data={getTopMenuItemsChartData()}
                          />
                        )}
                      </div>
                      <div className={styles.tableContainer}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Item Name</th>
                              <th>Quantity Sold</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topMenuItems.items.map((item, index) => (
                              <tr key={index}>
                                <td>{item.item_name}</td>
                                <td>{item.quantity_sold}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p>
                      No top selling items data available for the selected
                      period.
                    </p>
                  )}
                </div>

                {/* Revenue by Category */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Revenue by Category</h2>
                  {revenueByCategory &&
                  revenueByCategory.categories &&
                  revenueByCategory.categories.length > 0 ? (
                    <>
                      <div className={styles.chartContainer}>
                        {getRevenueByCategoryChartData() && (
                          <SalesChart
                            type="pie"
                            data={getRevenueByCategoryChartData()}
                          />
                        )}
                      </div>
                      <div className={styles.tableContainer}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revenueByCategory.categories.map(
                              (category, index) => (
                                <tr key={index}>
                                  <td>{category.category}</td>
                                  <td>{formatCurrency(category.revenue)}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p>
                      No revenue by category data available for the selected
                      period.
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed Category Breakdown */}
              <div
                className={`${styles.detailedGrid} ${
                  datesChanged ? styles.dataOutdated : ""
                }`}
              >
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>
                    Detailed Category Breakdown
                  </h2>
                  {revenueByCategory &&
                  revenueByCategory.categories &&
                  revenueByCategory.categories.length > 0 ? (
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Category Revenue</th>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Item Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueByCategory.categories.map(
                            (category, catIndex) => {
                              // If itemssold exists and has items, show detailed breakdown
                              if (
                                category.itemssold &&
                                category.itemssold.length > 0
                              ) {
                                return category.itemssold.map(
                                  (item, itemIndex) => (
                                    <tr
                                      key={`${category.category}-${itemIndex}`}
                                    >
                                      {itemIndex === 0 ? (
                                        <td rowSpan={category.itemssold.length}>
                                          {category.category}
                                        </td>
                                      ) : null}
                                      {itemIndex === 0 ? (
                                        <td rowSpan={category.itemssold.length}>
                                          {formatCurrency(category.revenue)}
                                        </td>
                                      ) : null}
                                      <td>{item.itemName}</td>
                                      <td>{formatCurrency(item.itemPrice)}</td>
                                      <td>{item.quantitySold}</td>
                                      <td>
                                        {formatCurrency(
                                          item.totalRevenue ||
                                            item.itemPrice * item.quantitySold
                                        )}
                                      </td>
                                    </tr>
                                  )
                                );
                              } else {
                                // If no itemssold array or it's empty, just show the category and revenue
                                return (
                                  <tr key={`${category.category}-${catIndex}`}>
                                    <td>{category.category}</td>
                                    <td>{formatCurrency(category.revenue)}</td>
                                    <td colSpan="4">
                                      Item details not available
                                    </td>
                                  </tr>
                                );
                              }
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>
                      No detailed category data available for the selected
                      period.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap the component with RoleProtection to ensure only authorized users can access it
export default RoleProtection(SalesAnalysisPage, ["S", "M"]);
