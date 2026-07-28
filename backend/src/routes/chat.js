const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/messages')
    .get(chatController.getMessages)
    .post(chatController.sendMessage);

module.exports = router;
