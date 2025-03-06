const express = require("express");
const router = express.Router();
const {register,verify,login,addBalance, resendVerification} = require("../controllers/user.controller");
const cartController = require("../controllers/cart.controller");
const { validateUserCreation,verifyUser} = require("../middleware/user.middleware");
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
router.post("/add",verifyUser,addBalance);

//cart Routes
router.post("/cart/add",verifyUser, cartController.addCart);
router.get("/cart/:userId",verifyUser, cartController.getCart);
router.put("/cart/update",verifyUser, cartController.updateCart);
router.delete("/cart/remove",verifyUser, cartController.removeCart);
router.delete("/cart/clear/:userId", verifyUser, cartController.clearCart);
router.delete("/cart/reduce",verifyUser,cartController.reduceCart);
router.get("/cart/val",verifyUser,cartController.cartVal);

//Order Routes
router.post("/order/place",verifyUser,orderController.finishOrder);
router.post("/order/applycoupon",verifyUser,orderController.applyCoupon);
router.post("/order/create",verifyUser,orderController.createOrder);

//product routes
router.get("/product/search", verifyUser, productController.searchProduct);
router.get("/product/all", verifyUser, productController.getProducts);

//category routes
router.get("/category/all", verifyUser, categoryController.getCategories);

//multer setup trial
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    res.status(200).json({ message: "File uploaded successfully!", file: req.file });
  } catch (error) {
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
});
router.post("/upload/product", upload.single("file"), productController.addImage);

module.exports = router;
