const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const ventureService = require('../services/ventureService');

const createVenture = asyncHandler(async (req, res) => {
    const venture = await ventureService.createVenture(req.body, req.user.id);
    return created(res, venture, 'Venture created successfully');
});

const getVentures = asyncHandler(async (req, res) => {
    const ventures = await ventureService.listVentures();
    return success(res, ventures, 'Ventures retrieved successfully');
});

const getVenture = asyncHandler(async (req, res) => {
    const venture = await ventureService.getVentureById(req.params.id);
    return success(res, venture, 'Venture retrieved successfully');
});

const updateVenture = asyncHandler(async (req, res) => {
    const venture = await ventureService.updateVenture(req.params.id, req.body, req.user.id);
    return success(res, venture, 'Venture updated successfully');
});

const deleteVenture = asyncHandler(async (req, res) => {
    await ventureService.deleteVenture(req.params.id, req.user.id);
    return success(res, null, 'Venture deleted successfully');
});

const archiveVenture = asyncHandler(async (req, res) => {
    const venture = await ventureService.archiveVenture(req.params.id, req.user.id);
    return success(res, venture, 'Venture archived successfully');
});

const restoreVenture = asyncHandler(async (req, res) => {
    const venture = await ventureService.restoreVenture(req.params.id, req.user.id);
    return success(res, venture, 'Venture restored successfully');
});

module.exports = {
    createVenture,
    getVentures,
    getVenture,
    updateVenture,
    deleteVenture,
    archiveVenture,
    restoreVenture
};
