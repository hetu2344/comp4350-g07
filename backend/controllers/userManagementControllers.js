//  Create a new uer
const pool=require("../db/db");
const { getUsers, createNewUser } = require("../models/userManagementModels");
async function createUser(req, res){
  try {
    console.log(req.body);
    const { fName } = req.body;
    const { lName } = req.body;
    const { username } = req.body;
    const { password } = req.body;

    const newUser = createNewUser(fName,lName,username,password)

    res.json(newUser);
  } catch (err) {
    console.error(err.message);
  }
}


async function getAllUsers(req, res){
  try {
    console.log("get all users called");
    const allUsers = await getUsers();
    console.log(allUsers);
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    console.log("an error occured");
  }
}

module.exports={createUser,getAllUsers};