const Notification = require('../models/Notification');

/**
 * Create a new notification for a user.
 */
const createNotification = async ({
  userId,
  title,
  message,
  type = 'general',
  entityType = null,
  entityId = null,
  relatedId = null,
  relatedType = null,
  actionUrl = null,
  icon = null,
  metadata = {},
  expiresAt = null
}) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      entityType,
      entityId,
      relatedId: relatedId || entityId,
      relatedType: relatedType || entityType,
      actionUrl,
      icon,
      metadata,
      expiresAt
    });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

const getNotifications = async (userId, unreadOnly = false) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  
  // Exclude expired notifications
  filter.$or = [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } }
  ];
  
  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
};

const deleteNotification = async (userId, notificationId) => {
  return Notification.findOneAndDelete({ _id: notificationId, user: userId });
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
