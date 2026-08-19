const Reward = require("../models/Reward");

const getMyRewards = async (req, res) => {
  try {
    let reward = await Reward.findOne({ user: req.user._id });

    if (!reward) {
      reward = await Reward.create({
        user: req.user._id,
        points: 0,
        level: "Bronze",
      });
    }

    res.status(200).json({
      success: true,
      reward,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getMyRewards };