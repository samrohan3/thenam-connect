const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const { normalizeRole } = require('../config/rbac');

const ALLOWED_ANNOUNCEMENT_ROLES = ['admin', 'founder', 'manager', 'super admin'];

const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find()
    .populate('author', 'name email avatar role')
    .sort({ pinned: -1, createdAt: -1 })
    .lean();

  return success(res, announcements, 'Announcements retrieved successfully');
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const userRole = normalizeRole(req.user?.role || '').toLowerCase();
  if (!ALLOWED_ANNOUNCEMENT_ROLES.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Admin, Founder, and Manager can post announcements'
    });
  }

  const { title, content, pinned } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    content: content.trim(),
    pinned: Boolean(pinned),
    author: req.user._id || req.user.id
  });

  await announcement.populate('author', 'name email avatar role');

  return created(res, announcement, 'Announcement posted successfully');
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const userRole = normalizeRole(req.user?.role || '').toLowerCase();
  if (!ALLOWED_ANNOUNCEMENT_ROLES.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Admin, Founder, and Manager can delete announcements'
    });
  }

  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    return res.status(404).json({ success: false, message: 'Announcement not found' });
  }

  return success(res, null, 'Announcement deleted successfully');
});

module.exports = {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
