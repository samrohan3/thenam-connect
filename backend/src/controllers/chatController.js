const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');

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
    .sort({ createdAt: 1 })
    .lean();

  return success(res, messages, 'Messages retrieved successfully');
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, channel = 'general', recipientId } = req.body;
  const currentUserId = req.user._id || req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, message: 'Message content is required' });
  }

  const messageData = {
    sender: currentUserId,
    content: content.trim(),
    channel: recipientId ? null : channel,
    recipient: recipientId || null
  };

  const message = await Message.create(messageData);
  await message.populate('sender', 'name email avatar role');

  return created(res, message, 'Message sent successfully');
});

module.exports = {
  getMessages,
  sendMessage
};
