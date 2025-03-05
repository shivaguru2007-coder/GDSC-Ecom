const mongoose = require("mongoose");
const slugify = require("slugify");

const CategorySchema = new mongoose.Schema(
  {

    id:{      
        type: String,
        required: true,
        unique: true,
        trim: true,},
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Generate slug before saving
CategorySchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
