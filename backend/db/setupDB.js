const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function setupDatabase() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL");

        // Read SQL file
        const sql = fs.readFileSync(path.join(__dirname, "database.sql"), "utf8");

        // Execute SQL commands
        await client.query(sql);
        console.log("Database setup complete!");

    } catch (error) {
        console.error("Error setting up database:", error);
    } finally {
        await client.end();
    }
}

setupDatabase();

