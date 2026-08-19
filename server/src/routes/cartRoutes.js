const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);
router.post("/items", protect, addToCart);
router.patch("/items/:productId", protect, updateCartItem);
router.delete("/items/:productId", protect, removeCartItem);

module.exports = router;