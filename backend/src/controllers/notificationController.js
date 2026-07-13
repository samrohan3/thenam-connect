const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const notificationService = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getNotifications(req.user.id, unreadOnly);
    return success(res, notifications, 'Notifications retrieved successfully');
});

const markAsRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    return success(res, notification, 'Notification marked as read');
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    return success(res, null, 'All notifications marked as read');
});

const deleteNotification = asyncHandler(async (req, res) => {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    return success(res, null, 'Notification deleted successfully');
});

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
