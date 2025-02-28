

const {
    updateTableStatus,
    getAllTablesInfo,
    getReservationsByUserID,
    getFutureReservationsByTableNum,
    createReservation,
    deleteReservationByID,
    getTableByNum

} = require("../models/tableManagementModels");

async function addReservation(req, res) {
    try {
        const { userID, tableNum, partySize, time } = req.body;

        if (!userID || !tableNum || partySize < 1 || !time) {
            return res.status(400).json({ error: "Invalid input provided." });
        }

        const currentTime = new Date();
        const futureTime = new Date(currentTime.getTime() + 45 * 60 * 1000);

        let reservationOffset = 90 * 60 * 1000;

        if (time < futureTime) {
            return res.status(400).json({ error: "Reservations must be made at least 45 minutes in advance." });
        }

        const table = await getTableByNum(tableNum);

        const allTableReservations = await getFutureReservationsByTableNum(tableNum);

        let flag = false;

        for (let i = 0; i < allTableReservations.length; i++) {
            if (Math.abs(allTableReservations[i].reservation_time - time) <= reservationOffset) {
                flag = true;
            }
        }

        if (flag) {
            return res.status(400).json({ error: "Reservation is unavailable for this table at the give time" });
        }

        const result = await createReservation(userID, tableNum, partySize, time);

        return result;

    } catch (err) {
        console.error("Error while updating:", err.message);
        if (err.message.includes("not found")) {
            return res.status(404).json({ error: "Table was not found." });
        }
        res
            .status(500)
            .json({ error: "Server Error : Unable to update the menu item." });
    }
}

async function deleteReservation(req, res) {
    try {
        const { reservationID } = req.body;

        if (!reservationID) {
            return res.status(400).json({ error: "Invalid input provided." });
        }

        const result = await deleteReservationByID(reservationID);

        return result;

    } catch (err) {
        console.error("Error while updating:", err.message);
        if (err.message.includes("not found")) {
            return res.status(404).json({ error: "Reservation not found." });
        }
        res
            .status(500)
            .json({ error: "Server Error : Unable to update the menu item." });
    }
}


async function getAllTables(req, res) {
    try {
        const tables = await getAllTablesInfo();
        res.json(tables);

        return tables;

    } catch (err) {
        console.log(err);

        if (err.message.includes("No tables found.")) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: "Server Error: Unable to fetch table info." });
    }


}


async function updateTable(req, res) {


    try {
        const { tableID, isOpen } = req.body; // NEEDS TO CHANGE DEPENDING ON THE FORM OF THE MESSAGE BODY

        if (!tableID || typeof isOpen !== "boolean") {
            return res.status(400).json({ error: "Invalid input provided." });
        }

        const result = await updateTableStatus(tableID, isOpen);

        return result;

    } catch (err) {
        console.error("Error while updating:", err.message);
        if (err.message.includes("not found")) {
            return res.status(404).json({ error: "Table not found." });
        }
        res
            .status(500)
            .json({ error: "Server Error : Unable to update the menu item." });
    }

}


async function getReservationsByTable(req, res) {
    try {
        const { tableNum } = req.body; // NEEDS TO CHANGE BASED ON BODY OF MESSAGE

        if (!tableNum) {
            return res.status(400).json({ error: "Invalid input provided." });
        }

        const result = await getFutureReservationsByTableNum(tableNum);

        return result;

    } catch (err) {
        console.error("Error while updating:", err.message);
        if (err.message.includes("no reservations")) {
            return res.status(404).json({ error: "Table provided has no reservations." });
        }
        res
            .status(500)
            .json({ error: "Server Error : Unable to update the menu item." });
    }
}


async function getReservationsByUser(req, res) {
    try {
        const { userID } = req.body; // NEEDS TO CHANGE DEPENDING ON THE FORM OF THE MESSAGE BODY

        if (!userID) {
            return res.status(400).json({ error: "Invalid input provided." });
        }

        const result = await getReservationsByUserID(userID);

        return result;

    } catch (err) {
        console.error("Error while updating:", err.message);
        if (err.message.includes("no reservation")) {
            return res.status(404).json({ error: "No reservations found for user." });
        }
        res
            .status(500)
            .json({ error: "Server Error : Unable to update the menu item." });
    }
}


module.exports = {
    addReservation,
    deleteReservation,
    getAllTables,
    updateTable,
    getReservationsByTable,
    getReservationsByUser

}