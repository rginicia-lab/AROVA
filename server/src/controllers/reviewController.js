const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

const refreshProductRating = async (productId) => {
  const result = await Review.aggregate([
    {
      $match: {
        product: productId,
        status: "visible",
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const rating = result[0] || { averageRating: 0, reviewCount: 0 };

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(rating.averageRating.toFixed(1)),
    reviewCount: rating.reviewCount,
  });
};

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment = "" } = req.body;
    const numericRating = Number(rating);

    if (!productId || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Product ID and a rating from 1 to 5 are required",
      });
    }

    const order = await Order.findOne({
      user: req.user._id,
      status: { $ne: "cancelled" },
      "items.product": productId,
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You can review only products you have purchased",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: order._id,
      rating: numericRating,
      comment,
    });

    await refreshProductRating(productId);

    res.status(201).json({
      success: true,
      message: "Review submitted",
      review,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: "visible",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
};