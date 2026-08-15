const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');

// @desc    Get channel or direct messages (legacy/fallback support)
// @route   GET /api/chat/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { channel = 'general', recipientId } = req.query;
  const currentUserId = req.user._id || req.user.id;

  let query = {};
  if (recipientId) {
    query = {
      $or: [
        { sender: currentUserId, recipient: recipientId },
        { sender: recipientId, recipient: currentUserId }
      ]
    };
  } else {
    query = { channel };
  }

  const messages = await Message.find(query)
    .populate('sender', 'name email avatar role')
    .populate('senderId', 'name email avatar role')
    .sort({ createdAt: 1 })
    .lean();

  return success(res, messages, 'Messages retrieved successfully');
});

// @desc    Send a channel message (with attachment support)
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, channel = 'general', recipientId, messageType = 'text', attachments = [] } = req.body;
  const currentUserId = req.user._id || req.user.id;

  const hasText = content && content.trim();
  const hasAttachments = attachments && attachments.length > 0;

  if (!hasText && !hasAttachments) {
    return res.status(400).json({ success: false, message: 'Message content or attachment is required' });
  }

  const messageData = {
    sender: currentUserId,
    senderId: currentUserId,
    content: (content || '').trim(),
    text: (content || '').trim(),
    channel: recipientId ? null : channel,
    channelId: recipientId ? null : channel,
    recipient: recipientId || null,
    receiverId: recipientId || null,
    messageType,
    attachments
  };

  const message = await Message.create(messageData);
  await message.populate('sender', 'name email avatar role');

  return created(res, message, 'Message sent successfully');
});

module.exports = {
  getMessages,
  sendMessage
};
