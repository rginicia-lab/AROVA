const express = require("express");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  getAllReviews,
  updateReviewStatus,
} = require("../controllers/adminReviewController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/reviews", getAllReviews);

router.patch(
  "/reviews/:id/status",
  updateReviewStatus
);

module.exports = router;