const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const dashboardService = require('../services/dashboardService');

const getStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    return success(res, stats, 'Dashboard stats retrieved successfully');
});

const getCharts = asyncHandler(async (req, res) => {
    const charts = await dashboardService.getDashboardCharts();
    return success(res, charts, 'Dashboard charts retrieved successfully');
});

const getRecentActivities = asyncHandler(async (req, res) => {
    const activities = await dashboardService.getRecentActivities();
    return success(res, activities, 'Recent activities retrieved successfully');
});

module.exports = {
    getStats,
    getCharts,
    getRecentActivities
};
