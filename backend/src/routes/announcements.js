const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all announcements (admin sees all, others see active/non-expired only)
// POST create announcement (admin/founder/manager only)
router.route('/')
    .get(announcementController.getAnnouncements)
    .post(announcementController.createAnnouncement);

// GET only active/non-expired announcements (used by the popup for all users)
router.get('/active', announcementController.getActiveAnnouncements);

// DELETE announcement
router.route('/:id')
    .delete(announcementController.deleteAnnouncement);

module.exports = router;
