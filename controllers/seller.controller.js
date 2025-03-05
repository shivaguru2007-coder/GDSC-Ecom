const Seller = require("../models/seller");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
dotenv.config();
const Coupon = require("../models/coupon");
const generateToken = require("../utils/token")
// Create a new seller
const createSeller = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate request data
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({ name, email, password: hashedPassword });

    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getSellerDetails = async (req, res) => {
  try {
    const seller = await Seller.findById(req.user._id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.status(200).json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.status(200).json(seller);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSeller = async (req, res) => {
  try {
    const seller = await Seller.findByIdAndDelete(req.user._id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    res.status(200).json({ message: "Seller account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(seller._id);
    console.log(token)
    res.status(200).json({ message: "Login successful", token, seller });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


/**
 * Seller creates a new coupon
 */
const createCoupon = async (req, res) => {
  const { code, discount, maxDiscount, minOrderValue, expiry } = req.body;

  if (!code || !discount || !maxDiscount || !minOrderValue || !expiry) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) return res.status(400).json({ message: "Coupon code already exists" });

    const coupon = new Coupon({ code, discount, maxDiscount, minOrderValue, expiry });
    await coupon.save();

    res.json({ message: "Coupon created successfully", coupon });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


module.exports={
    createCoupon,
    createSeller,
    getSellerDetails,
    updateSeller,
    deleteSeller,
    sellerLogin
}