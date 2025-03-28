const pool = require("../db/db");
const { use } = require("../routes/tableManagementRoutes");


// Method that makes SQL query to get all tables with reservations
async function getAllTablesInfo() {

    console.log("Retrieving all tables with reservations");


    let client;
    try {
        client = await pool.connect();

        // Start transaction
        await client.query("BEGIN");

        // Fetch updated table data
        const result = await client.query(`
            SELECT t.table_num, 
                   t.num_seats, 
                   t.table_status, 
                   COALESCE(json_agg(
                        CASE 
                            WHEN r.reservation_id IS NOT NULL AND r.reservation_time >= NOW() THEN 
                                json_build_object(
                                    'reservation_id', r.reservation_id, 
                                    'customer_name', r.customer_name, 
                                    'reservation_time', r.reservation_time, 
                                    'party_size', r.party_size
                                )
                            ELSE NULL 
                        END
                    ) FILTER (WHERE r.reservation_id IS NOT NULL AND r.reservation_time >= NOW()), '[]') AS reservations
            FROM tables t
            LEFT JOIN reservations r ON t.table_num = r.table_num
            GROUP BY t.table_num, t.num_seats, t.table_status;
        `);
        
        // Commit transaction
        await client.query("COMMIT");
        return result.rows; //  Updated data


    } catch (error) {
        // ERROR
        // Rollback transaction
        if (client) {
            await client.query("ROLLBACK");
        }

        throw error;
    } finally {
        // Release client
        if (client) {
            client.release();
        }
    }
}

// Method that makes SQL query to get all reservations by customer name
async function getReservationsByCustomerName(customerName) {
    console.log("Retrieving all reservations for: ", customerName);

    let client;
    try {
        client = await pool.connect();
        
        // Start transaction
        await client.query("BEGIN");

        // Fetch reservations
        const result = await client.query('SELECT reservation_id, table_num, reservation_time, party_size FROM reservations WHERE customer_name=$1',
            [customerName]
        );

        // Commit transaction
        if (result.rowCount === 0) {
            throw new Error(`Customer has no reservations.`);
        }

        // Return the response
        return result;

    } catch (error) {
        // ERROR
        // Rollback transaction
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        // Release client
        if (client) {
            client.release();
        }
    }
}

// Method that makes SQL query to get all future reservations by table number
async function getFutureReservationsByTableNum(tableNum) {
    console.log("Retrieving all future reservations for table number :", tableNum);

    let client;
    try {
        client = await pool.connect();

        // Start transaction
        await client.query("BEGIN");


        // Fetch reservations
        const result = await client.query('SELECT reservation_id, customer_name, reservation_time, party_size FROM reservations WHERE table_num=$1 AND reservation_time > CURRENT_TIMESTAMP',
            [tableNum]
        );

        // Commit transaction
        return result;

    } catch (error) {
        // ERROR
        // Rollback transaction
        if (client) {
            await client.query("ROLLBACK");
        }
        throw error;
    } finally {
        // Release client
        if (client) {
            client.release();
        }
    }
}

// Export the functions
module.exports = {
    getAllTablesInfo,
    getReservationsByCustomerName,
    getFutureReservationsByTableNum,
};