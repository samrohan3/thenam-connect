const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: Number,
      default: 0
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'On leave', 'Terminated'],
      default: 'Active',
      index: true
    },
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true }
    },
    documents: [
      {
        name: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      }
    ],
    // Denormalized performance cache (updated when tasks change)
    performance: {
      tasksCompleted: { type: Number, default: 0 },
      tasksPending: { type: Number, default: 0 },
      attendancePct: { type: Number, default: 100 },
      projectCount: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 100 }
    },
    // Reward points total
    rewardPoints: {
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: task count
employeeSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'assignedTo',
  count: true
});

// Indexes
employeeSchema.index({ venture: 1, department: 1 });
employeeSchema.index({ status: 1, venture: 1 });
employeeSchema.index({ rewardPoints: -1 });

module.exports = mongoose.model('Employee', employeeSchema);
