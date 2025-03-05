const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Uploads folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images (JPG, JPEG, PNG) are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = {upload};
