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

if(require.main===module){
// get all menu items
app.listen(PORT,"0.0.0.0" , () => {
  console.log(`Backend server has started at port ${PORT}`);
});
}

module.exports= app;