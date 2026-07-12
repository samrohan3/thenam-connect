const express = require('express');
const router = express.Router();

// @desc    Health check API
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  return res.json({
    success: true,
    message: 'ERP Backend Running'
  });
});

module.exports = router;
