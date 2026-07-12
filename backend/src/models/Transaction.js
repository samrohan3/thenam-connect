const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Revenue', 'Expense', 'Transfer'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
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
      trim: true
    },
    referenceNumber: {
      type: String,
      trim: true
    },
    username: {
      type: String,
      trim: true
    },
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true
    },
    status: {
      type: String,
      default: 'pending'
    },
    remarks: {
      type: String,
      trim: true
    },
    attachment: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
