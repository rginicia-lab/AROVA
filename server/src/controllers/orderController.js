const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const checkout = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = "cod",
      couponCode,
    } = req.body;

    // =========================
    // SHIPPING ADDRESS
    // =========================

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "line1",
      "city",
      "state",
      "postalCode",
    ];

    const missingField = requiredAddressFields.find(
      (field) => !shippingAddress[field]
    );

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `Shipping address field "${missingField}" is required`,
      });
    }

    // =========================
    // PAYMENT METHOD
    // =========================

    if (!["cod", "online"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be cod or online",
      });
    }

    // =========================
    // GET CART
    // =========================

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate(
      "items.product",
      "name price stock images isActive"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // =========================
    // CALCULATE SUBTOTAL
    // =========================

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "One or more cart products are unavailable",
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} no longer has enough stock`,
        });
      }

      const itemSubtotal =
        product.price * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        priceAtPurchase: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // =========================
    // SHIPPING
    // =========================

    const shipping = subtotal >= 999 ? 0 : 99;

    // =========================
    // COUPON
    // =========================

    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const normalizedCode =
        couponCode.trim().toUpperCase();

      const coupon = await Coupon.findOne({
        code: normalizedCode,
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon is invalid",
        });
      }

      // Check expiry
      if (coupon.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Coupon has expired",
        });
      }

      // Check usage limit
      if (
        coupon.usageLimit !== null &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Coupon usage limit has been reached",
        });
      }

      // Check if user already used coupon
      const alreadyUsed = coupon.usedBy.some(
        (userId) =>
          userId.toString() ===
          req.user._id.toString()
      );

      if (alreadyUsed) {
        return res.status(400).json({
          success: false,
          message:
            "You have already used this coupon",
        });
      }

      // Minimum order amount
      if (
        subtotal < coupon.minimumOrderAmount
      ) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount is ₹${coupon.minimumOrderAmount}`,
        });
      }

      // Calculate discount
      if (
        coupon.discountType === "percentage"
      ) {
        discount =
          (subtotal *
            coupon.discountValue) /
          100;
      } else {
        discount = coupon.discountValue;
      }

      // Maximum discount
      if (
        coupon.maximumDiscount !== null
      ) {
        discount = Math.min(
          discount,
          coupon.maximumDiscount
        );
      }

      // Never allow discount greater than subtotal
      discount = Math.min(
        discount,
        subtotal
      );

      discount = Math.round(discount);

      appliedCoupon = coupon;
    }

    // =========================
    // FINAL TOTAL
    // =========================

    const total = Math.max(
      0,
      subtotal + shipping - discount
    );

    // =========================
    // REDUCE STOCK
    // =========================

    for (const item of cart.items) {
      item.product.stock -= item.quantity;

      await item.product.save();
    }

    // =========================
    // CREATE ORDER
    // =========================

    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      shippingAddress,

      payment: {
        method: paymentMethod,
        status: "pending",
      },

      pricing: {
        subtotal,
        discount,
        shipping,
        total,
      },
    });

    // =========================
    // UPDATE COUPON USAGE
    // =========================

    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;

      appliedCoupon.usedBy.push(
        req.user._id
      );

      await appliedCoupon.save();
    }

    // =========================
    // CLEAR CART
    // =========================

    cart.items = [];

    await cart.save();

    // =========================
    // RESPONSE
    // =========================

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      coupon: appliedCoupon
        ? {
            code: appliedCoupon.code,
            discount,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// GET MY ORDERS
// =========================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =========================
// GET SINGLE ORDER
// =========================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.user._id,
    }).populate(
      "items.product",
      "name images price stock"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  checkout,
  getMyOrders,
  getOrderById,
};