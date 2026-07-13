const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(rewardController.getRewards)
    .post(rewardController.grantReward);

router.get('/leaderboard', rewardController.getLeaderboard);

module.exports = router;
