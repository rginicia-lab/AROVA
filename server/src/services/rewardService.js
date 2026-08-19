const Reward = require("../models/Reward");

const getLevel = (points) => {
  if (points >= 2000) return "Platinum";
  if (points >= 1000) return "Gold";
  if (points >= 500) return "Silver";
  return "Bronze";
};

const addRewardPoints = async (userId, points, reason) => {
  let reward = await Reward.findOne({ user: userId });

  if (!reward) {
    reward = await Reward.create({
      user: userId,
      points: 0,
      level: "Bronze",
      badges: [],
      pointsHistory: [],
    });
  }

  reward.points += points;
  reward.level = getLevel(reward.points);

  reward.pointsHistory.push({
    points,
    reason,
  });

  if (reward.points >= 100 && !reward.badges.includes("First Shopper")) {
    reward.badges.push("First Shopper");
  }

  if (reward.points >= 500 && !reward.badges.includes("Silver Explorer")) {
    reward.badges.push("Silver Explorer");
  }

  await reward.save();

  return reward;
};

module.exports = { addRewardPoints };