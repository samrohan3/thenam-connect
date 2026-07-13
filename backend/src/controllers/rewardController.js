const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const rewardService = require('../services/rewardService');

const grantReward = asyncHandler(async (req, res) => {
    const reward = await rewardService.grantReward(req.body, req.user.id);
    return created(res, reward, 'Reward granted successfully');
});

const getRewards = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    
    const rewards = await rewardService.listRewards(filter);
    return success(res, rewards, 'Rewards retrieved successfully');
});

const getLeaderboard = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await rewardService.getLeaderboard(limit);
    return success(res, leaderboard, 'Leaderboard retrieved successfully');
});

module.exports = {
    grantReward,
    getRewards,
    getLeaderboard
};
