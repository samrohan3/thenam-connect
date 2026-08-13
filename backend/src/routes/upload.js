const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../config/multer'); // The existing multer config
const uploadFirebase = require('../config/multerFirebase');

router.use(protect);

router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

// Firebase specific upload for images
router.post('/firebase-image', uploadFirebase.single('file'), uploadController.uploadFirebaseImage);

module.exports = router;
