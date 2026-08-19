const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

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

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [{ product: product._id }],
      });
    } else {
      const alreadySaved = wishlist.products.some(
        (item) => item.product.toString() === productId
      );

      if (alreadySaved) {
        return res.status(409).json({
          success: false,
          message: "Product is already in your wishlist",
        });
      }

      wishlist.products.push({ product: product._id });
      await wishlist.save();
    }

    await wishlist.populate(
      "products.product",
      "name slug price stock images averageRating"
    );

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products.product",
      "name slug price stock images averageRating isActive"
    );

    res.status(200).json({
      success: true,
      wishlist: wishlist || { products: [] },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    const initialLength = wishlist.products.length;

    wishlist.products = wishlist.products.filter(
      (item) => item.product.toString() !== productId
    );

    if (wishlist.products.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    }

    await wishlist.save();

    await wishlist.populate(
      "products.product",
      "name slug price stock images averageRating isActive"
    );

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};