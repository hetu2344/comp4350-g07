const {
  getAllTablesInfo,
  getReservationsByCustomerName,
  getFutureReservationsByTableNum,

} = require("../models/tableManagementModels");

const pool = require("../db/db");

function parseLocalDateTime(datetimeString) {
  if (!datetimeString || typeof datetimeString !== "string" || !datetimeString.includes("T")) {
    return new Date("Invalid Date");
  }
  const [datePart, timePart] = datetimeString.split("T");
  if (!timePart) return new Date("Invalid Date");

  const dateParts = datePart.split("-");
  if (dateParts.length !== 3) return new Date("Invalid Date");
  const [year, month, day] = dateParts.map(Number);

  const timeParts = timePart.split(":");
  if (timeParts.length < 2) return new Date("Invalid Date");
  // Allow seconds to be optional
  const [hour, minute, second = 0] = timeParts.map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

async function addReservation(req, res) {
  try {
    const { name, tableNum, partySize, time } = req.body; // Accept tableNum from frontend

    if (!name || !tableNum || !partySize || partySize < 1 || !time) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    const BUFFER_MINUTES = 90; //1 hour 30 minutes time slots for reservations
    const ADVANCE_MINUTES = 45; //45 minutes required before reservation

    const reservationTime = parseLocalDateTime(time);

    if (isNaN(reservationTime.getTime())) {
      return res.status(400).json({ error: "Invalid date format provided." });
    }

    const currentTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Winnipeg" })
    );
    console.log("Current TIme", currentTime.toLocaleString());
    console.log("RESERVATION ", reservationTime.toLocaleString());
    const futureTime = new Date(
      currentTime.getTime() + ADVANCE_MINUTES * 60 * 1000
    );
    console.log("FUTURE", futureTime.toLocaleString());
    if (reservationTime < futureTime) {
      return res.status(400).json({
        error: "Reservations must be at least 45 minutes in advance.",
      });
    }

    console.log(`Checking table ${tableNum} availability...`);

    // Ensure the selected table exists and is available
    const tableCheckQuery = `
            SELECT  num_seats FROM tables 
            WHERE table_num = $1
        `;
    const tableCheck = await pool.query(tableCheckQuery, [tableNum]);

    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: "Selected table does not exist." });
    }

    const { num_seats } = tableCheck.rows[0];

    if (partySize > num_seats) {
      return res
        .status(400)
        .json({ error: "Party size exceeds table capacity." });
    }

    // if (!table_status) {
    //     return res.status(400).json({ error: "Selected table is already reserved." });
    // }

    const timeConflictQuery = `
      SELECT 1
      FROM reservations
      WHERE table_num = $1
        AND reservation_time BETWEEN ($2::timestamp - INTERVAL '${BUFFER_MINUTES} minutes')
                                 AND ($2::timestamp + INTERVAL '${BUFFER_MINUTES} minutes')
    `;

    const timeConflict = await pool.query(timeConflictQuery, [
      tableNum,
      reservationTime,
    ]);

    if (timeConflict.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "This table is already reserved at selected time." });
    }

    console.log(
      ` Table ${tableNum} is available, proceeding with reservation...`
    );

    // Create the reservation using the selected table
    const insertQuery = `
            INSERT INTO reservations (table_num, customer_name, reservation_time, party_size)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
    const result = await pool.query(insertQuery, [
      tableNum,
      name,
      reservationTime,
      partySize,
    ]);

    res.json({
      message: "Reservation successfully added!",
      reservation: result.rows[0],
    });
  } catch (err) {
    console.error("Error while adding reservation:", err.message);
    res.status(500).json({ error: "Server Error: Unable to add reservation." });
  }
}

async function deleteReservation(req, res) {
  try {
    const { reservationId } = req.params; // Get ID from URL
    console.log("Received DELETE request for reservation ID:", reservationId);

    if (!reservationId || isNaN(reservationId)) {
      console.error("Invalid reservation ID received:", reservationId);
      return res.status(400).json({ error: "Invalid input provided." });
    }

    const client = await pool.connect();
    await client.query("BEGIN");

    // Retrieve the table number before deleting the reservation
    const result = await client.query(
      "SELECT table_num FROM reservations WHERE reservation_id = $1",
      [reservationId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(404).json({ error: "Reservation not found." });
    }

    const tableNum = result.rows[0].table_num;

    // Delete the reservation
    await client.query("DELETE FROM reservations WHERE reservation_id = $1", [
      reservationId,
    ]);

    await client.query("COMMIT");
    client.release();

    console.log(
      ` Reservation ${reservationId} deleted. Table ${tableNum} is now available.`
    );
    res.json({
      success: true,
      message: "Reservation deleted. Table is now available.",
    });
  } catch (err) {
    console.error("Error deleting reservation:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Unable to delete reservation." });
  }
}

async function getAllTables(req, res) {
  try {
    const tables = await getAllTablesInfo();
    res.json(tables);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch table info." });
  }
}

// async function updateTable(req, res) {
//   try {
//     const { tableNum, isOpen } = req.body;

//     if (!tableNum || typeof isOpen !== "boolean") {
//       return res.status(400).json({ error: "Invalid input provided." });
//     }
//     await updateTableStatus(tableNum, isOpen);

//     res.status(200).json({ message: "Table status updated successfully." });
//   } catch (err) {
//     console.error("Error while updating table:", err.message);
//     res.status(500).json({ error: "Server Error: Unable to update table." });
//   }
// }

async function getReservationsByTable(req, res) {
  try {
    const { tableNum } = req.query;

    if (!tableNum) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    const result = await getFutureReservationsByTableNum(tableNum);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reservations:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch reservations." });
  }
}

async function getReservationsByCustomer(req, res) {
  try {
    const { customerName } = req.query;

    if (!customerName) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    const result = await getReservationsByCustomerName(customerName);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reservations:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch reservations." });
  }
}

module.exports = {
  addReservation,
  deleteReservation,
  getAllTables,
  getReservationsByTable,
  getReservationsByCustomer,
};
