const mongoose = require('mongoose');
const socketPlugin = require('../models/plugins/socketPlugin');

// Apply the socket plugin globally to all schemas
mongoose.plugin(socketPlugin);

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('MONGO_URI environment variable not found.');
    throw new Error('MONGO_URI environment variable not found.');
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Atlas Connected');
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed');
    console.error(error.message);
    throw error;
  }
};

module.exports = connectDB;
