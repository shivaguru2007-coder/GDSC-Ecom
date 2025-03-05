const express = require("express");
const router = express.Router();
const {register,verify,login,addBalance} = require("../controllers/user.controller");
const cartController = require("../controllers/cart.controller");
const { validateUserCreation} = require("../middleware/user.middleware");
const orderController = require("../controllers/order.controller");


//Auth
router.post("/auth/register",validateUserCreation, register);
router.post("/auth/verify", verify);
router.post("/auth/login", login);

//Balance routes
router.post("/add",addBalance)

//cart Routes
router.post("/cart/add", cartController.addCart);
router.get("/cart/:userId", cartController.getCart);
router.put("/cart/update", cartController.updateCart);
router.delete("/cart/remove", cartController.removeCart);
router.delete("/cart/clear/:userId", cartController.clearCart);

//Order Routes
router.post("/order",orderController.placeOrder)

module.exports = router;
