const pool = require('../db/db');

// Method that makes SQL query to get total revenue and returns response
exports.totalRevenueDetails = async (start, end) => {

    // SQL Query
    const { rows } = await pool.query(`
        SELECT order_status, 
               COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE DATE(order_time) BETWEEN $1 AND $2
        GROUP BY order_status`, [start, end]);

        // SQL Query
    const totalSummary = await pool.query(`
        SELECT COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE DATE(order_time) BETWEEN $1 AND $2`, [start, end]);

        // Return the response
    return {
        byStatus: rows,
        total: totalSummary.rows[0]
    };
};

// Method that makes SQL query to get top 3 menu items and returns response
exports.topMenuItems = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT m.item_id, m.item_name, SUM(oi.quantity) AS quantity_sold
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE DATE(o.order_time) BETWEEN $1 AND $2
        GROUP BY m.item_id, m.item_name
        ORDER BY quantity_sold DESC LIMIT 3`, [start, end]);

        // Return the response
    return rows;
};


// Method that makes SQL query to get revenue by category and returns response
exports.revenueByCategoryWithItems = async (start, end) => {
    // SQL Query
    const { rows } = await pool.query(`
        SELECT
            c.name AS category,
            SUM(item_summary.total_revenue) AS revenue,
            json_agg(json_build_object(
                'itemName', item_summary.item_name,
                'itemPrice', item_summary.price,
                'quantitySold', item_summary.total_quantity,
                'totalRevenue', item_summary.total_revenue
            )) AS itemsSold
        FROM (
            SELECT
                m.item_id,
                m.item_name,
                m.price,
                m.category_id,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.quantity * oi.item_price) AS total_revenue
            FROM order_items oi
            JOIN menu_items m ON oi.menu_item_id = m.item_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE DATE(o.order_time) BETWEEN $1 AND $2
            GROUP BY m.item_id, m.item_name, m.price, m.category_id
        ) AS item_summary
        JOIN menu_categories c ON item_summary.category_id = c.id
        GROUP BY c.name
        ORDER BY c.name;
    `, [start, end]);

    // Return the response
    return rows;
};



// Method that makes SQL query to get average order value and returns response
exports.averageOrderValue = async (start, end) => {
    // SQL Query
    const { rows } = await pool.query(`
        SELECT COALESCE(AVG(total_price), 0) AS average 
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2`, [start, end]);
    
    // Return the response
        return rows[0].average;
};

// Method that makes SQL query to get daily trend and returns response
exports.dailyTrend = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT DATE(order_time) AS date, SUM(total_price) AS revenue 
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2
        GROUP BY date ORDER BY date`, [start, end]);

        // Return the response
    return rows;
};

// Method that makes SQL query to get dine-in vs take-away revenue and returns response
exports.dineVsTakeRevenueDetails = async (start, end) => {

    // SQL Query
    const { rows } = await pool.query(`
        SELECT order_type, 
               COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2
        GROUP BY order_type`, [start, end]);

    // SQL Query
    const categoryTotal = await pool.query(`
        SELECT COUNT(order_id) AS total_orders,
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2`, [start, end]);

        // Return the response
    return {
        byOrderType: rows,
        overallTotal: categoryTotal.rows[0]
    };
};

// Method that makes SQL query to get weekly sales details and returns response
exports.weeklySalesDetails = async () => {
    const { rows } = await pool.query(`
        SELECT TRIM(TO_CHAR(DATE(order_time), 'Day')) AS day_name,
               TO_CHAR(DATE(order_time), 'YYYY-MM-DD') AS date,
               SUM(total_price) AS daily_revenue
        FROM orders
        WHERE order_status='Completed' 
          AND DATE(order_time) >= DATE_TRUNC('week', CURRENT_DATE)
          AND DATE(order_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
        GROUP BY day_name, date
        ORDER BY date`);

        // SQL Query
    const totalWeekRevenue = await pool.query(`
        SELECT SUM(total_price) AS weekly_total
        FROM orders
        WHERE order_status='Completed' 
          AND DATE(order_time) >= DATE_TRUNC('week', CURRENT_DATE)
          AND DATE(order_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`);

        // Return the response
    return {
        dailySales: rows,
        weeklyTotal: totalWeekRevenue.rows[0].weekly_total
    };
};