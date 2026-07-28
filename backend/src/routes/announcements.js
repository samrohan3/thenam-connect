const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(announcementController.getAnnouncements)
    .post(announcementController.createAnnouncement);

router.route('/:id')
    .delete(announcementController.deleteAnnouncement);

module.exports = router;
