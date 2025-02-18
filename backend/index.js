const express = require("express");
const userManagementRoutes = require("./routes/userManagementRoutes");
const menuManagementRoutes = require("./routes/menuManagementRoutes");

const cors = require("cors");
const pool = require("./db/db");

const app = express();

const PORT = 8080;

// middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/user", userManagementRoutes);
app.use("/api/menu", menuManagementRoutes);

// get all menu items
app.listen(PORT, () => {
  console.log(`Backend server has started at port ${PORT}`);
});
