const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    points: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    badge: {
      type: String,
      trim: true
    },
    gift: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['Achievement', 'Bonus', 'Certificate', 'Gift', 'Recognition'],
      default: 'Achievement'
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
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

// Indexes
rewardSchema.index({ employee: 1, date: -1 });
rewardSchema.index({ date: -1 });

module.exports = mongoose.model('Reward', rewardSchema);
