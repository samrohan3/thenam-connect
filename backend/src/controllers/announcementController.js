const Announcement = require('../models/Announcement');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const { normalizeRole } = require('../config/rbac');
const { emitToAll } = require('../services/socketService');

const ALLOWED_ANNOUNCEMENT_ROLES = ['admin', 'founder', 'manager', 'super admin'];

/**
 * Build query that returns only active, non-expired announcements.
 */
const activeAnnouncementFilter = () => ({
  isActive: true,
  expiresAt: { $gt: new Date() }
});

// @desc  Get all active (non-expired) announcements
// @route GET /api/announcements
// @access Private
const getAnnouncements = asyncHandler(async (req, res) => {
  // Management can see all; others see only active & non-expired
  const userRole = normalizeRole(req.user?.role || '').toLowerCase();
  const filter = ALLOWED_ANNOUNCEMENT_ROLES.includes(userRole)
    ? {} // admins can see everything including expired
    : activeAnnouncementFilter();

  const announcements = await Announcement.find(filter)
    .populate('author', 'name email avatar role')
    .sort({ pinned: -1, createdAt: -1 })
    .lean();

  return success(res, announcements, 'Announcements retrieved successfully');
});

// @desc  Get only active/non-expired announcements (used by popup)
// @route GET /api/announcements/active
// @access Private
const getActiveAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find(activeAnnouncementFilter())
    .populate('author', 'name email avatar role')
    .sort({ pinned: -1, createdAt: -1 })
    .lean();

  return success(res, announcements, 'Active announcements retrieved successfully');
});

// @desc  Create announcement and broadcast to all authenticated users
// @route POST /api/announcements
// @access Private (Admin/Founder/Manager)
const createAnnouncement = asyncHandler(async (req, res) => {
  const effectiveRole = req.userRole || normalizeRole(req.user?.role || '');
  const rawRole = (req.user?.role || '').toLowerCase();
  const isAllowed = ['admin', 'founder'].includes(effectiveRole) || ALLOWED_ANNOUNCEMENT_ROLES.includes(rawRole);

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Admin, Founder, and Manager can post announcements'
    });
  }

  const { title, content, message, pinned, targetType = 'all', targetUsers = [], targetRoles = [] } = req.body;
  const announcementContent = content || message;

  if (!title || !announcementContent) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }

  // Set expiry to 3 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 3);

  const announcement = await Announcement.create({
    title: title.trim(),
    content: announcementContent.trim(),
    message: announcementContent.trim(),
    pinned: Boolean(pinned),
    author: req.user._id || req.user.id,
    createdByName: req.user.name || '',
    isActive: true,
    expiresAt,
    targetType,
    targetUsers,
    targetRoles
  });

  try {
    await announcement.populate('author', 'name email avatar role');
  } catch (err) {
    console.warn('[Announcement] Author populate warning:', err.message);
  }

  // ── Realtime broadcast ─────────────────────────────────────────────────────
  // Emit announcement:new to ALL connected clients.
  const broadcastPayload = {
    _id: announcement._id,
    id: announcement._id,
    title: announcement.title,
    content: announcement.content,
    message: announcement.content,
    pinned: announcement.pinned,
    createdByName: announcement.createdByName,
    author: announcement.author,
    createdAt: announcement.createdAt,
    expiresAt: announcement.expiresAt,
    isActive: announcement.isActive,
    targetType: announcement.targetType
  };

  emitToAll('announcement:new', broadcastPayload);
  console.log(`[Announcement] Broadcasted announcement:new to all clients: "${announcement.title}"`);

  return created(res, announcement, 'Announcement posted successfully');
});

// @desc  Delete announcement (soft-deactivate by default, hard-delete if ?hard=true)
// @route DELETE /api/announcements/:id
// @access Private (Admin/Founder/Manager)
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const effectiveRole = req.userRole || normalizeRole(req.user?.role || '');
  const rawRole = (req.user?.role || '').toLowerCase();
  const isAllowed = ['admin', 'founder'].includes(effectiveRole) || ALLOWED_ANNOUNCEMENT_ROLES.includes(rawRole);

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Only Admin, Founder, and Manager can delete announcements'
    });
  }

  const hardDelete = req.query.hard === 'true';

  if (hardDelete) {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
  } else {
    // Soft delete: mark inactive
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
  }

  return success(res, null, 'Announcement deleted successfully');
});

module.exports = {
  getAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
