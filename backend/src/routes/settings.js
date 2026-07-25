const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(canAccess('settings', 'read'), settingsController.getSettings)
    .put(canAccess('settings', 'update'), settingsController.updateSettings);

module.exports = router;
