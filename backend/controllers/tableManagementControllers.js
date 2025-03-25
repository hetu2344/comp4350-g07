const {
  getAllTablesInfo,
  getReservationsByCustomerName,
  getFutureReservationsByTableNum,
} = require("../models/tableManagementModels");

const pool = require("../db/db");

// Method that parses local date and time
function parseLocalDateTime(datetimeString) {
  if (
    !datetimeString ||
    typeof datetimeString !== "string" ||
    !datetimeString.includes("T")
  ) {
    return new Date("Invalid Date");
  }
  const [datePart, timePart] = datetimeString.split("T");
  if (!timePart) return new Date("Invalid Date");

  const dateParts = datePart.split("-");
  if (dateParts.length !== 3) return new Date("Invalid Date");
  const [year, month, day] = dateParts.map(Number);

  const timeParts = timePart.split(":");
  if (timeParts.length < 2) return new Date("Invalid Date");
  const [hour, minute, second = 0] = timeParts.map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}

// method to add a reservation
async function addReservation(req, res) {
  try {
    // Getting the required items
    const { name, tableNum, partySize, time } = req.body; // Accept tableNum from frontend

    // Checking required body items
    if (!name || !tableNum || !partySize || partySize < 1 || !time) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    const BUFFER_MINUTES = 90; //1 hour 30 minutes time slots for reservations
    const ADVANCE_MINUTES = 45; //45 minutes required before reservation

    const reservationTime = parseLocalDateTime(time);

    if (isNaN(reservationTime.getTime())) {
      return res.status(400).json({ error: "Invalid date format provided." });
    }

    // Getting current time
    const currentTime = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Winnipeg" })
    );

    // getting time after 45 minutes of reservation time
    const futureTime = new Date(
      currentTime.getTime() + ADVANCE_MINUTES * 60 * 1000
    );

    // Cheking if reservation is being made more than 45 minutes earlier
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

    // If table does not exists
    if (tableCheck.rows.length === 0) {
      return res.status(404).json({ error: "Selected table does not exist." });
    }

    // Checking number of seats in table
    const { num_seats } = tableCheck.rows[0];

    // Checking if reservation party size can be accumalted in that specific table
    if (partySize > num_seats) {
      return res
        .status(400)
        .json({ error: "Party size exceeds table capacity." });
    }

    // Checking time conflict query
    const timeConflictQuery = `
      SELECT 1
      FROM reservations
      WHERE table_num = $1
        AND reservation_time BETWEEN ($2::timestamp - INTERVAL '${BUFFER_MINUTES} minutes')
                                 AND ($2::timestamp + INTERVAL '${BUFFER_MINUTES} minutes')
    `;

    // Checking if there is already reservation at that time

    const timeConflict = await pool.query(timeConflictQuery, [
      tableNum,
      reservationTime,
    ]);

    // if get a time conflict send error
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

    // Make a reservation
    const result = await pool.query(insertQuery, [
      tableNum,
      name,
      reservationTime,
      partySize,
    ]);

    // Send response
    res.json({
      message: "Reservation successfully added!",
      reservation: result.rows[0],
    });
  } catch (err) {
    // Error
    console.error("Error while adding reservation:", err.message);
    res.status(500).json({ error: "Server Error: Unable to add reservation." });
  }
}

// Deleting a reservation
async function deleteReservation(req, res) {
  try {
    const { reservationId } = req.params; // Get ID from URL
    console.log("Received DELETE request for reservation ID:", reservationId);

    // Checking if reservation id is correct
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

    // if there are no reservations found
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      client.release();
      return res.status(404).json({ error: "Reservation not found." });
    }

    // Getting table num
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

    // Sending response
    res.json({
      success: true,
      message: "Reservation deleted. Table is now available.",
    });
  } catch (err) {
    // Error
    console.error("Error deleting reservation:", err.message);
    res
      .status(500)
      .json({ error: "Server Error: Unable to delete reservation." });
  }
}

// Getting all the tables
async function getAllTables(req, res) {
  try {
    // Getting all tables information
    const tables = await getAllTablesInfo();

    // Sending Response
    res.json(tables);
  } catch (err) {
    // Error
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch table info." });
  }
}

// Getting reservations by table
async function getReservationsByTable(req, res) {
  try {
    // getting the table number
    const { tableNum } = req.query;

    // if no table num
    if (!tableNum) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    // getting the future reservations
    const result = await getFutureReservationsByTableNum(tableNum);

    // Sending resonse
    res.status(200).json(result);
  } catch (err) {
    // Error
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch reservations." });
  }
}

// Getting reservations by customer
async function getReservationsByCustomer(req, res) {
  try {
    // Getting customer name
    const { customerName } = req.query;

    // if no customer name
    if (!customerName) {
      return res.status(400).json({ error: "Invalid input provided." });
    }

    // Getting reservation by customer name
    const result = await getReservationsByCustomerName(customerName);

    // Sending respone
    res.status(200).json(result);
  } catch (err) {
    // Error
    res
      .status(500)
      .json({ error: "Server Error: Unable to fetch reservations." });
  }
}

// Exporting methods
module.exports = {
  addReservation,
  deleteReservation,
  getAllTables,
  getReservationsByTable,
  getReservationsByCustomer,
};
