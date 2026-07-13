const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const searchService = require('../services/searchService');

const globalSearch = asyncHandler(async (req, res) => {
    const query = req.query.q;
    const results = await searchService.globalSearch(query);
    return success(res, results, 'Search results retrieved successfully');
});

module.exports = {
    globalSearch
};
