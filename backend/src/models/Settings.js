const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // Singleton: always one settings document
    singleton: {
      type: Boolean,
      default: true,
      unique: true
    },
    company: {
      name: { type: String, default: 'Thenam Software Solutions', trim: true },
      domain: { type: String, default: 'thenam.com', trim: true },
      registration: { type: String, default: 'U72900KA2019PTC000000', trim: true },
      fiscalYear: { type: String, default: 'Apr — Mar', trim: true },
      address: { type: String, default: 'Bengaluru, India', trim: true },
      logo: { type: String, default: null },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: 'admin@thenam.com', trim: true },
      currency: { type: String, default: 'INR' },
      language: { type: String, default: 'en' }
    },
    notifications: {
      weeklyReport: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      largePayments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      maintenance: { type: Boolean, default: true }
    },
    system: {
      maintenanceMode: { type: Boolean, default: false },
      allowRegistration: { type: Boolean, default: true },
      defaultCurrency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
