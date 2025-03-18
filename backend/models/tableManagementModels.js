const pool = require("../db/db");
const { use } = require("../routes/tableManagementRoutes");

async function updateTableStatus(tableNum, isOpen) {
    console.log("Table Number: ", tableNum);
    console.log("New Status: ", isOpen);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('UPDATE tables SET table_status=$1 WHERE table_num=$2', [isOpen, tableNum]);


        if (result.rowCount === 0) {
            throw new Error(`Table number ${tableNum} not found.`);
        }

        await client.query("COMMIT");

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getAllTablesInfo() {
    console.log("Retrieving all tables with reservations");

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        //  Reset table_status for tables with NO future reservations
        // This query is causing issues with the frontend right now, will fix later,
        // but it's not necessary for the current functionality.
        // It's just a nice-to-have feature to reset the table status if there are no future reservations.
        // We can just make sure to cancel any reservation that is past the current time manually
      /*  await client.query(`
            UPDATE tables 
                SET table_status = TRUE 
                WHERE table_num IN (
                 SELECT t.table_num FROM tables t
                    LEFT JOIN reservations r 
                ON t.table_num = r.table_num 
                WHERE r.reservation_id IS NULL 
                OR (r.reservation_time < NOW() AND r.reservation_time IS NOT NULL)
);
        `); */

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
        
        await client.query("COMMIT");
        return result.rows; // ✅ Updated data

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}


async function getAllReservations() {
    console.log("Retrieving all reservations");

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, table_num, customer_name, reservation_time, party_size FROM reservations');


        if (result.rowCount === 0) {
            throw new Error(`No reservations found.`);
        }

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getAllFutureReservations() {
    console.log("Retrieving all reservations");

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, table_num, customer_name, reservation_time, party_size FROM reservations WHERE reservation_time > CURRENT_TIMESTAMP');


        if (result.rowCount === 0) {
            throw new Error(`No reservations found.`);
        }

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getReservationsByCustomerName(customerName) {
    console.log("Retrieving all reservations for: ", customerName);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, table_num, reservation_time, party_size FROM reservations WHERE customer_name=$1',
            [customerName]
        );


        if (result.rowCount === 0) {
            throw new Error(`Customer has no reservations.`);
        }

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getReservationsByTableNum(tableNum) {
    console.log("Retrieving all reservations for table number :", tableNum);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, customer_name, reservation_time, party_size FROM reservations WHERE table_num=$1',
            [tableNum]
        );

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function getFutureReservationsByTableNum(tableNum) {
    console.log("Retrieving all future reservations for table number :", tableNum);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, customer_name, reservation_time, party_size FROM reservations WHERE table_num=$1 AND reservation_time > CURRENT_TIMESTAMP',
            [tableNum]
        );

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function createReservation(customerName, tableNum, partySize, time) {
    console.log("Creating reservation");
    console.log("Customer: ", customerName);
    console.log("Table Number: ", tableNum);
    console.log("Party size: ", partySize);
    console.log("Time: ", time);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query(
            'INSERT INTO reservations (table_num, customer_name, reservation_time, party_size) VALUES ($1, $2, $3, $4) RETURNING reservation_id',
            [tableNum, customerName, time, partySize]
        );
        
        const reservationID = result.rows[0].reservation_id;
        
        await client.query(
            'UPDATE tables SET reservation_id = $1, table_status = FALSE WHERE table_num = $2',
            [reservationID, tableNum]
        );
        await client.query("COMMIT");

        return result;

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }
        console.error("Transaction Failed:", error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function deleteReservationByID(reservationID) {
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const result = await client.query(
            "DELETE FROM reservations WHERE reservation_id=$1 RETURNING table_num",
            [reservationID]
        );
        
        if (result.rowCount > 0) {
            const tableNum = result.rows[0].table_num;
            await client.query(
                "UPDATE tables SET reservation_id = NULL, table_status = TRUE WHERE table_num = $1",
                [tableNum]
            );
        }
        
        if (result.rows.length === 0) {
            throw new Error(`Reservation with id = ${reservationID} not found.`);
        }
        return result;
    } catch (err) {
        console.error("Error removing menu item:", err);
        throw err;
    }

}

async function getTableByNum(tableNum) {
    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const result = await client.query(
            "SELECT * FROM tables WHERE table_num=$1",
            [tableNum]
        );

        if (result.rows.length === 0) {
            throw new Error(`Table number = ${tableNum} not found.`);
        }

        return result;

    } catch (err) {
        console.error("Error removing menu item:", err);
        throw err;
    }
}


module.exports = {
    updateTableStatus,
    getAllTablesInfo,
    getReservationsByCustomerName,
    getFutureReservationsByTableNum,
    createReservation,
    deleteReservationByID,
    getTableByNum
};