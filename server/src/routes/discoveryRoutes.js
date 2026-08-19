const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  recordProductView,
  getArovaPicks,
  compareProducts,
} = require("../controllers/discoveryController");

const router = express.Router();

router.post("/views/:productId", protect, recordProductView);
router.get("/picks", protect, getArovaPicks);
router.post("/compare", compareProducts);

module.exports = router;