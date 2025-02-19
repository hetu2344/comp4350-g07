const pool = require("../db/db");

async function getUsers() {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
}

async function createNewUser(fName, lName, username, password) {
  const result = await pool.query(
    "INSERT INTO users (f_name, l_name, username, pass) VALUES($1, $2, $3, $4) RETURNING *",
    [fName, lName, username, password]
  );

  return result.rows[0];
}
module.exports = { getUsers, createNewUser };
