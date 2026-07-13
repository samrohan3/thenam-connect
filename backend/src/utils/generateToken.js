const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecretjwtkeyforthenamerp2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'refreshsecretjwtkeyforthenamerp2026',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    }
  );
};

const generatePasswordResetToken = (id) => {
  return jwt.sign(
    { id, purpose: 'reset' },
    process.env.JWT_SECRET || 'supersecretjwtkeyforthenamerp2026',
    {
      expiresIn: '1h'
    }
  );
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generatePasswordResetToken
};
