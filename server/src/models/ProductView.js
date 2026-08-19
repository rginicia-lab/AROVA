const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      trim: true,
      default: "",
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

productViewSchema.index({ user: 1, viewedAt: -1 });
productViewSchema.index({ product: 1, viewedAt: -1 });

module.exports = mongoose.model("ProductView", productViewSchema);