const ActivityLog = require('../models/ActivityLog');

/**
 * Log any user action to the activity log.
 * Called inside service functions after a successful operation.
 */
const logActivity = async ({
  userId,
  userName,
  action,
  entity,
  entityId = null,
  entityName = '',
  oldValue = null,
  newValue = null,
  req = null,
}) => {
  try {
    await ActivityLog.create({
      user: userId || null,
      userName: userName || 'System',
      action,
      entity,
      entityId,
      entityName,
      oldValue,
      newValue,
      ipAddress: req ? (req.ip || req.connection?.remoteAddress || '') : '',
      userAgent: req ? (req.headers?.['user-agent'] || '') : '',
    });
  } catch (err) {
    // Never throw — activity logging must not break primary operations
    console.error('Activity log error:', err.message);
  }
};

/**
 * Get paginated activity log entries.
 */
const getActivityLog = async ({ page = 1, limit = 20, entity, userId } = {}) => {
  const filter = {};
  if (entity) filter.entity = entity;
  if (userId) filter.user = userId;

  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    ActivityLog.countDocuments(filter),
  ]);

  return { docs, total, page, pages: Math.ceil(total / limit) };
};

module.exports = { logActivity, getActivityLog };
