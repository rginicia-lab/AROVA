const Product = require("../models/Product");

const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $match: {
          isActive: true,
          stock: { $gt: 0 },
        },
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$viewCount", 1] },
              { $multiply: ["$soldCount", 5] },
              { $multiply: ["$wishlistCount", 3] },
              { $multiply: ["$averageRating", 10] },
            ],
          },
        },
      },
      {
        $sort: {
          trendingScore: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getTrendingProducts };