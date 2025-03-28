const userModel = require("../models/userManagementModels");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRoles } = require("./authController");
const {
  UserNotExistError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
} = require("../exceptions/exceptions");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Use a strong secret in production

//**User Login - Stores JWT in HTTP-Only Cookie**
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new ValidationError("Username and password are required");

    const user = await userModel.getUserByUsername(username);
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, storeId: user.store_id, type: user.type },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Store JWT in HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: "Lax",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    if (error instanceof UserNotExistError)
      return res.status(404).json({ error: error.message });
    if (error instanceof ValidationError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal Server Error" });
    console.log(error);
  }
};

//**User Logout - Clears Cookie**
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

//**Get Logged-In User (Requires Authentication)**
exports.getCurrentUser = [
  authenticateToken,
  (req, res) => {
    res.status(200).json({ user: req.user });
  },
];

//**User Signup (Requires Authentication & Only Store Owners & Managers)**
exports.signup = [
  authenticateToken,
  authorizeRoles,
  async (req, res) => {
    try {
      // Getting required params
      const { username, firstName, lastName, password, type } = req.body;

      // Checking params
      if (!username || !firstName || !lastName || !password || !type) {
        throw new ValidationError(
          "Missing required fields: username, firstName, lastName, password, type"
        );
      }

      // Checking if valid user type is given or not
      const validTypes = ["S", "E", "M"];
      if (!validTypes.includes(type)) {
        throw new ValidationError(
          "Invalid user type. Allowed types: S (Store Owner), E (Employee), M (Manager)"
        );
      }

      // Hashing password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Store id
      const storeId = req.user.storeId;
      const user = await userModel.addUser(
        username,
        firstName,
        lastName,
        hashedPassword,
        storeId,
        type
      );

      // Sending response
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      // Error
      if (error instanceof ValidationError)
        return res.status(400).json({ error: error.message });
      if (error instanceof ConflictError)
        return res.status(409).json({ error: error.message });
      res.status(500).json({ error: "Internal Server Error" });
      console.log(error);
    }
  },
];

//**Update User Details (Requires Authentication & Only Store Owners & Managers)**
exports.updateUser = [
  authenticateToken,
  authorizeRoles,
  async (req, res) => {
    try {
      const { username } = req.params;
      const { firstName, lastName, password, storeId, type } = req.body;

      // if (!username) throw new ValidationError("Username is required");
      if (!firstName && !lastName && !password && !storeId && !type) {
        throw new ValidationError(
          "At least one field must be provided for update"
        );
      }

      // Hashing password
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const updatedUser = await userModel.updateUser(
        username,
        firstName,
        lastName,
        hashedPassword,
        storeId,
        type
      );
      console.log("after updateuser");

      //Sending response
      res
        .status(200)
        .json({ message: "User updated successfully", updatedUser });
    } catch (error) {
      // if (error instanceof UserNotExistError) return res.status(404).json({ error: error.message });
      if (error instanceof ValidationError)
        return res.status(400).json({ error: error.message });
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

//**Get User by Username (Requires Authentication)**
exports.getUserByUsername = [
  authenticateToken,
  async (req, res) => {
    try {
      // Getting params
      const { username } = req.params;
      // if (!username) throw new ValidationError("Username is required");

      // Getting user by username
      const user = await userModel.getUserByUsername(username);

      // Sending response
      res.status(200).json(user);
    } catch (error) {
      // Error
      if (error instanceof UserNotExistError)
        return res.status(404).json({ error: error.message });
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

//**Get All Users by Store ID (Requires Authentication & Only Store Owners & Managers)**
exports.getUsersByStoreId = [
  authenticateToken,
  authorizeRoles,
  async (req, res) => {
    try {
      const { storeId } = req.params;
      // if (!storeId) throw new ValidationError("Store ID is required");

      // Getting users by storeID
      const users = await userModel.getUsersByStoreId(storeId);

      // Sending response
      res.status(200).json(users);
    } catch (error) {
      // Error
      res.status(500).json({ error: "Internal Server Error" });
      console.log(error);
    }
  },
];

// Delete user with necessary checks
exports.deleteUserWithChecks = [
  authenticateToken,
  authorizeRoles,
  async (req, res) => {
    try {
      const usernameToDelete = req.params.username;
      const currentUsername = req.user.username;
      const currentUserType = req.user.type;

      // Checking if user is deleting themselves
      if (usernameToDelete === currentUsername) {
        throw new UnauthorizedError("You cannot delete yourself.");
      }

      // Getting the user to get deleted
      const userToDelete = await userModel.getUserByUsername(usernameToDelete);

      // If no user is returned
      if (!userToDelete) {
        throw new ValidationError("User does not exist.");
      }

      if (userToDelete.type === "S") {
        throw new UnauthorizedError("Cannot delete the store owner.");
      }

      // if (req.user.type === "M" && userModel.type === "M") {
      //   throw new UnauthorizedError("Managers cannot delete other managers.");
      // }

      // Removing a user
      await userModel.removeUser(usernameToDelete);
      res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
      // Error
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }
      if (error instanceof UnauthorizedError) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
