const Category = require("../models/category")

const addCategory = async (req, res) => {
  try {
    const categories = req.body.categories;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories should be an array" });
    }

    const results = [];

    for (const categoryData of categories) {
      const { id, title, description } = categoryData;

      const existingCategory = await Category.findOne({ title });
      if (existingCategory) {
        results.push({ title, status: "failed", message: "Category title already exists" });
        continue;
      }

      const newCategory = new Category({
        id,
        title,
        description,
      });

      await newCategory.save();
      results.push({ title, status: "success", message: "Category added successfully", category: newCategory });
    }

    res.status(201).json({ results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
  const updateCategory = async (req, res) => {
    try {
      const { categoryId, title, description } = req.body;
  
      if (!categoryId) {
        return res.status(400).json({ message: "Category id is required" });
      }
  
      const categoryToUpdate = await Category.findById(categoryId);
      if (!categoryToUpdate) {
        return res.status(404).json({ message: "Invalid category id" });
      }
  
      if (title) categoryToUpdate.title = title;
      if (description) categoryToUpdate.description = description;
      if (req.file) categoryToUpdate.image = req.file.link;
  
      await categoryToUpdate.save();
      return res.status(200).json({ message: "Category updated successfully", category: categoryToUpdate });
  
    } catch (error) {
      return res.status(500).json({ message: "server error", error: error.message });
    }
  };
  
  const deleteCategory = async (req, res) => {
    try {
      const { categoryId } = req.body;
  
      if (!categoryId) {
        return res.status(400).json({ message: "Category id is required" });
      }
  
      const productsInCategory = await Product.find({ category: categoryId });
      if (productsInCategory.length > 0) {
        return res.status(400).json({ message: "Category has products. Cannot delete" });
      }
  
      await Category.findByIdAndDelete(categoryId);
      return res.status(200).json({ message: "Category deleted successfully" });
  
    } catch (error) {
      return res.status(500).json({ message: "server error", error: error.message });
    }
  };
  
const getCategories = async (req, res) => {
    try {
      const allCategories = await Category.find();
      return res.status(200).json({ categories: allCategories });
  
    } catch (error) {
      return res.status(500).json({ message: " server error", error: error.message });
    }
};

module.exports = {addCategory,updateCategory,deleteCategory,getCategories};