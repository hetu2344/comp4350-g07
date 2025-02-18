//  Create a new uer
 async function createUser(req, res){
  try {
    console.log(req.body);
    const { fName } = req.body;
    const { lName } = req.body;
    const { username } = req.body;
    const { password } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (f_name, l_name, username, pass) VALUES($1, $2, $3, $4) RETURNING *",
      [fName, lName, username, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

async function getAllUsers(req, res){
  try {
    console.log("get all users called");
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.log(err);
    console.log("an error occured");
  }
}

module.exports={createUser,getAllUsers};