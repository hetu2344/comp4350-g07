const Pool = require("pg").Pool;
const types = require("pg").types;
// Returns DECIMAL as Number instead of String
types.setTypeParser(1700, (val) => parseFloat(val)); 

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


module.exports = pool;

