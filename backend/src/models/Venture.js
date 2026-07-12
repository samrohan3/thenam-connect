const mongoose = require('mongoose');

const ventureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Venture', ventureSchema);
