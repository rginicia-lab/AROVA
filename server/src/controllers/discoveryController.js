const Product = require("../models/Product");
const ProductView = require("../models/ProductView");

// =====================================================
// RECORD PRODUCT VIEW
// =====================================================

const recordProductView = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await ProductView.create({
      user: req.user._id,
      product: product._id,
      category: product.category,
    });

    await Product.findByIdAndUpdate(
      product._id,
      {
        $inc: {
          viewCount: 1,
        },
      }
    );

    res.status(201).json({
      success: true,
      message: "Product view recorded",
    });
  } catch (error) {
    console.error(
      "Record product view error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// AROVA PICKS / DISCOVER MORE
// =====================================================

const getArovaPicks = async (req, res) => {
  try {
    // -----------------------------------------------
    // Find categories preferred by the user
    // -----------------------------------------------

    const preferredCategories =
      await ProductView.aggregate([
        {
          $match: {
            user: req.user._id,
          },
        },

        {
          $group: {
            _id: "$category",
            viewCount: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            viewCount: -1,
          },
        },

        {
          $limit: 3,
        },
      ]);

    const categoryIds = preferredCategories
      .map((item) => item._id)
      .filter(Boolean);

    // -----------------------------------------------
    // Personalized products
    // -----------------------------------------------

    let products = [];

    if (categoryIds.length > 0) {
      products = await Product.find({
        isActive: true,
        category: {
          $in: categoryIds,
        },
      })
        .sort({
          soldCount: -1,
          averageRating: -1,
          viewCount: -1,
          createdAt: -1,
        })
        .limit(12)
        .populate(
          "category",
          "name slug"
        );
    }

    // -----------------------------------------------
    // Fallback
    // -----------------------------------------------

    if (products.length === 0) {
      products = await Product.find({
        isActive: true,
      })
        .sort({
          soldCount: -1,
          averageRating: -1,
          viewCount: -1,
          createdAt: -1,
        })
        .limit(12)
        .populate(
          "category",
          "name slug"
        );
    }

    // -----------------------------------------------
    // Final response
    // -----------------------------------------------

    res.status(200).json({
      success: true,
      message: "Arova Picks generated",
      preferredCategories,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "AROVA Picks error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// COMPARE PRODUCTS
// =====================================================

const compareProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    // -----------------------------------------------
    // Validate product IDs
    // -----------------------------------------------

    if (
      !Array.isArray(productIds) ||
      productIds.length < 2 ||
      productIds.length > 4
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide between 2 and 4 product IDs",
      });
    }

    // -----------------------------------------------
    // Remove duplicate IDs
    // -----------------------------------------------

    const uniqueIds = [
      ...new Set(productIds),
    ];

    if (
      uniqueIds.length !==
      productIds.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Duplicate product IDs are not allowed",
      });
    }

    // -----------------------------------------------
    // Find products
    // -----------------------------------------------

    const products = await Product.find({
      _id: {
        $in: uniqueIds,
      },
      isActive: true,
    }).populate(
      "category",
      "name slug"
    );

    if (
      products.length !==
      uniqueIds.length
    ) {
      return res.status(404).json({
        success: false,
        message:
          "One or more products were not found",
      });
    }

    // -----------------------------------------------
    // Collect specification keys
    // -----------------------------------------------

    const specificationKeys = [
      ...new Set(
        products.flatMap((product) => {
          if (
            product.specifications &&
            typeof product.specifications.keys ===
              "function"
          ) {
            return [
              ...product.specifications.keys(),
            ];
          }

          if (
            product.specifications &&
            typeof product.specifications ===
              "object"
          ) {
            return Object.keys(
              product.specifications
            );
          }

          return [];
        })
      ),
    ];

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(200).json({
      success: true,
      comparison: {
        specificationKeys,
        products,
      },
    });
  } catch (error) {
    console.error(
      "Compare products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  recordProductView,
  getArovaPicks,
  compareProducts,
};