const salesModel = require("../models/salesAnalysisModel");

// Method that helps parse dates or assign date as today
const parseDatesOrToday = (req) => {
  let { startDate, endDate } = req.query;

  // if start and end date is not specified set both to today
  if (!startDate || !endDate) {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60000);
    const localISODate = localDate.toISOString().split("T")[0];

    startDate = endDate = localISODate;
  }

  return { startDate, endDate };
};

// Getting total revenue
exports.getTotalRevenueDetails = async (req, res) => {
  try {
    // Getting the date
    const { startDate, endDate } = parseDatesOrToday(req);
    // Getting revenue details
    const revenueDetails = await salesModel.totalRevenueDetails(
      startDate,
      endDate
    );

    // Sending the response
    res.json({ startDate, endDate, revenueDetails });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting the best selling menu items
exports.getTopMenuItems = async (req, res) => {
  try {
    // Getting dates
    const { startDate, endDate } = parseDatesOrToday(req);

    // Getting top selling menu items
    const items = await salesModel.topMenuItems(startDate, endDate);

    // Send response
    res.json({ startDate, endDate, items });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting revenue by category
exports.getRevenueByCategoryWithItems = async (req, res) => {
  try {
    // Getting dates requested
    const { startDate, endDate } = parseDatesOrToday(req);

    // Getting revenue by category
    const categoriesWithItems = await salesModel.revenueByCategoryWithItems(
      startDate,
      endDate
    );

    // Sending response
    res.json({ startDate, endDate, categories: categoriesWithItems });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting average of order value between dates
exports.getAverageOrderValue = async (req, res) => {
  try {
    // Getting start and end dates
    const { startDate, endDate } = parseDatesOrToday(req);

    // Getting avg order value
    const average = await salesModel.averageOrderValue(startDate, endDate);

    // Sending response
    res.json({ startDate, endDate, averageOrderValue: average });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting Daily Trends
exports.getDailyTrend = async (req, res) => {
  try {
    // Getting start and end dates
    const { startDate, endDate } = parseDatesOrToday(req);

    // getting the daily trend
    const trend = await salesModel.dailyTrend(startDate, endDate);

    // Sending response
    res.json({ startDate, endDate, dailySales: trend });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting revenue details comparinging dine in and take out orders
exports.getDineVsTakeRevenueDetails = async (req, res) => {
  try {
    // Getting start date and end date
    const { startDate, endDate } = parseDatesOrToday(req);

    // Getting revenue details comparing dine in and take out orders
    const dineVsTakeDetails = await salesModel.dineVsTakeRevenueDetails(
      startDate,
      endDate
    );

    // Sending response
    res.json({ startDate, endDate, dineVsTakeDetails });
  } catch (error) {
    // Error
    res.status(500).json({ error: error.message });
  }
};

// Getting weekly sales
exports.getWeeklySalesDetails = async (req, res) => {
  try {
    // Getting weekly sales data
    const weeklySalesData = await salesModel.weeklySalesDetails();

    // Sending response
    res.json({ weeklySalesData });
  } catch (error) {
    // Getting error
    res.status(500).json({ error: error.message });
  }
};
