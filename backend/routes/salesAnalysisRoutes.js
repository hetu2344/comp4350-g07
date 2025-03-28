const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../controllers/authController');
const {
    getTotalRevenue,
    getTopMenuItems,
    getRevenueByCategory,
    getAverageOrderValue,
    getDailyTrend,
    getDineVsTakeRevenue,
    getWeeklySales,
    getTotalRevenueDetails,
    getRevenueByCategoryWithItems,
    getDineVsTakeRevenueDetails,
    getWeeklySalesDetails
} = require('../controllers/salesAnalysisController');

// Getting total revenue
router.get('/totalRevenue', authenticateToken, authorizeRoles, getTotalRevenueDetails);

// Getting top menu items
router.get('/topMenuItems', authenticateToken, authorizeRoles, getTopMenuItems);

// Getting revenue by category
router.get('/revenueByCategory', authenticateToken, authorizeRoles, getRevenueByCategoryWithItems);

// Getting average order value
router.get('/averageOrderValue', authenticateToken, authorizeRoles, getAverageOrderValue);

// Getting daily Trend
router.get('/dailyTrend', authenticateToken, authorizeRoles, getDailyTrend);

// Gettin revenue details compared between dine in and take out orders
router.get('/dinevstake', authenticateToken, authorizeRoles, getDineVsTakeRevenueDetails);

// Getting weekly sales
router.get('/weeklySales', authenticateToken, authorizeRoles, getWeeklySalesDetails);

module.exports = router;
