const express = require("express");
const router = express.Router();
const {register,verify,login,addBalance, resendVerification} = require("../controllers/user.controller");
const cartController = require("../controllers/cart.controller");
const { validateUserCreation,verifyUser} = require("../middleware/user.middleware");
const orderController = require("../controllers/order.controller");


//Auth
router.post("/auth/register",validateUserCreation, register);
router.post("/auth/verify", verify);
router.post("/auth/login", login);
router.post("/auth/resendotp",resendVerification)
//Balance routes
router.post("/add",verifyUser,addBalance)

//cart Routes
router.post("/cart/add",verifyUser, cartController.addCart);
router.get("/cart/:userId",verifyUser, cartController.getCart);
router.put("/cart/update",verifyUser, cartController.updateCart);
router.delete("/cart/remove",verifyUser, cartController.removeCart);
router.delete("/cart/clear/:userId", verifyUser, cartController.clearCart);
router.delete("/cart/reduce",verifyUser,cartController.reduceCart)
//Order Routes
router.post("/order",verifyUser,orderController.placeOrder)

module.exports = router;
