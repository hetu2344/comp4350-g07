// tableManagementModels.test.js

const {
    getAllTablesInfo,
    getReservationsByCustomerName,
    getFutureReservationsByTableNum,
  } = require("../../../models/tableManagementModels");
  
  const pool = require("../../../db/db");
  
  // Helper to create a fake client with query and release
  const createFakeClient = () => ({
    query: jest.fn(),
    release: jest.fn(),
  });
  
  // Mock the pool module so that pool.connect and pool.query are jest functions
  jest.mock("../../../db/db", () => ({
    connect: jest.fn(),
    query: jest.fn(),
  }));
  
  describe("tableManagementModels", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getAllTablesInfo", () => {
      test("should return table data successfully", async () => {
        // Arrange: prepare a fake client
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Simulate a successful transaction:
        // 1. BEGIN
        fakeClient.query.mockResolvedValueOnce(); 
        // 2. SELECT query that returns table data.
        const fakeResult = { rows: [{ table_num: 1, num_seats: 4, table_status: true, reservations: [] }] };
        fakeClient.query.mockResolvedValueOnce(fakeResult);
        // 3. COMMIT
        fakeClient.query.mockResolvedValueOnce();
  
        // Act
        const result = await getAllTablesInfo();
  
        // Assert
        expect(result).toEqual(fakeResult.rows);
        expect(fakeClient.query).toHaveBeenCalledTimes(3);
        expect(fakeClient.release).toHaveBeenCalled();
      });
  
      test("should rollback and throw error if a query fails", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: BEGIN succeeds
        fakeClient.query.mockResolvedValueOnce();
        // Then simulate an error on the SELECT query.
        const error = new Error("DB error");
        fakeClient.query.mockRejectedValueOnce(error);
        // Then simulate rollback
        fakeClient.query.mockResolvedValueOnce();
  
        // Act & Assert
        await expect(getAllTablesInfo()).rejects.toThrow("DB error");
        expect(fakeClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(fakeClient.release).toHaveBeenCalled();
      });
    });
  
    describe("getReservationsByCustomerName", () => {
      test("should return reservations for a valid customer", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: simulate successful BEGIN and SELECT queries.
        fakeClient.query.mockResolvedValueOnce(); // BEGIN
        const fakeResult = { rowCount: 1, rows: [{ reservation_id: 1, table_num: 1, reservation_time: new Date(), party_size: 2 }] };
        fakeClient.query.mockResolvedValueOnce(fakeResult);
        fakeClient.query.mockResolvedValueOnce(); // COMMIT
  
        // Act
        const result = await getReservationsByCustomerName("Alice");
  
        // Assert
        expect(result).toEqual(fakeResult);
        expect(fakeClient.release).toHaveBeenCalled();
      });
  
      test("should throw error if no reservations found", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: BEGIN query succeeds, then SELECT returns no rows.
        fakeClient.query.mockResolvedValueOnce(); // BEGIN
        const fakeResult = { rowCount: 0, rows: [] };
        fakeClient.query.mockResolvedValueOnce(fakeResult);
        fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
        // Act & Assert
        await expect(getReservationsByCustomerName("Alice")).rejects.toThrow("Customer has no reservations.");
        expect(fakeClient.release).toHaveBeenCalled();
      });
  
      test("should rollback and throw error if query fails", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: BEGIN succeeds
        fakeClient.query.mockResolvedValueOnce(); // BEGIN
        const error = new Error("Query failure");
        fakeClient.query.mockRejectedValueOnce(error);
        fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
        // Act & Assert
        await expect(getReservationsByCustomerName("Alice")).rejects.toThrow("Query failure");
        expect(fakeClient.release).toHaveBeenCalled();
      });
    });
  
    describe("getFutureReservationsByTableNum", () => {
      test("should return future reservations for a valid table", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: simulate a successful transaction.
        fakeClient.query.mockResolvedValueOnce(); // BEGIN
        const fakeResult = { rows: [{ reservation_id: 1, customer_name: "John", reservation_time: new Date(), party_size: 2 }] };
        fakeClient.query.mockResolvedValueOnce(fakeResult);
        fakeClient.query.mockResolvedValueOnce(); // COMMIT
  
        // Act
        const result = await getFutureReservationsByTableNum(1);
  
        // Assert
        expect(result).toEqual(fakeResult);
        expect(fakeClient.release).toHaveBeenCalled();
      });
  
      test("should rollback and throw error if query fails", async () => {
        const fakeClient = createFakeClient();
        pool.connect.mockResolvedValue(fakeClient);
  
        // Arrange: BEGIN succeeds, then query fails.
        fakeClient.query.mockResolvedValueOnce(); // BEGIN
        const error = new Error("Query error");
        fakeClient.query.mockRejectedValueOnce(error);
        fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
        // Act & Assert
        await expect(getFutureReservationsByTableNum(1)).rejects.toThrow("Query error");
        expect(fakeClient.release).toHaveBeenCalled();
      });
    });
  });
  
  