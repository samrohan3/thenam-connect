const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { protect } = require('../middleware/auth');

// All communication endpoints require Firebase Token Authentication
router.use(protect);

router.get('/direct-users', communicationController.getDirectUsers);

router.route('/direct/:userId')
  .get(communicationController.getOrCreateDirectConversation);

router.route('/direct/:userId/messages')
  .get(communicationController.getDirectMessages)
  .post(communicationController.sendDirectMessage);

router.post('/messages/:messageId/read', communicationController.markMessageAsRead);

module.exports = router;
