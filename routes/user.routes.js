const express = require("express");
const router = express.Router();
const {register,verify,login,addBalance, resendVerification, viewBalance} = require("../controllers/user.controller");
const cartController = require("../controllers/cart.controller");
const { validateUserCreation,authUser} = require("../middleware/user.middleware");
const orderController = require("../controllers/order.controller");
const productController = require("../controllers/product.controller"); 
const categoryController = require("../controllers/category.controller");
const { upload } = require("../middleware/upload.middleware");
//Auth
router.post("/auth/register",validateUserCreation, register);
router.post("/auth/verify", verify);
router.post("/auth/login", login);
router.post("/auth/resendotp",resendVerification)
//Balance routes
router.post("/wallet/add",authUser,addBalance);
router.get("/wallet/balance",authUser,viewBalance);
//cart Routes
router.post("/cart/add",authUser, cartController.addCart);
router.get("/cart/:userId",authUser,cartController.getCart);
router.put("/cart/update",authUser, cartController.updateCart);
router.delete("/cart/remove",authUser, cartController.removeCart);
router.delete("/cart/clear",authUser, cartController.clearCart);
router.delete("/cart/reduce",authUser,cartController.reduceCart);
router.get("/cart/val",authUser,cartController.cartVal);

//Order Routes
router.post("/order/place",authUser,orderController.finishOrder);
router.post("/order/applycoupon",authUser,orderController.applyCoupon);
router.post("/order/create",authUser,orderController.createOrder);
router.get("/order/view",authUser,orderController.viewOrder);
router.delete("/order/cancel",authUser,orderController.cancelOrder);
//product routes
router.get("/products/search",productController.searchProducts);
router.get("/products/filter",productController.filter);
router.get("/products/slug/:slug",productController.getProductBySlug)
router.get("/products/id/:id",productController.getProductById);
router.get("/products/category/:slug",productController.getProductByCategory)
router.get("/products/brand/:slug",productController.getProductByBrand);
router.get("/products", productController.getProducts)
//category routes
router.get("/category/all", categoryController.getCategories);

//multer setup trial
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.status(200).json({ message: "File uploaded successfully!", file: req.file });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
});
//webhook
router.post("/set-webhook", async (req, res) => {
    const { userId, webhookUrl } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.webhookUrl = webhookUrl;
      await user.save();
  
      res.json({ message: "Webhook URL set successfully", webhookUrl });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });

module.exports = router;
