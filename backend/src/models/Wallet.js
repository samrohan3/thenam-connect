const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
);

// Update lastUpdated before saving
walletSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Wallet', walletSchema);
