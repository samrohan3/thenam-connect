const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const apiRoutes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. Configure CORS
app.use(cors({
  origin: '*', // Customize this with frontend URL for production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Configure Morgan Logger
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Static uploads folder configuration
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 5. Mount API Routes
app.use('/api', apiRoutes);

// 6. Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Thenam ERP API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      dbTest: '/api/db-test',
      auth: '/api/auth'
    }
  });
});

// 6b. /health shortcut alias (for direct health checks without /api prefix)
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ERP Backend Running' });
});

// 7. 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// 7. Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
