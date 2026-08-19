const mongoose = require("mongoose");

const priceWatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    priceWhenWatched: {
      type: Number,
      required: true,
      min: 0,
    },
    targetPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// A user can watch one product only once.
priceWatchSchema.index({ user: 1, product: 1 }, { unique: true });

// Finds active watches whenever a product price changes.
priceWatchSchema.index({ product: 1, isActive: 1 });

module.exports = mongoose.model("PriceWatch", priceWatchSchema);