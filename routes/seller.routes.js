const express = require("express");
const router = express.Router();
//const {upload} = require("../middleware/upload.middleware")
const sellerController = require("../controllers/seller.controller");
const productController = require("../controllers/product.controller");
const categoryController = require("../controllers/category.controller");
const auth = require("../middleware/seller.middleware");

// Seller authentication routes
router.post("/register",sellerController.createSeller)
router.post("/login", sellerController.sellerLogin);

// Protected seller routes
router.get("/details", auth.verifySeller, sellerController.getSellerDetails);
router.put("/update", auth.verifySeller, sellerController.updateSeller);
router.delete("/delete", auth.verifySeller, sellerController.deleteSeller);

// Product routes
router.post("/product/add", auth.verifySeller, productController.addProduct);
router.put("/product/update/:id", auth.verifySeller, productController.updateProduct);
router.delete("/product/delete/:id", auth.verifySeller, productController.deleteProduct);
router.get("/product/search", auth.verifySeller, productController.searchProduct);
//router.get("/product/all", verifySeller, productController.getAllProducts);

// Category routes
router.post("/category/add", categoryController.addCategory);
router.put("/category/update", auth.verifySeller, categoryController.updateCategory);
router.delete("/category/delete", auth.verifySeller, categoryController.deleteCategory);
router.get("/category/all", auth.verifySeller, categoryController.getCategories);

module.exports = router;
