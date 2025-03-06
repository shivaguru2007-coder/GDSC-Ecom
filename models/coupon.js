const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // Percentage discount (e.g., 10 for 10%)
  maxDiscount: { type: Number, required: false }, // Max discount amount
  minOrderValue: { type: Number, required: true }, // Minimum cart value required
  expiry: { type: Date, required: true }, // Expiry date
  createdAt: { type: Date, default: Date.now },
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;

