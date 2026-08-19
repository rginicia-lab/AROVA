const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  createPriceWatch,
  getMyPriceWatches,
  removePriceWatch,
} = require("../controllers/priceWatchController");

const router = express.Router();

router.get("/", protect, getMyPriceWatches);

router.post("/", protect, createPriceWatch);

router.delete("/:id", protect, removePriceWatch);

module.exports = router;