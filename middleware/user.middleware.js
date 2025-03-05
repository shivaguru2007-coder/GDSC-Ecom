const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/users");
const { findById } = require("../models/product");

const verifyAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; 
  console.log(token);

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    if (decoded.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token", error });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Ensure token is in "Bearer TOKEN" format
    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(400).json({ message: "Invalid token format. Use 'Bearer TOKEN'." });
    }

    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to request object

    next(); // Move to the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token.", error: error.message });
  }
};
const validateUserCreation = (req, res, next) => {
    const requiredFields = [
      "name",
      "email",
      "password",
      "address",
      "gender",
      "dob",
      "balance",
    ];
  
    for (let field of requiredFields) {
      const keys = field.split('.');
      let value = req.body;
      
      for (let key of keys) {
        if (!value || !value.hasOwnProperty(key)) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
        value = value[key];
      }
    }
  
    next();
  };

module.exports={validateUserCreation, verifyAdmin, verifyUser};

  