require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI;

const check = async () => {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({ username: { $in: ['jayamurugan', 'nausheen', 'sameena'] } });
  console.log(users.map(u => ({ username: u.username, roles: u.roles })));
  process.exit(0);
};

check();
