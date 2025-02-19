const express = require("express");
const {
  createUser,getAllUsers
} = require("../controllers/userManagementControllers");

const router = express.Router();


// Routes

// create a user
router.post("/", createUser());

// get all users
router.get("/", getAllUsers());

// get a user

// update a user

// delete a user

module.exports = router;
