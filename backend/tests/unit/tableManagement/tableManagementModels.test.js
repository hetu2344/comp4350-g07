// tableManagementModels.test.js

const {
  getAllTablesInfo,
  getReservationsByCustomerName,
  getFutureReservationsByTableNum,
} = require("../../../models/tableManagementModels");

const pool = require("../../../db/db");

// Helper to create a fake client with query and release methods
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
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      // Simulate a successful transaction:
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const fakeResult = { rows: [{ table_num: 1, num_seats: 4, table_status: true, reservations: [] }] };
      fakeClient.query.mockResolvedValueOnce(fakeResult); // SELECT query
      fakeClient.query.mockResolvedValueOnce(); // COMMIT
  
      const result = await getAllTablesInfo();
      expect(result).toEqual(fakeResult.rows);
      expect(fakeClient.query).toHaveBeenCalledTimes(3);
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should rollback and throw error if a query fails (client exists)", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const error = new Error("DB error");
      fakeClient.query.mockRejectedValueOnce(error); // Error during SELECT
      fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
      await expect(getAllTablesInfo()).rejects.toThrow("DB error");
      expect(fakeClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should throw error if pool.connect fails (client undefined)", async () => {
      pool.connect.mockRejectedValue(new Error("Connection error"));
      await expect(getAllTablesInfo()).rejects.toThrow("Connection error");
      // In this branch, client is undefined so the if(client) checks in catch/finally are skipped.
    });
  });
  
  describe("getReservationsByCustomerName", () => {
    test("should return reservations for a valid customer", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const fakeResult = { rowCount: 1, rows: [{ reservation_id: 1, table_num: 1, reservation_time: new Date(), party_size: 2 }] };
      fakeClient.query.mockResolvedValueOnce(fakeResult); // SELECT
      fakeClient.query.mockResolvedValueOnce(); // COMMIT
  
      const result = await getReservationsByCustomerName("Alice");
      expect(result).toEqual(fakeResult);
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should throw error if no reservations found (client exists)", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const fakeResult = { rowCount: 0, rows: [] };
      fakeClient.query.mockResolvedValueOnce(fakeResult); // SELECT returns no rows
      fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
      await expect(getReservationsByCustomerName("Alice")).rejects.toThrow("Customer has no reservations.");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should rollback and throw error if query fails (client exists)", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const error = new Error("Query failure");
      fakeClient.query.mockRejectedValueOnce(error); // Error on SELECT
      fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
      await expect(getReservationsByCustomerName("Alice")).rejects.toThrow("Query failure");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should throw error if pool.connect fails (client undefined)", async () => {
      pool.connect.mockRejectedValue(new Error("Connection error"));
      await expect(getReservationsByCustomerName("Alice")).rejects.toThrow("Connection error");
    });
  });
  
  describe("getFutureReservationsByTableNum", () => {
    test("should return future reservations for a valid table", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const fakeResult = { rows: [{ reservation_id: 1, customer_name: "John", reservation_time: new Date(), party_size: 2 }] };
      fakeClient.query.mockResolvedValueOnce(fakeResult); // SELECT
      fakeClient.query.mockResolvedValueOnce(); // COMMIT
  
      const result = await getFutureReservationsByTableNum(1);
      expect(result).toEqual(fakeResult);
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should rollback and throw error if query fails (client exists)", async () => {
      const fakeClient = createFakeClient();
      pool.connect.mockResolvedValue(fakeClient);
  
      fakeClient.query.mockResolvedValueOnce(); // BEGIN
      const error = new Error("Query error");
      fakeClient.query.mockRejectedValueOnce(error); // Error on SELECT
      fakeClient.query.mockResolvedValueOnce(); // ROLLBACK
  
      await expect(getFutureReservationsByTableNum(1)).rejects.toThrow("Query error");
      expect(fakeClient.release).toHaveBeenCalled();
    });
  
    test("should throw error if pool.connect fails (client undefined)", async () => {
      pool.connect.mockRejectedValue(new Error("Connection error"));
      await expect(getFutureReservationsByTableNum(1)).rejects.toThrow("Connection error");
    });
  });
});
