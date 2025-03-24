const request = require("supertest");
const app = require("../../index"); 
const pool = require("../../db/test_db"); 
const { resetTestDatabase } = require("../testHelpers");



jest.setTimeout(240000);

const winnipegNow = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Winnipeg" }));

function formatLocalDateTime(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      "T" +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  }
  
  
describe("Table Management Integration Tests", () => {
    beforeEach(async () => {
    await resetTestDatabase();});
      
      afterAll(async () => {
        await pool.end();
      });
    
    describe("GET / (get all tables)", () => {
      test("should return all tables with reservation info", async () => {
        const res = await request(app).get("/api/tables"); 
        expect(res.statusCode).toBe(200);
        // Expect an array of tables
        const data = res.body.rows ? res.body.rows : res.body;
        expect(Array.isArray(data)).toBe(true);
      });
    });
    
    describe("POST /reservation (add reservation)", () => {
      test("should add a new reservation successfully", async () => {
        // Create a valid reservation time far enough in the future.
        const future = new Date(winnipegNow.getTime() + 80 * 60 * 60 * 1000);
        const isoFuture = formatLocalDateTime(future);
        const reservationData = {
          name: "Test Customer",
          tableNum: 1,
          partySize: 2,
          time: isoFuture,
        };
    
        const res = await request(app)
          .post("/api/tables/reservation")
          .send(reservationData)
          .set("Accept", "application/json");
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Reservation successfully added!");
        expect(res.body.reservation).toHaveProperty("reservation_id");
      });
    
      test("should return 400 if reservation time is too soon", async () => {
        // Set reservation time 5 minutes in the future (less than the required 45 minutes)
        const soon = new Date(winnipegNow.getTime() + 2 * 60 * 1000);
        const localSoon = formatLocalDateTime(soon);  // Format as local time string
      
        const reservationData = {
          name: "Test Customer",
          tableNum: 1,
          partySize: 2,
          time: localSoon,
        };
      
        const res = await request(app)
          .post("/api/tables/reservation")
          .send(reservationData)
          .set("Accept", "application/json");
      
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty(
          "error",
          "Reservations must be at least 45 minutes in advance."
        );
      });
});
    
    describe("DELETE /reservation/:reservationId (delete reservation)", () => {
      let reservationId;
      beforeEach(async () => {
        const nowInWinnipeg = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Winnipeg" }));
        const future = new Date(nowInWinnipeg.getTime() + 2 * 60 * 60 * 1000);
        const isoFuture = formatLocalDateTime(future);
        const reservationData = {
          name: "Delete Test",
          tableNum: 1,
          partySize: 2,
          time: isoFuture,
        };
    
        const res = await request(app)
          .post("/api/tables/reservation")
          .send(reservationData)
          .set("Accept", "application/json");
    
        reservationId = res.body.reservation.reservation_id;
      });
    
      test("should delete an existing reservation", async () => {
        const res = await request(app).delete(`/api/tables/reservation/${reservationId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty(
          "message",
          "Reservation deleted. Table is now available."
        );
      });
    
      test("should return 400 for invalid reservation id", async () => {
        const res = await request(app).delete(`/api/tables/reservation/invalid`);
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid input provided.");
      });
    });
    
    // Integration tests for getReservationsByTable and getReservationsByCustomer
    
    describe("GET /reservation/table (get reservations by table)", () => {
      test("should return 400 if tableNum is missing", async () => {
        const res = await request(app).get("/api/tables/reservation/table");
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid input provided.");
      });
    
      test("should return reservations for a valid table", async () => {
        const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const isoFuture = future.toISOString().slice(0, 19);
        const reservationData = {
          name: "Table Test Customer",
          tableNum: 1,
          partySize: 2,
          time: isoFuture,
        };
        await request(app)
          .post("/api/tables/reservation")
          .send(reservationData)
          .set("Accept", "application/json");
    
        const res = await request(app).get("/api/tables/reservation/table?tableNum=1");
        expect(res.statusCode).toBe(200);
        const data = res.body.rows ? res.body.rows : res.body;
        expect(Array.isArray(data)).toBe(true);
      });
    });
    
    describe("GET /reservation/customer (get reservations by customer)", () => {
      test("should return 400 if customerName is missing", async () => {
        const res = await request(app).get("/api/tables/reservation/customer");
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid input provided.");
      });
    
      test("should return reservations for a valid customer", async () => {
        const future = new Date(winnipegNow.getTime() + 80 * 60 * 60 * 1000);
        const isoFuture = formatLocalDateTime(future);
        const reservationData = {
          name: "CustomerTest",
          tableNum: 1,
          partySize: 2,
          time: isoFuture,
        };
        const postRes = await request(app)
          .post("/api/tables/reservation")
          .send(reservationData)
          .set("Accept", "application/json");

        expect(postRes.statusCode).toBe(200);
        expect(postRes.body).toHaveProperty("reservation");
        const insertedName = postRes.body.reservation.customer_name;
        expect(insertedName).toBe("CustomerTest");
            const res = await request(app).get(
              `/api/tables/reservation/customer?customerName=CustomerTest`
            );

        expect(res.statusCode).toBe(200);
        console.log(res.body.rows);
        const data = res.body.rows ? res.body.rows : res.body;
        console.log(data);
        expect(Array.isArray(data)).toBe(true);
      });
    });
  });