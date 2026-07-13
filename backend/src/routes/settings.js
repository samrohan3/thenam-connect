const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(settingsController.getSettings)
    .put(settingsController.updateSettings);

module.exports = router;
