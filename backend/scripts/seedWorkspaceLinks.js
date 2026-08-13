require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const WorkspaceLink = require('../src/models/WorkspaceLink');

const seedLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/thenam-erp');
    console.log('Connected to MongoDB');

    const existingLinks = await WorkspaceLink.countDocuments();
    if (existingLinks > 0) {
      console.log(`Database already has ${existingLinks} workspace links. Skipping seed.`);
      process.exit(0);
    }

    const initialLinks = [
      {
        name: 'Google Drive Assets',
        description: 'Shared company design and marketing assets',
        url: 'https://drive.google.com',
        type: 'Google Drive',
        category: 'Design',
        workspace: 'designer',
        icon: 'google-drive',
        visibility: 'Everyone',
        status: 'Active'
      },
      {
        name: 'Figma Workspace',
        description: 'Company UI/UX design workspace',
        url: 'https://figma.com',
        type: 'Figma',
        category: 'Design',
        workspace: 'designer',
        icon: 'figma',
        visibility: 'Everyone',
        status: 'Active'
      },
      {
        name: 'Master Excel / Sheets',
        description: 'Master business spreadsheet',
        url: 'https://docs.google.com/spreadsheets',
        type: 'Google Sheets',
        category: 'Documents',
        workspace: 'analyst',
        visibility: 'Everyone',
        status: 'Active'
      },
      {
        name: 'Google Meet',
        description: 'Team syncs and client meetings',
        url: 'https://meet.google.com',
        type: 'Other',
        category: 'General',
        workspace: 'analyst',
        visibility: 'Everyone',
        status: 'Active'
      },
      {
        name: 'Strategy Documents',
        description: 'Core strategy and planning folder',
        url: 'https://drive.google.com',
        type: 'Google Drive',
        category: 'Documents',
        workspace: 'analyst',
        visibility: 'Everyone',
        status: 'Active'
      }
    ];

    await WorkspaceLink.insertMany(initialLinks);
    console.log('Successfully seeded initial workspace links!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding workspace links:', error);
    process.exit(1);
  }
};

seedLinks();
