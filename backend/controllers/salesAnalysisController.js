const salesModel = require('../models/salesAnalysisModel');

const parseDatesOrToday = (req) => {
    let { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        const today = new Date().toISOString().split('T')[0];
        startDate = endDate = today;
    }
    return { startDate, endDate };
};

exports.getTotalRevenueDetails = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const revenueDetails = await salesModel.totalRevenueDetails(startDate, endDate);
        res.json({ startDate, endDate, revenueDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTopMenuItems = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const items = await salesModel.topMenuItems(startDate, endDate);
        res.json({ startDate, endDate, items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// exports.getRevenueByCategory = async (req, res) => {
//     try {
//         const { startDate, endDate } = parseDatesOrToday(req);
//         const categories = await salesModel.revenueByCategory(startDate, endDate);
//         res.json({ startDate, endDate, categories });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

exports.getRevenueByCategoryWithItems = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const categoriesWithItems = await salesModel.revenueByCategoryWithItems(startDate, endDate);
        res.json({ startDate, endDate, categories: categoriesWithItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAverageOrderValue = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const average = await salesModel.averageOrderValue(startDate, endDate);
        res.json({ startDate, endDate, averageOrderValue: average });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDailyTrend = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const trend = await salesModel.dailyTrend(startDate, endDate);
        res.json({ startDate, endDate, dailySales: trend });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// exports.getDineVsTakeRevenue = async (req, res) => {
//     try {
//         const { startDate, endDate } = parseDatesOrToday(req);
//         const result = await salesModel.dineVsTakeRevenue(startDate, endDate);
//         res.json({ startDate, endDate, dineVsTakeRevenue: result });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

exports.getDineVsTakeRevenueDetails = async (req, res) => {
    try {
        const { startDate, endDate } = parseDatesOrToday(req);
        const dineVsTakeDetails = await salesModel.dineVsTakeRevenueDetails(startDate, endDate);
        res.json({ startDate, endDate, dineVsTakeDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWeeklySalesDetails = async (req, res) => {
    try {
        const weeklySalesData = await salesModel.weeklySalesDetails();
        res.json({ weeklySalesData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
