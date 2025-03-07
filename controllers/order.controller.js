const Coupon = require("../models/coupon");
const Order = require("../models/order");
const User = require("../models/users");
const {orderConfirm,orderCancelSeller,orderConfirmSeller} = require("./mail.controller");
const mockPayment = require("./payment.controllers");

const createOrder = async (req, res) => {
  const { userId } = req.body
  
  if (!userId) return res.status(400).json({ message: "User ID is required" });

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.cart.length === 0) return res.status(400).json({ message: "Cart is empty" });

    let totalAmount = 0;
    user.cart.forEach((item) => {
      totalAmount += item.productId.price * item.quantity;
    });
    // This will stop from creating multiple orders for the same cart
    const findOrder = await Order.findOne({ userId: user._id, status: "Pending" });
    if (findOrder) return res.status(400).json({ message: "Complete pending order first" });
    const order = new Order({
      userId: user._id,
      items: user.cart.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount,
      status: "Pending",
    });

    await order.save();
    res.json({ message: "Order created successfully!", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const applyCoupon = async (req, res) => {
  const { orderId, couponCode } = req.body;

  if (!orderId) return res.status(400).json({ message: "Order ID is required" });

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!couponCode) return res.json({ discountAmount: 0, totalAmount: order.totalAmount });

    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) throw new Error("Invalid coupon");
    if (new Date() > new Date(coupon.expiry)) throw new Error("Coupon expired");
    if (order.totalAmount < coupon.minOrderValue) throw new Error(`Minimum order value for this coupon is ${coupon.minOrderValue}`);

    const discountAmount = Math.min((order.totalAmount * coupon.discount) / 100, coupon.maxDiscount);
    order.totalAmount -= discountAmount;

    await order.save();
    res.json({ message: "Coupon applied successfully!", discountAmount, totalAmount: order.totalAmount });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const finishOrder = async (req, res) => {
  const { userId, orderId } = req.body
  
  if (!userId || !orderId) return res.status(400).json({ message: "User ID and Order ID are required" });

  try {
    const user = await User.findById(userId);
    const order = await Order.findById(orderId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (user.balance < order.totalAmount) throw new Error("Insufficient balance");

    const paymentSuccess = await mockPayment.mockPaymentGateway(order.totalAmount);
    if (!paymentSuccess.success) throw new Error("Payment failed, try again");
    //mail for order confirmation
    console.log(user.email,user.name,orderId);
    orderConfirm(user.email,user.name,orderId);
    //orderConfirmSeller(seller.email,user.name,orderId);
    user.balance -= order.totalAmount;
    user.cart = [];
    order.status = "Paid";

    await order.save();
    await user.save();

    res.json({ message: "Order finished successfully!", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const viewOrder = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const order = await Order.find({ userId: user._id});
    console.log({userId: user._id})
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order: order });
    }catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
}
const cancelOrder = async (req, res) => {
    const { userId, orderId } = req.body;
    if (!userId || !orderId) return res.status(400).json({ message: "User ID and Order ID are required" });
    
    try {
        const user = await User.findById(userId);
        const order = await Order.findById(orderId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.status === "Cancelled") {
            return res.status(400).json({ message: "Order already cancelled" });
        }else{
            order.status = "Cancelled";
            await order.save();
            res.json({ message: "Order cancelled successfully!", order });
        }
    }catch(error){
        res.status(400).json({ message: "Server error",error });
    }
}
module.exports = { createOrder, applyCoupon, finishOrder,viewOrder,cancelOrder};