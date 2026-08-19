const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/", protect, getWishlist);

router.post("/items", protect, addToWishlist);

router.delete("/items/:productId", protect, removeFromWishlist);

module.exports = router;