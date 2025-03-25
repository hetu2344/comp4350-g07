// Things that might need to be changed:
// I just chose names for 


const express = require("express");

const {
    addReservation,
    deleteReservation,
    getAllTables,
    updateTable,
    getReservationsByTable,
    getReservationsByCustomer

} = require("../controllers/tableManagementControllers");


const router = express.Router();
// Returns all tables, including table num, status, and number of seats
router.get("/", getAllTables); 

// Adds a reservation, user
router.post("/reservation", addReservation); 

//Gets reservation by table
router.get("/reservation/table", getReservationsByTable);

// Getting reservations by customer name
router.get("/reservation/customer", getReservationsByCustomer);

// Deleting reservations
router.delete("/reservation/:reservationId", deleteReservation);

module.exports = router;