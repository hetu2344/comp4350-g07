const userModel = require("../models/userManagementModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRoles } = require("./authController");
const { UserNotExistError, ValidationError, ConflictError } = require("../exceptions/exceptions");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use a strong secret in production

//**User Login - Stores JWT in HTTP-Only Cookie**
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) throw new ValidationError("Username and password are required");

    const user = await userModel.getUserByUsername(username);
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, storeId: user.store_id, type: user.type },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Store JWT in HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Set to true in production
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    if (error instanceof UserNotExistError) return res.status(404).json({ error: error.message });
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

//**User Logout - Clears Cookie**
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// 🟢 **Get Logged-In User (Requires Authentication)**
exports.getCurrentUser = [authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
}];

// 🟢 **User Signup (Requires Authentication & Only Store Owners & Managers)**
exports.signup = [authenticateToken, authorizeRoles, async (req, res) => {
  try {
    const { username, firstName, lastName, password, storeId, type } = req.body;

    if (!username || !firstName || !lastName || !password || !storeId || !type) {
      throw new ValidationError("Missing required fields: username, firstName, lastName, password, storeId, type");
    }

    const validTypes = ["S", "E", "M"];
    if (!validTypes.includes(type)) {
      throw new ValidationError("Invalid user type. Allowed types: S (Store Owner), E (Employee), M (Manager)");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.addUser(username, firstName, lastName, hashedPassword, storeId, type);
    
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
    if (error instanceof ConflictError) return res.status(409).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
}];

//**Update User Details (Requires Authentication & Only Store Owners & Managers)**
exports.updateUser = [authenticateToken, authorizeRoles, async (req, res) => {
  try {
    const { username } = req.params;
    const { firstName, lastName, password, storeId, type } = req.body;

    if (!username) throw new ValidationError("Username is required");
    if (!firstName && !lastName && !password && !storeId && !type) {
      throw new ValidationError("At least one field must be provided for update");
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const updatedUser = await userModel.updateUser(username, firstName, lastName, hashedPassword, storeId, type);
    
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    if (error instanceof UserNotExistError) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
}];

//**Delete User (Requires Authentication & Only Store Owners & Managers)**
exports.deleteUser = [authenticateToken, authorizeRoles, async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) throw new ValidationError("Username is required");

    await userModel.removeUser(username);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error instanceof UserNotExistError) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
}];

//**Get User by Username (Requires Authentication)**
exports.getUserByUsername = [authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) throw new ValidationError("Username is required");

    const user = await userModel.getUserByUsername(username);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof UserNotExistError) return res.status(404).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
}];

//**Get All Users by Store ID (Requires Authentication & Only Store Owners & Managers)**
exports.getUsersByStoreId = [authenticateToken, authorizeRoles, async (req, res) => {
  try {
    const { storeId } = req.params;
    if (!storeId) throw new ValidationError("Store ID is required");

    const users = await userModel.getUsersByStoreId(storeId);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
}];

