
const express = require("express");

const {
    addReservation,
    deleteReservation,
    getAllTables,
    updateTable,
    getReservationsByTable,
    getReservationsByUser

} = require("../controllers/tableManagementControllers");


const router = express.Router();

router.get("/tables", getAllTables);

router.post("/tables/:id", updateTable);

router.post("/reservation", addReservation);

router.get("/reservation/table/:id", getReservationsByTable);

router.get("/reservation/user/:id", getReservationsByUser);

router.delete("/reservation/:id", deleteReservation);


module.exports = router;