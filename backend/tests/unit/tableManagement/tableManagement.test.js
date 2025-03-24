// tableManagement.test.js

const {
    addReservation,
    deleteReservation,
    getAllTables,
    getReservationsByTable,
    getReservationsByCustomer,
  } = require("../../../controllers/tableManagementControllers");
  
  const pool = require("../../../db/db");
  const tableManagementModels = require("../../../models/tableManagementModels");
  
  // Helper to simulate Express req and res objects.
  const createResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

const originalToLocaleString = Date.prototype.toLocaleString;
jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function(locale, options) {
  if (options && options.timeZone === "America/Winnipeg") {
    // Return a locale string that does not change the time.
    
    return this.toString();
  }
  return originalToLocaleString.call(this, locale, options);
});
  jest.mock("../../../db/db", () => ({
    query: jest.fn(),
    connect: jest.fn(),
  }));
  
  jest.mock("../../../models/tableManagementModels", () => ({
    getAllTablesInfo: jest.fn(),
    getReservationsByCustomerName: jest.fn(),
    getFutureReservationsByTableNum: jest.fn(),
  }));
  
  describe("tableManagementControllers", () => {
    describe("addReservation", () => {
      let req, res;
      beforeEach(() => {
        req = { body: {} };
        res = createResponse();
        pool.query.mockReset();
      });
  
      test("should return 400 if required fields are missing", async () => {
        req.body = { name: "John", tableNum: 1, partySize: 0, time: "2023-09-01T19:00:00" };
        await addReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid input provided." });
      });
  
      test("should return 400 for invalid date format", async () => {
        req.body = { name: "John", tableNum: 1, partySize: 2, time: "invalid-date" };
        await addReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid date format provided." });
      });
  
      test("should return 400 if reservation is less than 45 minutes in advance", async () => {
        // Set up a fixed "current" time
        const fixedNow = new Date(2020, 0, 1, 12, 0, 0); // Jan 1, 2020, 12:00:00 local time
        jest.useFakeTimers("modern");
        jest.setSystemTime(fixedNow);
      
        // Mock toLocaleString to return a fixed time string
        const toLocaleSpy = jest.spyOn(Date.prototype, "toLocaleString").mockImplementation(function(locale, options) {
          if (options && options.timeZone === "America/Winnipeg") {
            return fixedNow.toISOString().slice(0, 19);
          }
          return originalToLocaleString.call(this, locale, options);
        });
      
        // Create a reservation time 30 minutes in the future (less than required 45 minutes)
        const soon = new Date(fixedNow.getTime() + 30 * 60 * 1000);
        const isoSoon = soon.toISOString().slice(0, 19);
        const req = { body: { name: "John", tableNum: 1, partySize: 2, time: isoSoon } };
        const res = createResponse();
      
        await addReservation(req, res);
      
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "Reservations must be at least 45 minutes in advance.",
        });
      
        toLocaleSpy.mockRestore();
        jest.useRealTimers();
      });
      
  
      test("should return 404 if selected table does not exist", async () => {
        // Create a valid reservation time (1 hour in future)
        const future = new Date(Date.now() + 60 * 60 * 1000);
        const isoFuture = future.toISOString().slice(0, 19);
        req.body = { name: "John", tableNum: 1, partySize: 2, time: `${isoFuture}` };
  
        // Simulate pool.query for tableCheck returning no rows
        pool.query.mockResolvedValueOnce({ rows: [] });
  
        await addReservation(req, res);
        expect(pool.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Selected table does not exist." });
      });
  
      test("should return 400 if party size exceeds table capacity", async () => {
        const future = new Date(Date.now() + 60 * 60 * 1000);
        const isoFuture = future.toISOString().slice(0, 19);
        req.body = { name: "John", tableNum: 1, partySize: 6, time: `${isoFuture}` };
  
        // First query returns a table with num_seats = 4
        pool.query.mockResolvedValueOnce({ rows: [{ num_seats: 4 }] });
  
        await addReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Party size exceeds table capacity." });
      });
  
      test("should return 400 if there is a time conflict", async () => {
        const future = new Date(Date.now() + 60 * 60 * 1000);
        const isoFuture = future.toISOString().slice(0, 19);
        req.body = { name: "John", tableNum: 1, partySize: 2, time: `${isoFuture}` };
  
        // First query: table exists with sufficient seats.
        pool.query.mockResolvedValueOnce({ rows: [{ num_seats: 4 }] });
        // Second query: time conflict exists
        pool.query.mockResolvedValueOnce({ rows: [ { dummy: true } ] });
  
        await addReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          error: "This table is already reserved at selected time.",
        });
      });
  
      test("should successfully add a reservation", async () => {
        const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const isoFuture = future.toISOString().slice(0, 19);
        req.body = { name: "John", tableNum: 1, partySize: 2, time: `${isoFuture}` };
  
        // Table exists with sufficient seats.
        pool.query.mockResolvedValueOnce({ rows: [{ num_seats: 4 }] });
        // No time conflict.
        pool.query.mockResolvedValueOnce({ rows: [] });
        // Insert query returns a new reservation
        const fakeReservation = { reservation_id: 123, table_num: 1, customer_name: "John", reservation_time: future, party_size: 2 };
        pool.query.mockResolvedValueOnce({ rows: [fakeReservation] });
  
        await addReservation(req, res);
        expect(res.json).toHaveBeenCalledWith({
          message: "Reservation successfully added!",
          reservation: fakeReservation,
        });
      });
    });
  
    describe("deleteReservation", () => {
      let req, res, fakeClient;
      beforeEach(() => {
        req = { params: {} };
        res = createResponse();
        fakeClient = {
          query: jest.fn(),
          release: jest.fn(),
        };
        pool.connect.mockReset();
        pool.connect.mockResolvedValue(fakeClient);
      });
  
      test("should return 400 for invalid reservation ID", async () => {
        req.params.reservationId = "abc"; // not a number
        await deleteReservation(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid input provided." });
      });
  
      test("should return 404 if reservation not found", async () => {
        req.params.reservationId = "1";
        // For deleteReservation:
        // 1st call: BEGIN, 2nd call: SELECT query, 3rd call: ROLLBACK.
        fakeClient.query
          .mockResolvedValueOnce() // BEGIN
          .mockResolvedValueOnce({ rows: [] }) // SELECT returns no rows
          .mockResolvedValueOnce(); // ROLLBACK
  
        await deleteReservation(req, res);
        expect(fakeClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Reservation not found." });
      });
  
      test("should successfully delete a reservation", async () => {
        req.params.reservationId = "1";
        // For deleteReservation:
        // 1st call: BEGIN, 2nd call: SELECT returns a row, 3rd call: DELETE, 4th call: COMMIT.
        fakeClient.query
          .mockResolvedValueOnce() // BEGIN
          .mockResolvedValueOnce({ rows: [{ table_num: 5 }] }) // SELECT query
          .mockResolvedValueOnce() // DELETE query
          .mockResolvedValueOnce(); // COMMIT
  
        await deleteReservation(req, res);
        expect(fakeClient.query).toHaveBeenCalledTimes(4);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Reservation deleted. Table is now available.",
        });
        expect(fakeClient.release).toHaveBeenCalled();
      });
    });
  
    describe("getAllTables", () => {
      let req, res;
      beforeEach(() => {
        req = {};
        res = createResponse();
        tableManagementModels.getAllTablesInfo.mockReset();
      });
  
      test("should return table data on success", async () => {
        const fakeTables = [{ table_num: 1, reservations: [] }];
        tableManagementModels.getAllTablesInfo.mockResolvedValue(fakeTables);
        await getAllTables(req, res);
        expect(res.json).toHaveBeenCalledWith(fakeTables);
      });
  
      test("should return 500 on error", async () => {
        tableManagementModels.getAllTablesInfo.mockRejectedValue(new Error("DB error"));
        await getAllTables(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Server Error: Unable to fetch table info.",
        });
      });
    });
  
    describe("getReservationsByTable", () => {
      let req, res;
      beforeEach(() => {
        req = { query: {} };
        res = createResponse();
        tableManagementModels.getFutureReservationsByTableNum.mockReset();
      });
  
      test("should return 400 if tableNum is missing", async () => {
        await getReservationsByTable(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid input provided." });
      });
  
      test("should return reservations on success", async () => {
        req.query.tableNum = "1";
        const fakeReservations = [{ reservation_id: 1 }];
        tableManagementModels.getFutureReservationsByTableNum.mockResolvedValue(fakeReservations);
        await getReservationsByTable(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeReservations);
      });
  
      test("should return 500 on error", async () => {
        req.query.tableNum = "1";
        tableManagementModels.getFutureReservationsByTableNum.mockRejectedValue(new Error("DB error"));
        await getReservationsByTable(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Server Error: Unable to fetch reservations.",
        });
      });
    });
  
    describe("getReservationsByCustomer", () => {
      let req, res;
      beforeEach(() => {
        req = { query: {} };
        res = createResponse();
        tableManagementModels.getReservationsByCustomerName.mockReset();
      });
  
      test("should return 400 if customerName is missing", async () => {
        await getReservationsByCustomer(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid input provided." });
      });
  
      test("should return reservations on success", async () => {
        req.query.customerName = "Alice";
        const fakeReservations = [{ reservation_id: 2 }];
        tableManagementModels.getReservationsByCustomerName.mockResolvedValue(fakeReservations);
        await getReservationsByCustomer(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeReservations);
      });
  
      test("should return 500 on error", async () => {
        req.query.customerName = "Alice";
        tableManagementModels.getReservationsByCustomerName.mockRejectedValue(new Error("DB error"));
        await getReservationsByCustomer(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Server Error: Unable to fetch reservations.",
        });
      });
    });
  });