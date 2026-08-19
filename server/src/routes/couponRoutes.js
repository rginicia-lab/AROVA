const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createCoupon,
  getCoupons,
  validateCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/validate", protect, validateCoupon);
router.get("/", protect, authorize("admin"), getCoupons);
router.post("/", protect, authorize("admin"), createCoupon);

module.exports = router;