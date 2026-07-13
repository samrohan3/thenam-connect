const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      unique: true,
      index: true
    },
    balance: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    totalExpense: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Update lastUpdated before saving
walletSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

// Instance method: credit wallet
walletSchema.methods.credit = async function (amount) {
  this.balance += amount;
  this.totalRevenue += amount;
  return this.save();
};

// Instance method: debit wallet
walletSchema.methods.debit = async function (amount) {
  if (this.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  this.balance -= amount;
  this.totalExpense += amount;
  return this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);
