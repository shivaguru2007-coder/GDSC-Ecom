const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");
require("dotenv").config();


const verifySeller = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    const seller = await Seller.findById(decoded._id);
    
    if (!seller) {
      return res.status(401).json({ message: "Invalid token. Seller not found." });
    }

    req.user = seller;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = {verifySeller};
