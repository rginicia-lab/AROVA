const PriceWatch = require("../models/PriceWatch");
const Product = require("../models/Product");

const createPriceWatch = async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;

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

    const numericTargetPrice =
      targetPrice === undefined || targetPrice === null
        ? null
        : Number(targetPrice);

    if (
      numericTargetPrice !== null &&
      (!Number.isFinite(numericTargetPrice) ||
        numericTargetPrice < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Target price must be a valid positive number",
      });
    }

    const watch = await PriceWatch.create({
      user: req.user._id,
      product: product._id,
      priceWhenWatched: product.price,
      targetPrice: numericTargetPrice,
    });

    res.status(201).json({
      success: true,
      message: "Product added to Arova Watch",
      watch,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This product is already in your watch list",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyPriceWatches = async (req, res) => {
  try {
    const watches = await PriceWatch.find({
      user: req.user._id,
      isActive: true,
    })
      .populate(
        "product",
        "name price images stock isActive category"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: watches.length,
      watches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const removePriceWatch = async (req, res) => {
  try {
    const watch = await PriceWatch.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watch) {
      return res.status(404).json({
        success: false,
        message: "Price watch not found",
      });
    }

    watch.isActive = false;
    await watch.save();

    res.status(200).json({
      success: true,
      message: "Price watch removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createPriceWatch,
  getMyPriceWatches,
  removePriceWatch,
};