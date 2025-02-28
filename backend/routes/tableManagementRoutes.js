
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

router.get("/", getAllTables);

router.post("/", updateTable);

router.post("/reservation", addReservation);

router.get("/reservation/table", getReservationsByTable);

router.get("/reservation/user", getReservationsByUser);

router.delete("/reservation", deleteReservation);


module.exports = router;