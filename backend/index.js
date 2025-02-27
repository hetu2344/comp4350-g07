const express = require("express");
const userManagementRoutes = require("./routes/userManagementRoutes");
const menuManagementRoutes = require("./routes/menuManagementRoutes");
const cookieParser = require('cookie-parser');
require('dotenv').config();

const cors = require("cors");
const pool = require("./db/db");

const app = express();

const PORT = 8018;

// middleware
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Routes
app.use("/api/user", userManagementRoutes);
app.use("/api/menu", menuManagementRoutes);

if(require.main===module){
// get all menu items
app.listen(PORT,"0.0.0.0" , () => {
  console.log(`Backend server has started at port ${PORT}`);
});
}

module.exports= app;