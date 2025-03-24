const fs = require("fs");
const path = require("path");
const pool = require("../db/test_db");

async function resetTestDatabase() {
    const filePath=path.join(__dirname,'../db/testDBseed.sql');
    const seedSQL=fs.readFileSync(filePath,'utf-8');

    await pool.query(seedSQL);

}

module.exports = { resetTestDatabase };
