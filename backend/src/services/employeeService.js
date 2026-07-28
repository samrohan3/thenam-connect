const Employee = require('../models/Employee');
const Team = require('../models/Team');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const {
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser
} = require('../config/firebase');

// Ensure legacy non-sparse firebaseUid indexes are safely dropped from MongoDB collections on startup
Employee.collection.dropIndex('firebaseUid_1').catch(() => {});
User.collection.dropIndex('firebaseUid_1').catch(() => {});

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
  const password = data.password || 'Thenam@12345';

  // Name handling
  let fullName = data.name;
  if (!fullName && (data.firstName || data.lastName)) {
    fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }

  // Step 1: Create user in Firebase Authentication
  let firebaseUid = null;
  try {
    const fbUser = await createFirebaseUser({
      email: emailLower,
      password,
      displayName: fullName
    });
    firebaseUid = fbUser?.uid || null;

    if (firebaseUid) {
      await logActivity({
        userId,
        action: 'Firebase Account Created',
        entity: 'Employee',
        entityName: fullName,
        details: { firebaseUid, email: emailLower }
      });
    }
  } catch (fbErr) {
    console.warn('[Firebase Auth] Employee creation fallback:', fbErr.message);
  }

  // If Firebase Cloud credentials are not configured locally, assign unique fallback UID
  if (!firebaseUid) {
    firebaseUid = `fb_emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  // Step 2: Create Employee document in MongoDB
  const employeeData = {
    ...data,
    name: fullName,
    email: emailLower,
    employeeId,
    venture,
    team,
    avatar,
    firebaseUid,
    firebaseAuth: true,
    createdBy: userId
  };

  const employee = await Employee.create(employeeData);

  // Maintain User model sync
  try {
    await User.findOneAndUpdate(
      { email: emailLower },
      {
        name: fullName,
        email: emailLower,
        role: data.role || 'Employee',
        phone: data.phone,
        avatar,
        department: data.department,
        designation: data.designation,
        venture,
        team,
        firebaseUid,
        firebaseAuth: true,
        status: data.status || 'Active'
      },
      { upsert: true, new: true }
    );
  } catch (uErr) {
    console.error('[User Sync] Warning during employee sync:', uErr.message);
  }

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

  if (!data.name && (data.firstName || data.lastName)) {
    data.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }

  if (data.ventureId) data.venture = data.ventureId;
  if (data.photo) data.avatar = data.photo;
  if (data.teamId !== undefined) data.team = data.teamId || null;

  const oldTeam = emp.team ? String(emp.team) : null;
  const newTeam = data.team !== undefined ? (data.team ? String(data.team) : null) : oldTeam;

  // Sync Firebase Auth status if status is updated
  if (data.status && data.status !== emp.status && emp.firebaseUid && !emp.firebaseUid.startsWith('fb_emp_')) {
    const isDisabled = data.status === 'Inactive' || data.status === 'Terminated';
    await updateFirebaseUser(emp.firebaseUid, { disabled: isDisabled });

    await logActivity({
      userId,
      action: isDisabled ? 'User Disabled' : 'User Enabled',
      entity: 'Employee',
      entityId: emp._id,
      entityName: emp.name,
      details: { firebaseUid: emp.firebaseUid, disabled: isDisabled }
    });
  }

  const updated = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  // Sync User model
  try {
    await User.findOneAndUpdate(
      { email: updated.email },
      {
        name: updated.name,
        role: updated.role,
        status: updated.status === 'Inactive' ? 'Inactive' : 'Active',
        phone: updated.phone,
        avatar: updated.avatar,
        designation: updated.designation,
        department: updated.department
      }
    );
  } catch (uErr) {
    console.error('[User Sync] Warning during update:', uErr.message);
  }

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

  // Delete user from Firebase Auth if valid UID
  if (emp.firebaseUid && !emp.firebaseUid.startsWith('fb_emp_')) {
    await deleteFirebaseUser(emp.firebaseUid);
  }

  // Remove from any Team members array
  if (emp.team) {
    await Team.findByIdAndUpdate(emp.team, { $pull: { members: emp._id } });
  }

  // Remove from Team lead position
  await Team.updateMany({ teamLead: id }, { teamLead: null });

  // Delete User document if exists
  await User.findOneAndDelete({ email: emp.email });

  await Employee.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'User Deleted',
    entity: 'Employee',
    entityId: emp._id,
    entityName: emp.name,
    details: { firebaseUid: emp.firebaseUid }
  });

  return null;
};

const updateEmployeeStatus = async (id, status, userId) => {
  return updateEmployee(id, { status }, userId);
};

const recalculatePerformance = async (employeeId) => {
  if (!employeeId) return;
  try {
    const Task = require('../models/Task');
    const [completed, total] = await Promise.all([
      Task.countDocuments({ assignedTo: employeeId, status: 'Completed' }),
      Task.countDocuments({ assignedTo: employeeId })
    ]);
    const pending = total - completed;
    const rating = total > 0 ? Math.round((completed / total) * 100) : 100;

    await Employee.findByIdAndUpdate(employeeId, {
      'performance.tasksCompleted': completed,
      'performance.tasksPending': pending,
      'performance.rating': rating
    });
  } catch (err) {
    console.error('Error recalculating performance:', err);
  }
};

module.exports = {
  generateEmployeeId,
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus,
  recalculatePerformance
};
