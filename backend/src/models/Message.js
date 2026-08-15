const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: { // For compatibility
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    recipient: { // For compatibility
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    channelId: {
      type: String,
      default: null,
      index: true
    },
    channel: { // For compatibility
      type: String,
      default: 'general',
      index: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'file'],
      default: 'text'
    },
    text: {
      type: String,
      trim: true,
      default: ''
    },
    content: { // For compatibility
      type: String,
      trim: true,
      default: ''
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String }, // MIME type
        size: { type: Number },
        storageProvider: { type: String, enum: ['firebase', 'google-drive'], default: 'firebase' },
        storagePath: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook to keep compatibility fields synchronized before validation runs
messageSchema.pre('validate', function (next) {
  if (this.senderId && !this.sender) {
    this.sender = this.senderId;
  } else if (this.sender && !this.senderId) {
    this.senderId = this.sender;
  }

  if (this.receiverId && !this.recipient) {
    this.recipient = this.receiverId;
  } else if (this.recipient && !this.receiverId) {
    this.receiverId = this.recipient;
  }

  if (this.channelId && !this.channel) {
    this.channel = this.channelId;
  } else if (this.channel && !this.channelId) {
    this.channelId = this.channel;
  }

  if (this.text && !this.content) {
    this.content = this.text;
  } else if (this.content && !this.text) {
    this.text = this.content;
  }

  next();
});

messageSchema.index({ channel: 1, createdAt: 1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
