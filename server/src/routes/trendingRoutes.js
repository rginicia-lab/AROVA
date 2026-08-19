const express = require("express");
const {
  getTrendingProducts,
} = require("../controllers/trendingController");

const router = express.Router();

router.get("/", getTrendingProducts);

module.exports = router;