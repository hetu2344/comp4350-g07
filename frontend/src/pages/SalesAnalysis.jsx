"use client"

import { useState, useEffect } from "react"
import DashboardNavigation from "../components/layout/DashboardNavigation"
import RoleProtection from "../components/security/RoleProtection"
import {
  getTotalRevenue,
  getTopMenuItems,
  getRevenueByCategory,
  getWeeklySales,
  getDineVsTake,
} from "../services/salesApi"
import SalesChart from "../components/sales/SalesChart"
import styles from "./SalesAnalysis.module.css"

function SalesAnalysisPage({ user }) {
  // State for date range
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for data
  const [totalRevenue, setTotalRevenue] = useState(null)
  const [topMenuItems, setTopMenuItems] = useState(null)
  const [revenueByCategory, setRevenueByCategory] = useState(null)
  const [weeklySales, setWeeklySales] = useState(null)
  const [dineVsTake, setDineVsTake] = useState(null)

  // Check if user has access to this feature
  const hasAccess = user && (user.type === "S" || user.type === "M")

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Load data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel
      const [totalRevenueData, topMenuItemsData, revenueByCategoryData, weeklySalesData, dineVsTakeData] =
        await Promise.all([
          getTotalRevenue(startDate, endDate),
          getTopMenuItems(startDate, endDate),
          getRevenueByCategory(startDate, endDate),
          getWeeklySales(),
          getDineVsTake(startDate, endDate),
        ])

      setTotalRevenue(totalRevenueData)
      setTopMenuItems(topMenuItemsData)
      setRevenueByCategory(revenueByCategoryData)
      setWeeklySales(weeklySalesData)
      setDineVsTake(dineVsTakeData)
    } catch (err) {
      console.error("Error fetching sales data:", err)
      setError("Failed to load sales data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle date range change
  const handleApplyDateRange = () => {
    fetchData()
  }

  // Prepare chart data for weekly sales
  const getWeeklySalesChartData = () => {
    if (!weeklySales) return null

    return {
      labels: weeklySales.weeklySalesData.dailySales.map((day) => day.day_name),
      datasets: [
        {
          label: "Daily Revenue",
          data: weeklySales.weeklySalesData.dailySales.map((day) => day.daily_revenue),
          backgroundColor: "rgba(255, 140, 66, 0.6)",
          borderColor: "rgba(255, 140, 66, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  // Prepare chart data for dine-in vs take-out
  const getDineVsTakeChartData = () => {
    if (!dineVsTake) return null

    return {
      labels: dineVsTake.dineVsTakeDetails.byOrderType.map((type) => type.order_type),
      datasets: [
        {
          label: "Revenue",
          data: dineVsTake.dineVsTakeDetails.byOrderType.map((type) => type.total_revenue),
          backgroundColor: ["rgba(255, 140, 66, 0.6)", "rgba(75, 192, 192, 0.6)"],
          borderColor: ["rgba(255, 140, 66, 1)", "rgba(75, 192, 192, 1)"],
          borderWidth: 1,
        },
      ],
    }
  }

  // Prepare chart data for revenue by category
  const getRevenueByCategoryChartData = () => {
    if (!revenueByCategory) return null

    return {
      labels: revenueByCategory.categories.map((category) => category.category),
      datasets: [
        {
          label: "Revenue by Category",
          data: revenueByCategory.categories.map((category) => category.revenue),
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
    }
  }

  // Prepare chart data for top menu items
  const getTopMenuItemsChartData = () => {
    if (!topMenuItems) return null

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
    }
  }

  return (
    <div>
      <DashboardNavigation />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Sales Analysis</h1>
            <p className={styles.subtitle}>
              {totalRevenue ? `Data for ${totalRevenue.startDate} to ${totalRevenue.endDate}` : "Loading date range..."}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className={`${styles.dateRangeContainer} ${!hasAccess ? styles.disabledOverlay : ""}`}>
          <div>
            <label htmlFor="startDate">Start Date:</label>
            <input
              id="startDate"
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!hasAccess}
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!hasAccess}
            />
          </div>
          <button className={styles.applyButton} onClick={handleApplyDateRange} disabled={!hasAccess}>
            Apply
          </button>
        </div>

        {/* Error Message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Loading State */}
        {isLoading && <p>Loading sales data...</p>}

        {/* Main Content */}
        <div className={`${!hasAccess ? styles.disabledOverlay : ""}`}>
          {!isLoading && !error && (
            <>
              {/* Revenue Overview */}
              <div className={styles.dashboardGrid}>
                {/* Total Revenue Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Revenue Overview</h2>
                  {totalRevenue && (
                    <>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Total Revenue:</span>
                        <span className={styles.statValue}>
                          {formatCurrency(totalRevenue.revenueDetails.total.total_revenue)}
                        </span>
                      </div>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Total Orders:</span>
                        <span className={styles.statValue}>{totalRevenue.revenueDetails.total.total_orders}</span>
                      </div>
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
                            {totalRevenue.revenueDetails.byStatus.map((status, index) => (
                              <tr key={index}>
                                <td>{status.order_status}</td>
                                <td>{status.total_orders}</td>
                                <td>{formatCurrency(status.total_revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* Dine-In vs Take-Out Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Dine-In vs Take-Out</h2>
                  {dineVsTake && (
                    <>
                      <div className={styles.chartContainer}>
                        <SalesChart type="pie" data={getDineVsTakeChartData()} />
                      </div>
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
                            {dineVsTake.dineVsTakeDetails.byOrderType.map((type, index) => (
                              <tr key={index}>
                                <td>{type.order_type}</td>
                                <td>{type.total_orders}</td>
                                <td>{formatCurrency(type.total_revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* Weekly Sales Card */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Weekly Sales</h2>
                  {weeklySales && (
                    <>
                      <div className={styles.chartContainer}>
                        <SalesChart type="bar" data={getWeeklySalesChartData()} />
                      </div>
                      <div className={styles.statContainer}>
                        <span className={styles.statLabel}>Weekly Total:</span>
                        <span className={styles.statValue}>
                          {formatCurrency(weeklySales.weeklySalesData.weeklyTotal)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Top Menu Items and Revenue by Category */}
              <div className={styles.dashboardGrid}>
                {/* Top Menu Items */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Top Selling Items</h2>
                  {topMenuItems && (
                    <>
                      <div className={styles.chartContainer}>
                        <SalesChart type="bar" data={getTopMenuItemsChartData()} />
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
                  )}
                </div>

                {/* Revenue by Category */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Revenue by Category</h2>
                  {revenueByCategory && (
                    <>
                      <div className={styles.chartContainer}>
                        <SalesChart type="pie" data={getRevenueByCategoryChartData()} />
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
                            {revenueByCategory.categories.map((category, index) => (
                              <tr key={index}>
                                <td>{category.category}</td>
                                <td>{formatCurrency(category.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Detailed Category Breakdown */}
              <div className={styles.dashboardGrid}>
                <div className={`${styles.card} ${styles.fullWidthCard}`}>
                  <h2 className={styles.cardTitle}>Detailed Category Breakdown</h2>
                  {revenueByCategory && (
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Item</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueByCategory.categories.map((category) =>
                            category.itemssold.map((item, itemIndex) => (
                              <tr key={`${category.category}-${itemIndex}`}>
                                {itemIndex === 0 ? (
                                  <td rowSpan={category.itemssold.length}>{category.category}</td>
                                ) : null}
                                <td>{item.itemName}</td>
                                <td>{formatCurrency(item.itemPrice)}</td>
                                <td>{item.quantitySold}</td>
                                <td>{formatCurrency(item.itemPrice * item.quantitySold)}</td>
                              </tr>
                            )),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrap the component with RoleProtection to ensure only authorized users can access it
export default RoleProtection(SalesAnalysisPage, ["S", "M", "E"])

