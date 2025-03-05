const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: { type: String, required: true, unique: true,    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      "Invalid email format",
    ],},
    password: { type: String, required: true },
    address: {type: String,required:true},
    gender: {type: String,required:true},
    dob: {type: Date,required:true},
    verifiedAt: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    balance:{
      type: Number,
      required:true,
    },
    cart: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true, default: 1 },
      },
    ],
});
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });
  
  userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
  const User = mongoose.model("User", userSchema);
  
  module.exports = User;