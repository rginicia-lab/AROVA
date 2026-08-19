const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getLowStockProducts,
  updateStock,
} = require("../controllers/inventoryController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/low-stock", getLowStockProducts);
router.patch("/:productId/stock", updateStock);

module.exports = router;