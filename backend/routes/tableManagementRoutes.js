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

router.get("/", getAllTables); // Returns all tables, including table num, status, and number of seats

router.post("/", updateTable); // Change status of the table, new status in body json with isOpen as title

router.post("/reservation", addReservation); // Adds a reservation, user

router.get("/reservation/table", getReservationsByTable);

router.get("/reservation/customer", getReservationsByCustomer);

router.delete("/reservation/:reservationId", deleteReservation);


module.exports = router;