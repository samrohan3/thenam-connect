const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const healthRoutes = require('./health');
const authRoutes = require('./auth');

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Database connection test route
router.get('/db-test', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    return res.json({
      success: true,
      message: 'MongoDB Connected Successfully'
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'MongoDB Connection Failed'
    });
  }
});

module.exports = router;
