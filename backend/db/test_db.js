const Pool = require("pg").Pool;
const types = require("pg").types;
// Returns DECIMAL as Number instead of String
types.setTypeParser(1700, (val) => parseFloat(val)); 

// Creating pool to setup test database
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.TEST_DB_HOST,
    database: process.env.TEST_DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.TEST_DB_PORT,
});


module.exports = pool;

