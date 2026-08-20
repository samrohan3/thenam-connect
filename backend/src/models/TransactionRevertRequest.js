const mongoose = require('mongoose');

const transactionRevertRequestSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      index: true
    },
    transactionReference: {
      type: String,
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedByName: {
      type: String,
      required: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
      index: true
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    processedByName: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date,
      default: null
    },
    denialReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Ensure a transaction only has one pending request at any time
transactionRevertRequestSchema.index({ transaction: 1, status: 1 });

module.exports = mongoose.model('TransactionRevertRequest', transactionRevertRequestSchema);
