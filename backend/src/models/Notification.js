const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_completed',
        'project_created',
        'money_added',
        'expense_added',
        'employee_joined',
        'reward_given',
        'transfer_completed',
        'general'
      ],
      default: 'general',
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Transaction', 'Employee', 'Venture', 'Reward', null],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    icon: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
