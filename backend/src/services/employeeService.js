const Employee = require('../models/Employee');
const Team = require('../models/Team');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

// Helper to auto-generate unique Employee ID e.g. EMP-1001
const generateEmployeeId = async () => {
  const lastEmp = await Employee.findOne({ employeeId: { $regex: /^EMP-\d+$/ } })
    .sort({ createdAt: -1 })
    .lean();

  if (lastEmp && lastEmp.employeeId) {
    const match = lastEmp.employeeId.match(/^EMP-(\d+)$/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `EMP-${nextNum}`;
    }
  }

  const count = await Employee.countDocuments();
  return `EMP-${1001 + count}`;
};

const createEmployee = async (data, userId) => {
  const emailLower = data.email ? data.email.toLowerCase().trim() : '';
  if (!emailLower) {
    throw new AppError('Email is required', 400);
  }

  const existing = await Employee.findOne({ email: emailLower });
  if (existing) {
    throw new AppError('Employee with this email already exists', 400);
  }

  const employeeId = data.employeeId || (await generateEmployeeId());
  const venture = data.ventureId || data.venture;
  const team = data.teamId || data.team || null;
  const avatar = data.photo || data.avatar || null;

  // Name handling if firstName and lastName provided
  let fullName = data.name;
  if (!fullName && (data.firstName || data.lastName)) {
    fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }

  const employee = await Employee.create({
    ...data,
    name: fullName,
    email: emailLower,
    employeeId,
    venture,
    team,
    avatar,
    createdBy: userId
  });

  // If assigned to a team, add employee ID to Team members array
  if (team) {
    await Team.findByIdAndUpdate(team, {
      $addToSet: { members: employee._id }
    });
  }

  await logActivity({
    userId,
    action: 'Added Employee',
    entity: 'Employee',
    entityId: employee._id,
    entityName: employee.name
  });

  return getEmployeeById(employee._id);
};

const listEmployees = async (filter = {}) => {
  const query = {};
  if (filter.venture) query.venture = filter.venture;
  if (filter.team) query.team = filter.team;
  if (filter.department) query.department = filter.department;
  if (filter.role) query.role = filter.role;
  if (filter.status) query.status = filter.status;
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: 'i' } },
      { email: { $regex: filter.search, $options: 'i' } },
      { employeeId: { $regex: filter.search, $options: 'i' } },
      { designation: { $regex: filter.search, $options: 'i' } }
    ];
  }

  return Employee.find(query)
    .populate('venture', 'name key')
    .populate('team', 'teamName status')
    .populate('reportingManager', 'name designation email')
    .populate('taskCount')
    .sort({ joiningDate: -1, createdAt: -1 })
    .lean();
};

const getEmployeeById = async (id) => {
  const emp = await Employee.findById(id)
    .populate('venture', 'name key code category')
    .populate('team', 'teamName description status')
    .populate('reportingManager', 'name email designation phone avatar')
    .populate('projects', 'name status priority deadline')
    .populate('taskCount')
    .lean();

  if (!emp) throw new AppError('Employee not found', 404);
  return emp;
};

const updateEmployee = async (id, data, userId) => {
  const emp = await Employee.findById(id);
  if (!emp) throw new AppError('Employee not found', 404);

  if (data.email && data.email.toLowerCase() !== emp.email) {
    const existing = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new AppError('Employee with this email already exists', 400);
    data.email = data.email.toLowerCase();
  }

  // Name handling
  if (!data.name && (data.firstName || data.lastName)) {
    data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }

  if (data.ventureId) data.venture = data.ventureId;
  if (data.photo) data.avatar = data.photo;
  if (data.teamId !== undefined) data.team = data.teamId || null;

  const oldTeam = emp.team ? String(emp.team) : null;
  const newTeam = data.team !== undefined ? (data.team ? String(data.team) : null) : oldTeam;

  const updated = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  // Update team members array if team changed
  if (oldTeam !== newTeam) {
    if (oldTeam) {
      await Team.findByIdAndUpdate(oldTeam, { $pull: { members: emp._id } });
    }
    if (newTeam) {
      await Team.findByIdAndUpdate(newTeam, { $addToSet: { members: emp._id } });
    }
  }

  await logActivity({
    userId,
    action: 'Updated Employee',
    entity: 'Employee',
    entityId: updated._id,
    entityName: updated.name
  });

  return getEmployeeById(updated._id);
};

const deleteEmployee = async (id, userId) => {
  const emp = await Employee.findById(id);
  if (!emp) throw new AppError('Employee not found', 404);

  // Remove from any Team members array
  if (emp.team) {
    await Team.findByIdAndUpdate(emp.team, { $pull: { members: emp._id } });
  }

  // Also remove from any Team lead position if applicable
  await Team.updateMany({ teamLead: id }, { teamLead: null });

  await Employee.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'Deleted Employee',
    entity: 'Employee',
    entityId: emp._id,
    entityName: emp.name
  });

  return null;
};

const recalculatePerformance = async (employeeId) => {
  const emp = await Employee.findById(employeeId);
  if (!emp) return;
  emp.performance.rating = Math.min(100, emp.performance.rating + 1);
  await emp.save();
};

module.exports = {
  generateEmployeeId,
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  recalculatePerformance
};
