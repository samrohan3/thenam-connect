const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const healthRoutes = require('./health');
const authRoutes = require('./auth');
const ventureRoutes = require('./ventures');
const financeRoutes = require('./finance');
const employeeRoutes = require('./employees');
const projectRoutes = require('./projects');
const taskRoutes = require('./tasks');
const rewardRoutes = require('./rewards');
const dashboardRoutes = require('./dashboard');
const notificationRoutes = require('./notifications');
const settingsRoutes = require('./settings');
const searchRoutes = require('./search');
const uploadRoutes = require('./upload');

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/ventures', ventureRoutes);
router.use('/finance', financeRoutes);
router.use('/employees', employeeRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/rewards', rewardRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);

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

// API Documentation route
router.get('/docs', (req, res) => {
  return res.json({
    success: true,
    message: 'Thenam ERP API Documentation',
    version: '1.0.0',
    baseUrl: '/api',
    endpoints: [
      {
        method: 'GET',
        path: '/api/health',
        description: 'Health check - confirms server is running',
        access: 'Public'
      },
      {
        method: 'GET',
        path: '/api/db-test',
        description: 'Database test - checks MongoDB Atlas connection status',
        access: 'Public'
      },
      {
        method: 'GET',
        path: '/api/docs',
        description: 'API documentation - lists all available endpoints',
        access: 'Public'
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user',
        access: 'Public',
        body: { name: 'string', email: 'string', password: 'string', role: 'string (optional)' }
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login with email and password',
        access: 'Public',
        body: { email: 'string', password: 'string' }
      },
      {
        method: 'GET',
        path: '/api/auth/profile',
        description: 'Get the profile of the currently authenticated user',
        access: 'Private (Bearer Token required)'
      }
    ]
  });
});

module.exports = router;
