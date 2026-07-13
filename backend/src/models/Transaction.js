const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      unique: true,
      index: true
    },
    type: {
      type: String,
      enum: ['Money In', 'Money Out', 'Transfer', 'Salary', 'Refund', 'Investment', 'Purchase', 'Maintenance', 'Misc'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      trim: true
    },
    destination: {
      type: String,
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other'],
      default: 'Bank Transfer'
    },
    category: {
      type: String,
      trim: true
    },
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Cancelled', 'Failed'],
      default: 'Completed',
      index: true
    },
    remarks: {
      type: String,
      trim: true
    },
    attachment: {
      type: String,
      default: null
    },
    // For transfers: link the paired transaction
    pairedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    },
    transferDirection: {
      type: String,
      enum: ['out', 'in', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common query patterns
transactionSchema.index({ venture: 1, date: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ date: -1, status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
