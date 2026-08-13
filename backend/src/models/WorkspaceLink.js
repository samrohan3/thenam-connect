const mongoose = require('mongoose');

const workspaceLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    workspace: {
      type: String,
      enum: ['designer', 'analyst'],
      required: true
    },
    icon: {
      type: String,
      trim: true,
      default: ''
    },
    visibility: {
      type: String,
      enum: ['Everyone', 'Admin Only', 'Specific Roles'],
      default: 'Everyone'
    },
    allowedRoles: [{
      type: String,
      trim: true
    }],
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active'
    },
    lastOpenedAt: {
      type: Date,
      default: null
    },
    openCount: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

workspaceLinkSchema.index({ workspace: 1, status: 1 });
workspaceLinkSchema.index({ type: 1 });
workspaceLinkSchema.index({ category: 1 });

module.exports = mongoose.model('WorkspaceLink', workspaceLinkSchema);
