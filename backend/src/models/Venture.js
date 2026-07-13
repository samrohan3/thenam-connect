const mongoose = require('mongoose');

const ventureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    tagline: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    logo: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'inactive'],
      default: 'active',
      index: true
    },
    industry: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      trim: true
    },
    gradient: {
      type: String,
      default: 'gradient-royal'
    },
    colorTheme: {
      type: String,
      default: '#6366f1'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: wallet populated elsewhere
ventureSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'venture',
  justOne: true
});

// Virtual: employee count
ventureSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'venture',
  count: true
});

// Virtual: project count
ventureSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'venture',
  count: true
});

module.exports = mongoose.model('Venture', ventureSchema);
