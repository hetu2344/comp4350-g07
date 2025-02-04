const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

const PORT = 8080;

// middleware
app.use(cors());
app.use(express.json());

// Routes

// create a user
app.post("/api/user", async(req, res) => {
    try {
        
        console.log(req.body);
        const {fName} = req.body;
        const {lName} = req.body;
        const {username} = req.body;
        const {password} = req.body;

        const newUser = await pool.query("INSERT INTO users (f_name, l_name, username, pass) VALUES($1, $2, $3, $4) RETURNING *", [fName, lName, username, password]);

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});


// get all users
app.get("/api/users", async(req, res) => {
    try {
        console.log("get all users called");
       const allUsers = await pool.query("SELECT * FROM users"); 
        res.json(allUsers.rows);
    } catch (err) {
        console.log(err);
       console.log("an error occured"); 
    }
});

// get a user

// update a user

// delete a user

app.listen(PORT, () => {
    console.log(`Backend server has started at port ${PORT}`);
});

