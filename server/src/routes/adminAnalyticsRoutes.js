const express = require("express");

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getDashboardAnalytics,
} = require("../controllers/adminAnalyticsController");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("admin"),
  getDashboardAnalytics
);

module.exports = router;