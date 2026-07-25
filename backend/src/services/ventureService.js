const Venture = require('../models/Venture');
const Wallet = require('../models/Wallet');
const Team = require('../models/Team');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

const createVenture = async (data, userId) => {
  // Check if key already exists
  const existing = await Venture.findOne({ key: data.key.toLowerCase() });
  if (existing) {
    throw new AppError(`Venture with key '${data.key}' already exists`, 400);
  }

  const venture = await Venture.create({
    ...data,
    key: data.key.toLowerCase(),
    createdBy: userId
  });

  // Automatically create a wallet for this venture
  await Wallet.create({ venture: venture._id });

  await logActivity({
    userId,
    action: 'Created Venture',
    entity: 'Venture',
    entityId: venture._id,
    entityName: venture.name
  });

  return venture;
};

const listVentures = async (filter = {}) => {
  return Venture.find(filter)
    .populate('wallet', 'balance totalRevenue totalExpense currency')
    .populate('employeeCount')
    .populate('projectCount')
    .sort({ createdAt: -1 })
    .lean();
};

const getVentureById = async (id) => {
  const venture = await Venture.findById(id)
    .populate('wallet')
    .populate('employeeCount')
    .populate('projectCount')
    .lean();
    
  if (!venture) throw new AppError('Venture not found', 404);
  return venture;
};

const updateVenture = async (id, data, userId) => {
  const venture = await Venture.findById(id);
  if (!venture) throw new AppError('Venture not found', 404);

  const oldName = venture.name;
  
  if (data.key && data.key.toLowerCase() !== venture.key) {
      const existing = await Venture.findOne({ key: data.key.toLowerCase() });
      if (existing) throw new AppError(`Venture with key '${data.key}' already exists`, 400);
      data.key = data.key.toLowerCase();
  }

  const updated = await Venture.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  await logActivity({
    userId,
    action: 'Updated Venture',
    entity: 'Venture',
    entityId: updated._id,
    entityName: updated.name,
    oldValue: { name: oldName },
    newValue: { name: updated.name }
  });

  return updated;
};

const deleteVenture = async (id, userId) => {
  const venture = await Venture.findById(id);
  if (!venture) throw new AppError('Venture not found', 404);
  
  // Prevent deletion if teams exist under this venture
  const teamCount = await Team.countDocuments({ venture: id });
  if (teamCount > 0) {
    throw new AppError(`Cannot delete venture '${venture.name}' because it contains ${teamCount} active team(s). Please delete or reassign the teams first.`, 400);
  }

  await Wallet.findOneAndDelete({ venture: id });
  await Venture.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'Deleted Venture',
    entity: 'Venture',
    entityId: venture._id,
    entityName: venture.name
  });

  return null;
};

const archiveVenture = async (id, userId) => {
    return updateVenture(id, { status: 'archived' }, userId);
};

const restoreVenture = async (id, userId) => {
    return updateVenture(id, { status: 'active' }, userId);
};

module.exports = {
  createVenture,
  listVentures,
  getVentureById,
  updateVenture,
  deleteVenture,
  archiveVenture,
  restoreVenture
};
