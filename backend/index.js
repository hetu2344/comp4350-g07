require('dotenv').config();
const express = require("express");
const userManagementRoutes = require("./routes/userManagementRoutes");
const menuManagementRoutes = require("./routes/menuManagementRoutes");
const tableManagementRoutes = require("./routes/tableManagementRoutes");
const orderManagementRoutes = require("./routes/orderManagementRoutes");
const salesManagementRoutes = require("./routes/salesAnalysisRoutes");
const cookieParser = require('cookie-parser');

const cors = require("cors");
// const pool = require("../backend/db/db");

const app = express();

const PORT = process.env.SERVER_PORT;
// middleware
//app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Routes
app.use("/api/user", userManagementRoutes);
app.use("/api/menu", menuManagementRoutes);
app.use("/api/tables", tableManagementRoutes);
app.use("/api/orders", orderManagementRoutes);
app.use("/api/sales", salesManagementRoutes);

if(require.main===module){
// get all menu items
app.listen(PORT,"0.0.0.0" , () => {
});
}

module.exports = app;