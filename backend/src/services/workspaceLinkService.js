const WorkspaceLink = require('../models/WorkspaceLink');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

const listLinks = async (filter = {}, userRole) => {
  const query = { status: { $ne: 'Archived' } };

  if (filter.workspace) query.workspace = filter.workspace;
  if (filter.status) query.status = filter.status;
  if (filter.type) query.type = filter.type;
  if (filter.category) query.category = filter.category;
  
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { description: { $regex: filter.search, $options: 'i' } }
    ];
  }

  // Handle visibility based on role
  // If not admin/founder, only show links meant for everyone or their specific role
  if (!['Admin', 'Founder'].includes(userRole)) {
    const roleVisibility = [
      { visibility: 'Everyone' },
      { visibility: 'Specific Roles', allowedRoles: userRole }
    ];
    
    if (query.$or) {
      // If we had a search $or, we need to AND them
      query.$and = [{ $or: query.$or }, { $or: roleVisibility }];
      delete query.$or;
    } else {
      query.$or = roleVisibility;
    }
  }

  return WorkspaceLink.find(query)
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: -1 })
    .lean();
};

const getRecentLinks = async (workspace, userRole, limit = 3) => {
  const query = { 
    workspace, 
    status: { $ne: 'Archived' },
    lastOpenedAt: { $ne: null }
  };

  if (!['Admin', 'Founder'].includes(userRole)) {
    query.$or = [
      { visibility: 'Everyone' },
      { visibility: 'Specific Roles', allowedRoles: userRole }
    ];
  }

  return WorkspaceLink.find(query)
    .sort({ lastOpenedAt: -1 })
    .limit(limit)
    .lean();
};

const getLinkById = async (id) => {
  const link = await WorkspaceLink.findById(id).populate('createdBy', 'name email avatar').lean();
  if (!link) throw new AppError('Workspace Link not found', 404);
  return link;
};

const createLink = async (data, userId) => {
  if (!data.name || !data.url || !data.workspace) {
    throw new AppError('Name, URL, and Workspace are required', 400);
  }

  const link = await WorkspaceLink.create({
    ...data,
    createdBy: userId
  });

  await logActivity({
    userId,
    action: `Created ${data.workspace} Link`,
    entity: 'WorkspaceLink',
    entityId: link._id,
    entityName: link.name
  });

  return getLinkById(link._id);
};

const updateLink = async (id, data, userId) => {
  const link = await WorkspaceLink.findById(id);
  if (!link) throw new AppError('Workspace Link not found', 404);

  const updated = await WorkspaceLink.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  await logActivity({
    userId,
    action: 'Updated Workspace Link',
    entity: 'WorkspaceLink',
    entityId: updated._id,
    entityName: updated.name
  });

  return getLinkById(updated._id);
};

const recordLinkOpen = async (id) => {
  const link = await WorkspaceLink.findById(id);
  if (!link) throw new AppError('Workspace Link not found', 404);

  link.lastOpenedAt = new Date();
  link.openCount += 1;
  await link.save();
  
  return link;
};

const archiveLink = async (id, userId) => {
  const link = await WorkspaceLink.findById(id);
  if (!link) throw new AppError('Workspace Link not found', 404);

  link.status = 'Archived';
  await link.save();

  await logActivity({
    userId,
    action: 'Archived Workspace Link',
    entity: 'WorkspaceLink',
    entityId: link._id,
    entityName: link.name
  });

  return link;
};

const restoreLink = async (id, userId) => {
  const link = await WorkspaceLink.findById(id);
  if (!link) throw new AppError('Workspace Link not found', 404);

  link.status = 'Active';
  await link.save();

  await logActivity({
    userId,
    action: 'Restored Workspace Link',
    entity: 'WorkspaceLink',
    entityId: link._id,
    entityName: link.name
  });

  return link;
};

const deleteLink = async (id, userId) => {
  const link = await WorkspaceLink.findById(id);
  if (!link) throw new AppError('Workspace Link not found', 404);

  await WorkspaceLink.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'Deleted Workspace Link',
    entity: 'WorkspaceLink',
    entityId: link._id,
    entityName: link.name
  });

  return null;
};

module.exports = {
  listLinks,
  getRecentLinks,
  getLinkById,
  createLink,
  updateLink,
  recordLinkOpen,
  archiveLink,
  restoreLink,
  deleteLink
};
