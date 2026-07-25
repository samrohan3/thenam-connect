const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    venture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venture',
      required: true,
      index: true
    },
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
      index: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      }
    ],
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

// Virtuals for alias compatibility
teamSchema.virtual('ventureId').get(function () {
  return this.venture;
});

teamSchema.virtual('teamLeadId').get(function () {
  return this.teamLead;
});

// Indexes
teamSchema.index({ venture: 1, status: 1 });
teamSchema.index({ teamName: 1, venture: 1 });

module.exports = mongoose.model('Team', teamSchema);
