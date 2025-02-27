const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const client = new Client({
    user: "restro_usr",
    host: "db",
    database: "restro_sync", // Use default postgres database to create a new one
    password: "cs4350",
    port: 5432, // Default PostgreSQL port
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

