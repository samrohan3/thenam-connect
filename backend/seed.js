require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Venture = require('./src/models/Venture');
const Wallet = require('./src/models/Wallet');
const Employee = require('./src/models/Employee');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');
const Transaction = require('./src/models/Transaction');
const Reward = require('./src/models/Reward');
const Notification = require('./src/models/Notification');
const ActivityLog = require('./src/models/ActivityLog');
const Settings = require('./src/models/Settings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing mock data (ventures, transactions, team, projects, tasks)...');
    await Promise.all([
      Venture.deleteMany(),
      Wallet.deleteMany(),
      Employee.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Transaction.deleteMany(),
      Reward.deleteMany(),
      Notification.deleteMany(),
      ActivityLog.deleteMany()
    ]);

    // Ensure essential user login credentials exist
    console.log('Ensuring user login credentials exist...');
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);

    const usersToCreate = [
      {
        name: 'Admin User',
        email: 'admin@thenam.com',
        role: 'ADMIN',
        phone: '+91 98765 43210',
        department: 'Management'
      },
      {
        name: 'Isha Manager',
        email: 'isha@thenam.com',
        role: 'MANAGER',
        phone: '+91 98765 43211',
        department: 'Operations'
      },
      {
        name: 'Neha Employee',
        email: 'neha@thenam.com',
        role: 'EMPLOYEE',
        phone: '+91 98765 43212',
        department: 'Sales'
      },
      {
        name: 'Aarav Founder',
        email: 'aarav@thenam.com',
        role: 'FINANCE',
        phone: '+91 98765 43213',
        department: 'Management'
      }
    ];

    for (const u of usersToCreate) {
      const exists = await User.findOne({ email: u.email.toLowerCase() });
      if (!exists) {
        await User.create({
          ...u,
          password: hashedPassword
        });
        console.log(`Created user ${u.email}`);
      } else {
        console.log(`User ${u.email} already exists`);
      }
    }

    // Ensure Settings singleton exists
    const settingsExists = await Settings.findOne({ singleton: true });
    if (!settingsExists) {
      await Settings.create({ singleton: true });
    }

    console.log('Mock data cleared successfully. Login credentials preserved!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
