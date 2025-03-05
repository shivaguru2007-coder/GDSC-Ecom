const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const path = require("path");
const userRoutes = require('./routes/user.routes');
//const adminRoutes = require('./routes/admin.routes')
const sellerRoutes = require("./routes/seller.routes")
const PORT = process.env.PORT || 5000;

dotenv.config();

const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: false,
        useUnifiedTopology: false,
      });
      console.log("MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  };
connectDB();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use("/api/seller",sellerRoutes)
app.use("/api/user", userRoutes);
//app.use("/api/admin", adminRoutes);
app.get('/', (req, res) => {
    res.status(201).send('Server');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });