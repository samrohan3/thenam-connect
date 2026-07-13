const ActivityLog = require('../models/ActivityLog');

/**
 * Creates an activity log entry.
 * Can be called directly in controllers: await logActivity({ user, action, entity, ... })
 */
const logActivity = async ({
  user = null,
  userName = null,
  action,
  entity,
  entityId = null,
  entityName = null,
  oldValue = null,
  newValue = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    await ActivityLog.create({
      user,
      userName,
      action,
      entity,
      entityId,
      entityName,
      oldValue,
      newValue,
      ipAddress,
      userAgent
    });
  } catch (err) {
    // Never let logging failure crash the main request
    console.error('Activity log error:', err.message);
  }
};

/**
 * Express middleware that automatically logs any mutation requests.
 * Attaches req.logActivity helper for use in controllers.
 */
const activityLoggerMiddleware = (req, res, next) => {
  req.logActivity = async ({ action, entity, entityId, entityName, oldValue, newValue }) => {
    await logActivity({
      user: req.user?._id || null,
      userName: req.user?.name || null,
      action,
      entity,
      entityId,
      entityName,
      oldValue,
      newValue,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    });
  };
  next();
};

module.exports = { logActivity, activityLoggerMiddleware };
