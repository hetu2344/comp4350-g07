const express = require("express");
const router = express.Router();
const userController = require("../controllers/userManagementControllers");

//**Authentication Routes**
router.post("/login", userController.login); // User login
router.post("/logout", userController.logout); // User logout
router.get("/me", userController.getCurrentUser); // Get current logged-in user info

//**User Management (Only Store Owners & Managers)**
router.post("/signup", userController.signup); // Create new user
router.put("/update/:username", userController.updateUser); // Update user details
// Delete a user with checks
router.delete("/:username", userController.deleteUserWithChecks);

//**User Query Routes**
router.get("/:username", userController.getUserByUsername); // Get user by username
router.get("/store/:storeId", userController.getUsersByStoreId); // Get all users in a store

module.exports = router;

