const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const workspaceLinkService = require('../services/workspaceLinkService');
const AppError = require('../utils/AppError');

const createLink = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.createLink(req.body, req.user?.id);
  return created(res, link, 'Workspace link created successfully');
});

const getLinks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.workspace) filter.workspace = req.query.workspace;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.search = req.query.search;

  const links = await workspaceLinkService.listLinks(filter, req.userRole);
  return success(res, links, 'Workspace links retrieved successfully');
});

const getRecentLinks = asyncHandler(async (req, res) => {
  const { workspace } = req.query;
  if (!workspace) throw new AppError('Workspace query parameter is required', 400);
  
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 3;
  const links = await workspaceLinkService.getRecentLinks(workspace, req.userRole, limit);
  return success(res, links, 'Recent workspace links retrieved successfully');
});

const getLink = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.getLinkById(req.params.id);
  return success(res, link, 'Workspace link retrieved successfully');
});

const updateLink = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.updateLink(req.params.id, req.body, req.user?.id);
  return success(res, link, 'Workspace link updated successfully');
});

const trackLinkOpen = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.recordLinkOpen(req.params.id);
  return success(res, link, 'Link open recorded successfully');
});

const archiveLink = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.archiveLink(req.params.id, req.user?.id);
  return success(res, link, 'Workspace link archived successfully');
});

const restoreLink = asyncHandler(async (req, res) => {
  const link = await workspaceLinkService.restoreLink(req.params.id, req.user?.id);
  return success(res, link, 'Workspace link restored successfully');
});

const deleteLink = asyncHandler(async (req, res) => {
  await workspaceLinkService.deleteLink(req.params.id, req.user?.id);
  return success(res, null, 'Workspace link deleted successfully');
});

module.exports = {
  createLink,
  getLinks,
  getRecentLinks,
  getLink,
  updateLink,
  trackLinkOpen,
  archiveLink,
  restoreLink,
  deleteLink
};
