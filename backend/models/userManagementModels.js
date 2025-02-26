const { DBError, UserNotExistError, ConflictError } = require("../exceptions/exceptions.js");
const pool = require("../db/db");

// Insert a new user
async function addUser(username, firstName, lastName, password, storeId, type) {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO users (username, first_name, last_name, password, store_id, type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING username, first_name, last_name, type`,
      [username, firstName, lastName, password, storeId, type]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    if (client) await client.query("ROLLBACK");

    if (error.code === "23505") {
      throw new ConflictError(`User with username '${username}' already exists.`);
    }

    console.error("Transaction Failed:", error);
    throw new DBError("Error inserting user into database");
  } finally {
    if (client) client.release();
  }
}

// Get a user by username
async function getUserByUsername(username) {
  try {
    const result = await pool.query(
      `SELECT username, first_name, last_name, store_id, type FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new DBError("Error retrieving user from database");
  }
}

// Remove a user by username
async function removeUser(username) {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `DELETE FROM users WHERE username = $1 RETURNING *`,
      [username]
    );

    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw new DBError("Error removing user from database");
  } finally {
    if (client) client.release();
  }
}

// Update a user's details
async function updateUser(username, firstName, lastName, password, storeId, type) {
  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE users SET first_name = COALESCE($2, first_name), 
                        last_name = COALESCE($3, last_name), 
                        password = COALESCE($4, password), 
                        store_id = COALESCE($5, store_id), 
                        type = COALESCE($6, type) 
       WHERE username = $1 RETURNING *`,
      [username, firstName, lastName, password, storeId, type]
    );

    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw new DBError("Error updating user in database");
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  addUser,
  removeUser,
  updateUser,
  getAllUsers,
  getUserByUsername,
};

