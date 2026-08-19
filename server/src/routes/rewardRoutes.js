const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { getMyRewards } = require("../controllers/rewardController");

const router = express.Router();

router.get("/", protect, getMyRewards);

module.exports = router;