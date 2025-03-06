const Coupon = require("../models/coupon");
const Order = require("../models/order");

const User = require("../models/users");
const mockPayment = require("./payment.controllers");

const placeOrder = async (req, res) => {
    const { userId, couponCode } = req.body;

  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total price
    let totalAmount = 0;
    user.cart.forEach((item) => {
      totalAmount += item.productId.price * item.quantity;
    });

    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });
      if (new Date() > new Date(coupon.expiry)) {
        return res.status(400).json({ message: "Coupon expired" });
      }
      if (totalAmount < coupon.minOrderValue) {
        return res.status(400).json({ message: `Minimum order value for this coupon is ${coupon.minOrderValue}` });
      }

      discountAmount = Math.min((totalAmount * coupon.discount) / 100, coupon.maxDiscount);
      totalAmount -= discountAmount;
    }

    if (user.balance < totalAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const paymentSuccess = await mockPayment.mockPaymentGateway(totalAmount);
    if (!paymentSuccess) return res.status(400).json({ message: "Payment failed, try again" });

    user.balance -= totalAmount;

    const order = new Order({
      userId,
      items: user.cart.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "Paid",
    });

    await order.save();
    user.cart = [];
    await user.save();

    res.json({ message: "Order placed successfully!", order, discountApplied: discountAmount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
  };

module.exports = {placeOrder}
