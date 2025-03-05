const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;