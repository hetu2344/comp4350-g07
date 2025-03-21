const pool = require('../db/db');

exports.totalRevenueDetails = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT order_status, 
               COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE DATE(order_time) BETWEEN $1 AND $2
        GROUP BY order_status`, [start, end]);

    const totalSummary = await pool.query(`
        SELECT COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE DATE(order_time) BETWEEN $1 AND $2`, [start, end]);

    return {
        byStatus: rows,
        total: totalSummary.rows[0]
    };
};

exports.topMenuItems = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT m.item_id, m.item_name, SUM(oi.quantity) AS quantity_sold
        FROM order_items oi
        JOIN menu_items m ON oi.menu_item_id = m.item_id
        JOIN orders o ON oi.order_id = o.order_id
        WHERE DATE(o.order_time) BETWEEN $1 AND $2
        GROUP BY m.item_id, m.item_name
        ORDER BY quantity_sold DESC LIMIT 3`, [start, end]);
    return rows;
};

// exports.revenueByCategory = async (start, end) => {
//     const { rows } = await pool.query(`
//         SELECT c.name AS category, SUM(oi.quantity * oi.item_price) AS revenue
//         FROM order_items oi
//         JOIN menu_items m ON oi.menu_item_id = m.item_id
//         JOIN menu_categories c ON m.category_id = c.id
//         JOIN orders o ON oi.order_id = o.order_id
//         WHERE o.order_status='Completed' AND DATE(o.order_time) BETWEEN $1 AND $2
//         GROUP BY c.name`, [start, end]);
//     return rows;
// };

// exports.revenueByCategoryWithItems = async (start, end) => {
//     const { rows } = await pool.query(`
//         SELECT c.name AS category, 
//                SUM(oi.quantity * oi.item_price) AS revenue,
//                json_agg(json_build_object(
//                    'itemName', m.item_name,
//                    'itemPrice', m.price,
//                    'quantitySold', oi.quantity
//                )) AS itemsSold
//         FROM order_items oi
//         JOIN menu_items m ON oi.menu_item_id = m.item_id
//         JOIN menu_categories c ON m.category_id = c.id
//         JOIN orders o ON oi.order_id = o.order_id
//         WHERE o.order_status='Completed' AND DATE(o.order_time) BETWEEN $1 AND $2
//         GROUP BY c.name`, [start, end]);
//     return rows;
// };

exports.revenueByCategoryWithItems = async (start, end) => {
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

    return rows;
};




exports.averageOrderValue = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT COALESCE(AVG(total_price), 0) AS average 
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2`, [start, end]);
    return rows[0].average;
};

exports.dailyTrend = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT DATE(order_time) AS date, SUM(total_price) AS revenue 
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2
        GROUP BY date ORDER BY date`, [start, end]);
    return rows;
};

// exports.dineVsTakeRevenue = async (start, end) => {
//     const { rows } = await pool.query(`
//         SELECT order_type, SUM(total_price) AS revenue 
//         FROM orders
//         WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2
//         GROUP BY order_type`, [start, end]);
//     return rows;
// };
exports.dineVsTakeRevenueDetails = async (start, end) => {
    const { rows } = await pool.query(`
        SELECT order_type, 
               COUNT(order_id) AS total_orders, 
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2
        GROUP BY order_type`, [start, end]);

    const categoryTotal = await pool.query(`
        SELECT COUNT(order_id) AS total_orders,
               SUM(total_price) AS total_revenue
        FROM orders
        WHERE order_status='Completed' AND DATE(order_time) BETWEEN $1 AND $2`, [start, end]);

    return {
        byOrderType: rows,
        overallTotal: categoryTotal.rows[0]
    };
};
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

    const totalWeekRevenue = await pool.query(`
        SELECT SUM(total_price) AS weekly_total
        FROM orders
        WHERE order_status='Completed' 
          AND DATE(order_time) >= DATE_TRUNC('week', CURRENT_DATE)
          AND DATE(order_time) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'`);

    return {
        dailySales: rows,
        weeklyTotal: totalWeekRevenue.rows[0].weekly_total
    };
};