const Review = require("../models/Review");
const Product = require("../models/Product");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .populate("order", "_id")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["visible", "hidden"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review status",
      });
    }

    const review = await Review.findById(
      req.params.id
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;
    await review.save();

    // Recalculate product rating
    const result = await Review.aggregate([
      {
        $match: {
          product: review.product,
          status: "visible",
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: {
            $avg: "$rating",
          },
          reviewCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const rating = result[0] || {
      averageRating: 0,
      reviewCount: 0,
    };

    await Product.findByIdAndUpdate(
      review.product,
      {
        averageRating: Number(
          rating.averageRating.toFixed(1)
        ),
        reviewCount:
          rating.reviewCount,
      }
    );

    res.status(200).json({
      success: true,
      message: "Review status updated",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllReviews,
  updateReviewStatus,
};