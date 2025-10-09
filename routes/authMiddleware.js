const jsonwebtoken = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateJWT(req, res, next) {
  // Reads the Authorization header from the request.
  // Typically, a client sends the token in this header as:
  //  Authorization: Bearer <token>

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jsonwebtoken.verify(token, JWT_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired token" });
      req.user = user;
      // If valid, attaches the decoded user info to req.user (so the next middleware or route handler can access it).
      next();
    });
  } else {
    res.status(401).json({ message: "Authorization header missing" });
  }
}

module.exports = authenticateJWT;
