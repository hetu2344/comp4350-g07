const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "hetu2344",
    host: "localhost",
    port: 5432,
    database: "restro_sync"
});

module.exports = pool;

