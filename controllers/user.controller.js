const jwt = require("jsonwebtoken");
const User = require("../models/users");
const dotenv = require("dotenv");
const {sendOTP,userLogin} = require("./mail.controller");
const {mockPaymentGateway}=require("./payment.controllers")
dotenv.config();

const maxAge = 60 * 60 * 24; // Token expiration time

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

// User Registration
const register = async (req, res) => {
  console.log(req.body);
  const verificationToken = Math.floor(100000 + Math.random() * 900000);
  const { name, email, password, address, gender, dob, balance} = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, address, gender, dob, verificationToken,balance });
    
    if (user) {
      sendOTP(email, verificationToken);
      res.status(201).json({ status: true, message: "Registration Successful. OTP sent to email." });
    } else {
      res.status(400).json({ message: "Error creating user" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Verify OTP
const verify = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    if (user.verificationToken === otp) {
      user.verifiedAt = Date.now();
      user.verificationToken = undefined;
      await user.save();
      res.status(200).json({ status: true, message: "User Verified" });
    } else {
      res.status(400).json({ status: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// Resend OTP
const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    if (user.verifiedAt) {
      return res.status(400).json({ status: false, message: "User already verified" });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000);
    user.verificationToken = newOtp;
    await user.save();

    sendOTP(email, newOtp);
    res.status(200).json({ status: true, message: "OTP resent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error resending OTP", error });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
     
    if (!user.verifiedAt) {
      return res.status(401).json({ message: "User not verified. Please verify your email first." });
    }
    userLogin(user.email, user.name);
    
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};


const addBalance = async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount or user ID" });
  }

  try {
    // Simulate payment process
    const paymentResponse = await mockPaymentGateway(amount);

    if (!paymentResponse.success) {
      return res.status(400).json({ message: "Payment failed" });
    }

    // Step 2: Update balance upon successful payment
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
   //let bal = user.balance;
    //console.log(typeof(amount))
    user.balance += parseInt(amount);
    await user.save();

    res.json({
      message: "Balance updated successfully",
      newBalance: user.balance,
      transactionId: paymentResponse.transactionId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const viewBalance = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ balance: user.balance });
    

}
catch (error) {
  res.status(500).json({ message: "Server error", error });
}
}

module.exports = { register, login, verify, resendVerification, addBalance,viewBalance};
