require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('../src/models/Transaction');
const Wallet = require('../src/models/Wallet');
const ActivityLog = require('../src/models/ActivityLog'); // maybe clear finance related activity logs? or just all activity logs? the user wants to reset finance log.

const resetFinance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thenam-connect'); // usually from process.env.MONGO_URI but it's not defined in the backend .env maybe? Let's check backend .env
    console.log('MongoDB Connected');

    console.log('Deleting all transactions...');
    await Transaction.deleteMany({});
    
    console.log('Resetting all wallets to 0...');
    await Wallet.updateMany({}, {
        $set: {
            balance: 0,
            totalRevenue: 0,
            totalExpense: 0
        }
    });

    console.log('Finance data has been reset.');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting finance:', error);
    process.exit(1);
  }
};

resetFinance();
