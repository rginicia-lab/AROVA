const express = require("express");

const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/adminOrderController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", getAllOrders);

router.patch("/:id/status", updateOrderStatus);

module.exports = router;