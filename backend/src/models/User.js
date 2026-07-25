const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['Founder', 'Admin', 'Manager', 'Finance', 'Employee', 'Customer', 'FOUNDER', 'ADMIN', 'HR', 'FINANCE', 'MANAGER', 'EMPLOYEE', 'USER'],
      default: 'Customer'
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: null
    },
    department: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    refreshToken: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpire: {
      type: Date,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for frequently queried fields
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
