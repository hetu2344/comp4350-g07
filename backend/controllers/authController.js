const jwt = require("jsonwebtoken")

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

//**Middleware: Authenticate User via JWT in Cookie**
function authenticateToken(req, res, next) {
  const token = req.cookies?.token; // Read token from cookies

  if (!token) return res.status(401).json({ error: "Access Denied. No token provided." }); //No logged in 

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token.", errorcode:1 }); //Logged in credentials are incorrect

    req.user = user; // Store user info in request
    next();
  });
}

//**Middleware: Restrict Access to Store Owners & Managers**
function authorizeRoles(req, res, next) {
  if (!req.user || (req.user.type !== "S" && req.user.type !== "M")) {
    return res.status(403).json({ error: "Access Denied. Only Store Owners and Managers can perform this action.", errorcode:2 });
  }
  next();
}

module.exports = { authenticateToken, authorizeRoles };
