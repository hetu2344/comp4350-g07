const Pool = require("pg").Pool;

const pool = new Pool({
    user: "restro_usr",
    password: "cs4350",
    host: "localhost",
    port: 5432,
    database: "restro_sync"
});


module.exports = pool;

