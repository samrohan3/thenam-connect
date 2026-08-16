const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { emitToUser } = require('../services/socketService');

// @desc    Get users available for 1-to-1 communication with last message previews and unread counts
// @route   GET /api/communication/direct-users
// @access  Private
const getDirectUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  // Fetch all active users except the current user
  const users = await User.find({ 
    _id: { $ne: currentUserId },
    status: 'Active'
  }).select('name email avatar roles role designation department status');

  // Enrich with last message info and unread badges
  const usersWithChatInfo = await Promise.all(
    users.map(async (userObj) => {
      const u = userObj.toObject();
      const conversationKey = [currentUserId.toString(), u._id.toString()].sort().join('_');
      
      const conversation = await Conversation.findOne({ conversationKey });
      
      if (conversation) {
        u.lastMessage = conversation.lastMessage;
        u.lastMessageAt = conversation.lastMessageAt;
        
        const unreadCount = await Message.countDocuments({
          conversationId: conversation._id,
          receiverId: currentUserId,
          readAt: null
        });
        u.unreadCount = unreadCount;
      } else {
        u.lastMessage = '';
        u.lastMessageAt = null;
        u.unreadCount = 0;
      }
      return u;
    })
  );

  // Sort: show users with recent conversations first, followed by alphabetical order of names
  usersWithChatInfo.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) {
      return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    }
    if (a.lastMessageAt) return -1;
    if (b.lastMessageAt) return 1;
    return a.name.localeCompare(b.name);
  });

  return success(res, usersWithChatInfo, 'Direct users list retrieved successfully');
});

// @desc    Get or create private conversation with another user
// @route   GET /api/communication/direct/:userId
// @access  Private
const getOrCreateDirectConversation = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'Target user ID is required' });
  }

  const conversationKey = [currentUserId.toString(), userId.toString()].sort().join('_');

  let conversation = await Conversation.findOne({ conversationKey })
    .populate('participants', 'name email avatar roles role designation department');

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [currentUserId, userId],
      conversationKey,
      lastMessage: 'No messages yet.',
      lastMessageAt: new Date()
    });
    
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email avatar roles role designation department');
  }

  // Mark all unread messages received from the other user as read when opening conversation
  await Message.updateMany(
    { conversationId: conversation._id, receiverId: currentUserId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return success(res, conversation, 'Conversation retrieved successfully');
});

// @desc    Send a direct message
// @route   POST /api/communication/direct/:userId/messages
// @access  Private
const sendDirectMessage = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { userId } = req.params;
  const { text, messageType = 'text', attachments = [], clientMessageId } = req.body;

  // ── Idempotency: if clientMessageId already exists, return the existing message ──
  if (clientMessageId) {
    const existing = await Message.findOne({ clientMessageId })
      .populate('senderId', 'name email avatar roles role')
      .populate('sender', 'name email avatar roles role')
      .populate('receiverId', 'name email avatar roles role')
      .populate('recipient', 'name email avatar roles role')
      .lean();
    if (existing) {
      return res.status(200).json({ success: true, data: existing, message: 'Message already exists' });
    }
  }

  const conversationKey = [currentUserId.toString(), userId.toString()].sort().join('_');
  let conversation = await Conversation.findOne({ conversationKey });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: [currentUserId, userId],
      conversationKey,
      lastMessage: '',
      lastMessageAt: new Date()
    });
  }

  // Secure validation check: current authenticated user must be a participant
  if (!conversation.participants.map(id => id.toString()).includes(currentUserId.toString())) {
    return res.status(403).json({ success: false, message: 'Forbidden: You are not a participant in this conversation' });
  }

  // Formulate preview text for conversation view
  let lastMsgText = text || '';
  if (messageType !== 'text') {
    if (messageType === 'image') lastMsgText = '📷 Sent an image';
    else if (messageType === 'video') lastMsgText = '🎥 Sent a video';
    else lastMsgText = '📎 Sent a file';
  }

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: currentUserId,
    receiverId: userId,
    messageType,
    text,
    content: text, // compatibility
    attachments,
    clientMessageId: clientMessageId || null
  });

  // Update conversation last activity
  conversation.lastMessage = lastMsgText;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name email avatar roles role')
    .populate('sender', 'name email avatar roles role')
    .populate('receiverId', 'name email avatar roles role')
    .populate('recipient', 'name email avatar roles role')
    .lean();

  // ── Realtime: notify the recipient of the new direct message ──────────────
  // Emit to sender's room so multiple tabs work, and to receiver's room
  emitToUser(String(currentUserId), 'dm:new', {
    ...populatedMessage,
    _conversationUserId: userId
  });
  emitToUser(String(userId), 'dm:new', {
    ...populatedMessage,
    _conversationUserId: String(currentUserId)
  });

  return res.status(201).json({
    success: true,
    data: populatedMessage,
    message: 'Message sent successfully'
  });
});

// @desc    Get messages for conversation with userId
// @route   GET /api/communication/direct/:userId/messages
// @access  Private
const getDirectMessages = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { userId } = req.params;

  const conversationKey = [currentUserId.toString(), userId.toString()].sort().join('_');
  const conversation = await Conversation.findOne({ conversationKey });

  if (!conversation) {
    return success(res, [], 'No conversation exists yet');
  }

  // Secure validation check: current authenticated user must be a participant
  if (!conversation.participants.map(id => id.toString()).includes(currentUserId.toString())) {
    return res.status(403).json({ success: false, message: 'Forbidden: You cannot access this conversation' });
  }

  // Auto mark received messages in this conversation as read
  await Message.updateMany(
    { conversationId: conversation._id, receiverId: currentUserId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  const messages = await Message.find({ conversationId: conversation._id })
    .populate('senderId', 'name email avatar roles role')
    .populate('sender', 'name email avatar roles role')
    .populate('receiverId', 'name email avatar roles role')
    .populate('recipient', 'name email avatar roles role')
    .sort({ createdAt: 1 })
    .lean();

  return success(res, messages, 'Messages retrieved successfully');
});

// @desc    Mark a message as read
// @route   POST /api/communication/messages/:messageId/read
// @access  Private
const markMessageAsRead = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  // Secure validation check: current user must be the recipient
  const isReceiver = message.receiverId && message.receiverId.toString() === currentUserId.toString();
  const isRecipient = message.recipient && message.recipient.toString() === currentUserId.toString();

  if (!isReceiver && !isRecipient) {
    return res.status(403).json({ success: false, message: 'Forbidden: You cannot mark this message as read' });
  }

  message.readAt = new Date();
  await message.save();

  return success(res, message, 'Message marked as read');
});

module.exports = {
  getDirectUsers,
  getOrCreateDirectConversation,
  sendDirectMessage,
  getDirectMessages,
  markMessageAsRead
};
