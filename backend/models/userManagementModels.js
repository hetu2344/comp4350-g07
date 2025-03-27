const { DBError, UserNotExistError, ConflictError } = require("../exceptions/exceptions.js");
const pool = require("../db/db");

// Insert a new user
async function addUser(username, firstName, lastName, password, storeId, type) {
  let client;
  try {
    client = await pool.connect();
    
    //  Start transaction
    await client.query("BEGIN");

    // Insert user
    const result = await client.query(
      `INSERT INTO users (username, first_name, last_name, password_hash, store_id, type) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING username, first_name, last_name, type`,
      [username, firstName, lastName, password, storeId, type]
    );

    // Commit transaction
    await client.query("COMMIT");

    // Return the inserted user
    return result.rows[0];
  } catch (error) {
    // ERROR
    // Rollback transaction
    if (client) await client.query("ROLLBACK");

    if (error.code === "23505") {
      throw new ConflictError(`User with username '${username}' already exists.`);
    }
    throw new DBError("Error inserting user into database");
  } finally {
    // Release client
    if (client) client.release();
  }
}

//**Method: Get Users by Store ID**
async function getUsersByStoreId(storeId) {
  let client;
  try {
    client = await pool.connect();

    // Validate storeId
    if (!storeId || isNaN(storeId)) {
      throw new ValidationError("Invalid store ID provided.");
    }

    // SQL Query
    const result = await client.query(
      `SELECT username, first_name, last_name, type FROM users WHERE store_id = $1`,
      [storeId]
    );

    if (result.rows.length === 0) {
      return []; // Return empty array if no users found
    }

    // Return the response
    return result.rows;
  } catch (error) {
    // ERROR
    throw new DBError("Error retrieving users from database.");
  } finally {
    // Release client
    if (client) client.release();
  }
}

// Get a user by username
async function getUserByUsername(username) {
  try {
    // SQL Query
    const result = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    // If no user found
    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }
    
    // Return the response
    return result.rows[0];
  } catch (error) {
    // ERROR
    if (error instanceof UserNotExistError) throw new UserNotExistError(username);
    throw new DBError("Error retrieving user from database");
  }
}

// Remove a user by username
async function removeUser(username) {
  let client;
  try {
    client = await pool.connect();

    // Start transaction
    await client.query("BEGIN");

    // SQL Query
    const result = await client.query(
      `DELETE FROM users WHERE username = $1 RETURNING *`,
      [username]
    );

    // If no user found
    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }

// Commit transaction
    await client.query("COMMIT");
    // Return the response
    return result.rows[0];
  } catch (error) {
    // ERROR
    // Rollback transaction
    if (client) await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw new DBError("Error removing user from database");
  } finally {
    // Release client
    if (client) client.release();
  }
}

// Update a user's details
async function updateUser(username, firstName, lastName, password, storeId, type) {
  let client;
  try {
    client = await pool.connect();
    
    //  Start transaction
    await client.query("BEGIN");

    // SQL Query
    const result = await client.query(
      `UPDATE users SET first_name = COALESCE($2, first_name), 
                        last_name = COALESCE($3, last_name), 
                        password_hash = COALESCE($4, password_hash), 
                        store_id = COALESCE($5, store_id), 
                        type = COALESCE($6, type) 
       WHERE username = $1 RETURNING *`,
      [username, firstName, lastName, password, storeId, type]
    );

    // If no user found
    if (result.rows.length === 0) {
      throw new UserNotExistError(username);
    }

    // Commit transaction
    await client.query("COMMIT");

    // Return the response
    return result.rows[0];
  } catch (error) {
    // ERROR
    // Rollback transaction
    if (client) await client.query("ROLLBACK");
    console.error("Transaction Failed:", error);
    throw new DBError("Error updating user in database");
  } finally {
    // Release client
    if (client) client.release();
  }
}

// Export the functions
module.exports = {
  addUser,
  removeUser,
  updateUser,
  getUserByUsername,
  getUsersByStoreId
};

