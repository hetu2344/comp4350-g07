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

router.get('/totalRevenue', authenticateToken, authorizeRoles, getTotalRevenueDetails);
router.get('/topMenuItems', authenticateToken, authorizeRoles, getTopMenuItems);
router.get('/revenueByCategory', authenticateToken, authorizeRoles, getRevenueByCategoryWithItems);
router.get('/averageOrderValue', authenticateToken, authorizeRoles, getAverageOrderValue);
router.get('/dailyTrend', authenticateToken, authorizeRoles, getDailyTrend);
router.get('/dinevstake', authenticateToken, authorizeRoles, getDineVsTakeRevenueDetails);
router.get('/weeklySales', authenticateToken, authorizeRoles, getWeeklySalesDetails);

module.exports = router;
