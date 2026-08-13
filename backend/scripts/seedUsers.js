require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thenam';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const users = [
      {
        name: 'Jayamurugan',
        username: 'jayamurugan',
        email: 'jayamurugan@thenam.com',
        firebaseUid: 'dummy_jayamurugan_uid',
        password: await bcrypt.hash('Zara_thenam', 10),
        plainPassword: 'Zara_thenam',
        roles: ['admin']
      },
      {
        name: 'Sam@thenam',
        username: 'sam',
        firebaseUid: 'dummy_sam_uid',
        password: await bcrypt.hash('diyana',10),
        plainPassword: "diyana",
        roles: ['finance'],
      },
      {
        name: 'Nausheen',
        username: 'nausheen',
        email: 'nausheen@thenam.com',
        firebaseUid: 'dummy_nausheen_uid',
        password: await bcrypt.hash('thenam@analyst', 10),
        plainPassword: 'thenam@analyst',
        roles: ['business analyst']
      },
      {
        name: 'Sameena',
        username: 'sameena',
        email: 'sameena@thenam.com',
        firebaseUid: 'dummy_sameena_uid',
        password: await bcrypt.hash('thenam@finance', 10),
        plainPassword: 'thenam@finance',
        roles: ['finance']
      }
    ];

    for (const u of users) {
      await User.updateOne(
        { username: u.username },
        { $set: u },
        { upsert: true }
      );
      console.log(`User ${u.username} seeded.`);
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
};

seed();
