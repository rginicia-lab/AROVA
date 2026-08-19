const Coupon = require("../models/Coupon");

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const coupon = await Coupon.findOne({
      code: code?.toUpperCase(),
      isActive: true,
    });

    if (!coupon || coupon.expiresAt < new Date()) {
      return res.status(404).json({
        success: false,
        message: "Coupon is invalid or expired",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit has been reached",
      });
    }

    if (coupon.usedBy.some((userId) => userId.toString() === req.user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon",
      });
    }

    if (Number(subtotal) < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
      });
    }

    let discount =
      coupon.discountType === "percentage"
        ? (Number(subtotal) * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maximumDiscount !== null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }

    res.status(200).json({
      success: true,
      coupon,
      discount: Math.round(discount),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  validateCoupon,
};