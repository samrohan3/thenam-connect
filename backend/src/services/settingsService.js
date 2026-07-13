const Settings = require('../models/Settings');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

// Retrieve settings (create if not exists, since it's a singleton)
const getSettings = async () => {
    let settings = await Settings.findOne({ singleton: true }).lean();
    if (!settings) {
        settings = await Settings.create({ singleton: true });
    }
    return settings;
};

// Update settings
const updateSettings = async (data, userId) => {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) {
        settings = await Settings.create({ singleton: true, ...data });
    } else {
        // Flatten the update so nested objects don't overwrite entirely unless intended
        // Mongoose handles nested updates well if passed correctly, or we can just use set()
        settings.set(data);
        await settings.save();
    }

    await logActivity({
        userId,
        action: 'Updated Settings',
        entity: 'Settings',
        entityId: settings._id,
        entityName: 'Global Settings'
    });

    return settings;
};

module.exports = {
    getSettings,
    updateSettings
};
