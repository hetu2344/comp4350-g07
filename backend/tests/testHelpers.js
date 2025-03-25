const fs = require("fs");
const path = require("path");
const pool = require("../db/test_db");

// MEthod that recreatestest Database after test
async function resetTestDatabase() {
    const filePath=path.join(__dirname,'../db/testDBseed.sql');
    const seedSQL=fs.readFileSync(filePath,'utf-8');

    await pool.query(seedSQL);

}

// Export method
module.exports = { resetTestDatabase };
