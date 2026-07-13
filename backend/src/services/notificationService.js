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
  icon = null
}) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      entityType,
      entityId,
      icon
    });
  } catch (err) {
    console.error('Notification creation error:', err.message);
  }
};

const getNotifications = async (userId, unreadOnly = false) => {
  const filter = { user: userId };
  if (unreadOnly) filter.isRead = false;
  
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
