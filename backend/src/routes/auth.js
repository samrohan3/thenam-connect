const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, canAccess } = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/firebase-login', authController.firebaseLogin);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-status/:email', authController.getResetStatus);
router.post('/approve-reset', protect, authController.approveReset);
router.post('/set-new-password', authController.setNewPassword);
// Protected routes
router.get('/profile', protect, authController.getUserProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.put('/password', protect, authController.changePassword);
router.post('/migrate-existing-users', protect, canAccess('user_management', 'create'), authController.migrateExistingUsers);
router.get('/users', protect, canAccess('user_management', 'read'), authController.getUsers);

module.exports = router;
