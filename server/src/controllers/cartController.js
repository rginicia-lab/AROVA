const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const requestedQuantity = Number(quantity);

    if (!productId || !Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "A valid productId and quantity are required",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity is not available in stock",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: product._id, quantity: requestedQuantity }],
      });
    } else {
      const item = cart.items.find(
        (cartItem) => cartItem.product.toString() === productId
      );

      if (item) {
        const finalQuantity = item.quantity + requestedQuantity;

        if (finalQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: "Total cart quantity exceeds available stock",
          });
        }

        item.quantity = finalQuantity;
      } else {
        cart.items.push({
          product: product._id,
          quantity: requestedQuantity,
        });
      }

      await cart.save();
    }

    await cart.populate("items.product", "name slug price stock images");

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name slug price stock images isActive"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: { items: [], pricing: { subtotal: 0, shipping: 0, total: 0 } },
      });
    }

    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    const subtotal = validItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        items: validItems,
        pricing: { subtotal, shipping, total },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a whole number of at least 1",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart?.items.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item is not in your cart",
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product", "name slug price stock images");

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item is not in your cart",
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};