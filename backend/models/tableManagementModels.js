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
    console.log("Retrieving all tables");

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT table_num, num_seats, table_status FROM tables');


        if (result.rowCount === 0) {
            throw new Error(`No tables found.`);
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

async function getAllReservations() {
    console.log("Retrieving all reservations");

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, table_num, user_id, reservation_time, party_size FROM reservations');


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


        const result = await client.query('SELECT reservation_id, table_num, user_id, reservation_time, party_size FROM reservations WHERE reservation_time > CURRENT_TIMESTAMP');


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

async function getReservationsByUserID(userID) {
    console.log("Retrieving all reservations for user id: ", userID);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('SELECT reservation_id, table_num, reservation_time, party_size FROM reservations WHERE userID=$1',
            [userID]
        );


        if (result.rowCount === 0) {
            throw new Error(`User has no reservations.`);
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


        const result = await client.query('SELECT reservation_id, user_id, reservation_time, party_size FROM reservations WHERE table_num=$1',
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


        const result = await client.query('SELECT reservation_id, user_id, reservation_time, party_size FROM reservations WHERE table_num=$1 AND reservation_time > CURRENT_TIMESTAMP',
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

async function createReservation(userID, tableNum, partySize, time) {
    console.log("Creating reservation");
    console.log("User ID: ", userID);
    console.log("Table Number: ", tableNum);
    console.log("Party size: ", partySize);
    console.log("Time: ", time);

    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");


        const result = await client.query('INSERT INTO reservations (table_num, user_id, reservation_time, party_size) VALUES ($1, $2, $3, $4',
            [tableNum, userID, time, partySize]);

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
            "DELETE FROM reservations WHERE reservation_id=$1 RETURNING *",
            [reservationID]
        );
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
    getReservationsByUserID,
    getFutureReservationsByTableNum,
    createReservation,
    deleteReservationByID,
    getTableByNum
};