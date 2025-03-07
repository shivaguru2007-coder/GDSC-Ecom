const Product = require("../models/product");
const Category = require("../models/category");
const Seller = require("../models/seller");
const keyword = require("../utils/keyword");

const addProduct = async (req, res) => {
  const { name, description, price, category, brand, stock, seller} = req.body;
  try {
    const cat = await Category.findById(category);
    const br = brand;;
    let a = req.user._id;
    let keywords = keyword(name, br, cat.title);

    if (price < 0 || stock < 0) {
      return res.status(400).json({ message: "Price and Stock Values cannot be negative" });
    }
    if (!cat) {
      return res.status(400).json({ message: "Invalid category" });
    }
    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      keywords,
      stock,
      seller
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "server Error", error: error.message });
  }
};

const addImage = async (req, res) => {
  const { productId } = req.body;
  const image = req.file.filename;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.image = image;
    await product.save();
    res.status(200).json({ message: "Image added successfully", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    var { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) page = 1;
    if (limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("category", ["name", "slug"])
      .populate("brand", ["name", "slug"])
      .exec();

    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({ products, totalProducts, totalPages });
  } catch (error) {
    return res.status(500).json({ message: "internal", error: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const foundProduct = await Product.findOne({ slug });

    return res.status(200).json(foundProduct);
  } catch (error) {
    return res.status(500).json({ message: "internal", error: error.message });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Slug is required" });
    }

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(400).json({ message: "Category doesn't exist" });
    }

    const foundProducts = await Product.find({ category: category._id })
      .populate("category", ["title", "slug"])
      .populate("brand", ["title", "slug"])
      .exec();

    return res
      .status(200)
      .json({ message: "Products found", foundProducts: foundProducts });
  } catch (error) {
    return res.status(500).json({ message: "internal", error: error.message });
  }
};

const getProductByBrand = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Brand is required" });
    }

    const brand = await Product.find({ brand: slug });

    if (!brand) {
      return res.status(400).json({ message: "Brand doesn't exist" });
    }

    const foundProducts = await Product.find({ brand: brand._id })
      .populate("category", ["title", "slug"])
      .populate("brand", ["title", "slug"])
      .exec();

    return res
      .status(200)
      .json({ message: "Products found", foundProducts: foundProducts });
  } catch (error) {
    return res.status(500).json({ message: "internal", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    return res.status(200).json({ message: "Product found", product: product });
  } catch (error) {
    return res.status(500).json({ message: "internal", error: error.message });
  }
};

const filter = async (req, res) => {
  const { startPrice, endPrice, brands, category } = req.body;
  var filter = {};
  if (startPrice && endPrice) {
    filter["price"] = { $gte: startPrice, $lte: endPrice };
  }
  if (brands) {
    filter["brand"] = { $in: brands };
  }
  if (category) {
    filter["category"] = category;
  }

  const product = await Product.find(filter);

  if (!product) {
    return res.json({
      status: 200,
      msg: "No products found, please change the filter.",
    });
  }

  return res.json({
    status: 200,
    msg: "Products fetched successfully",
    product,
  });
};

const searchProducts = async (req, res) => {
  try {
    const { q } = req.query; // Search query

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(q, "i");

    let products = await Product.find({ keywords: { $in: [searchRegex] } })
      .populate("category", ["title", "slug"])
      .populate("brand", ["title", "slug"])
      .exec();

    products = products.map((product) => {
      const matchCount = product.keywords.filter((keyword) =>
        keyword.includes(q.toLowerCase())
      ).length;
      return { ...product._doc, matchCount };
    });

    products.sort((a, b) => b.matchCount - a.matchCount);

    return res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  addImage,
  getProductBySlug,
  getProductByCategory,
  getProductByBrand,
  getProductById,
  filter,
};