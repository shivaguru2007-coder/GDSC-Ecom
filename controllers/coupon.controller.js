const Coupon = require("../models/coupon");

const createCoupon = async (req, res) => {
    const { code, discount, maxDiscount, minOrderValue, expiry } = req.body;
  
    try {
      const existingCoupon = await Coupon.findOne({ code });
      if (existingCoupon) return res.status(400).json({ message: "Coupon code already exists" });
  
      const coupon = new Coupon({ code, discount, maxDiscount, minOrderValue, expiry });
      await coupon.save();
  
      res.json({ message: "Coupon created successfully", coupon });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }

const updateCoupon = async (req,res)=>{
    //const { code, discount, maxDiscount, minOrderValue, expiry } = req.body;
    try{
    if (!code) return res.status(400).json({message:"Code is required"});
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json(coupon);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
}
const deleteCoupon = async (req,res)=>{
    const {code}=req.body;
    try{
        const coupon = await Coupon.findOneAndDelete(code);
        if (!coupon) return res.status(404).json({ message: "Coupon not found" });
        res.status(200).json({ message: "Coupon deleted successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
}
module.exports = {
    createCoupon,
    updateCoupon,
    deleteCoupon
}