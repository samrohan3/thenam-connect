const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const settingsService = require('../services/settingsService');

const getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings();
    return success(res, settings, 'Settings retrieved successfully');
});

const updateSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.updateSettings(req.body, req.user.id);
    return success(res, settings, 'Settings updated successfully');
});

module.exports = {
    getSettings,
    updateSettings
};
