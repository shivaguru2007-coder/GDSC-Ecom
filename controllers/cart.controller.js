const User = require("../models/users");
const Product = require("../models/product");
const sendWebhookNotification = require("../utils/webhook");

const addCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid user ID, product ID, or quantity" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find((item) => item.productId.toString() === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    sendWebhookNotification(user.webhookUrl, {
        event: "cart_updated",
        message: "Item added to cart",
        cart: user.cart,
      });
    await user.save();
    res.json({ message: "Product added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


const getCart =  async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const updateCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId || quantity <= 0) {
    return res.status(400).json({ message: "Invalid user ID, product ID, or quantity" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find((item) => item.productId.toString() === productId);
    if (!cartItem) return res.status(404).json({ message: "Product not in cart" });

    cartItem.quantity = quantity;
    await user.save();
    
    res.json({ message: "Cart updated successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const removeCart = async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: "Invalid user ID or product ID" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter((item) => item.productId.toString() !== productId);
    await user.save();
    sendWebhookNotification(user.webhookUrl, {
        event: "cart_updated",
        message: "Item removed from cart",
        cart: user.cart,
      });
    res.json({ message: "Product removed from cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const reduceCart = async (req, res) => {
    const { userId, productId,quantity } = req.body;
  
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ message: "Invalid user ID or product ID or quantity" });
    }
    
    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const cartItem = user.cart.find((item) => item.productId.toString() === productId);

      if (cartItem) {
        cartItem.quantity -= quantity;
      } else {
        return  res.status(404).json({ message:"Product doesn't exist."})
      }
  
      await user.save();
  
      res.json({ message: quantity+" number of Product removed from cart", cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
};

const clearCart = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = [];
    await user.save();

    res.json({ message: "Cart cleared successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const cartVal = async (req, res) => {
    const { userId } = req.body;
    
    try {
        const user = await User.findById(userId);
        let totalAmount = 0;
        user.cart.forEach((item) => {
          totalAmount += item.productId.price * item.quantity;
        });
    }catch(error){
        res.status(500).json({ message: "Server error", error });
    }
}
module.exports = {
    addCart,
    getCart,
    updateCart,
    clearCart,
    removeCart,
    reduceCart,
    cartVal
};
