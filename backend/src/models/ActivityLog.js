const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    userName: {
      type: String,
      trim: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    entityName: {
      type: String,
      trim: true
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      trim: true
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
