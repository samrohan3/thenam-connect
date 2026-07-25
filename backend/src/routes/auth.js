const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, canAccess } = require('../middleware/auth');

// Public routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Protected routes
router.get('/profile', protect, authController.getUserProfile);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.changePassword);
router.get('/users', protect, canAccess('user_management', 'read'), authController.getUsers);

module.exports = router;
