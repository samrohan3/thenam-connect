const Task = require('../models/Task');
const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const { recalculatePerformance } = require('./employeeService');
const { createNotification } = require('./notificationService');
const { normalizeRole } = require('../config/rbac');

const Team = require('../models/Team');

const MANAGEMENT_ROLES = ['admin', 'founder', 'manager', 'super admin'];

/**
 * Send notification alerts to assigned employee, their team members, and the project manager (team lead)
 */
const sendTaskAssignmentNotifications = async (task) => {
  try {
    const recipientUserIds = new Set();

    // 1. Assigned Employee
    let assignedEmp = null;
    if (task.assignedTo) {
      assignedEmp = await Employee.findById(task.assignedTo);
      if (assignedEmp) {
        const queryOr = [];
        if (assignedEmp.email) {
          queryOr.push({ email: new RegExp(`^${assignedEmp.email.trim()}$`, 'i') });
        }
        if (assignedEmp._id) {
          queryOr.push({ _id: assignedEmp._id });
        }
        if (assignedEmp.user) {
          queryOr.push({ _id: assignedEmp.user });
        }

        if (queryOr.length > 0) {
          const matchingUsers = await User.find({ $or: queryOr });
          matchingUsers.forEach((u) => recipientUserIds.add(String(u._id)));
        }
      }
    }

    // 2. Team & Team Members
    let teamObj = null;
    if (assignedEmp && assignedEmp.team) {
      teamObj = await Team.findById(assignedEmp.team);
      const teamMates = await Employee.find({ team: assignedEmp.team });
      const emails = teamMates.map((e) => e.email?.toLowerCase()).filter(Boolean);
      if (emails.length > 0) {
        const teamUsers = await User.find({ email: { $in: emails } });
        teamUsers.forEach((u) => recipientUserIds.add(String(u._id)));
      }
    }

    // 3. Project Manager / Team Lead
    let projectObj = null;
    if (task.project) {
      projectObj = await Project.findById(task.project).populate('manager');
      if (projectObj && projectObj.manager && projectObj.manager.email) {
        const pmUser = await User.findOne({ email: new RegExp(`^${projectObj.manager.email.trim()}$`, 'i') });
        if (pmUser) recipientUserIds.add(String(pmUser._id));
      }
    }

    const deadlineStr = task.deadline
      ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No deadline set';
    const projectName = projectObj ? projectObj.name : 'General Project';
    const teamName = teamObj ? teamObj.teamName : (assignedEmp?.department || 'Team');
    const descriptionText = task.description ? task.description.trim() : 'No description provided';

    const title = `New Task Assigned: ${task.title}`;
    const message = `Project: ${projectName} | Team: ${teamName} | Deadline: ${deadlineStr} | Description: ${descriptionText}`;

    for (const userId of recipientUserIds) {
      await createNotification({
        userId,
        title,
        message,
        type: 'task_assigned',
        entityType: 'Task',
        entityId: task._id,
        icon: 'check-square'
      });
    }
  } catch (err) {
    console.error('Error sending task assignment notifications:', err.message);
  }
};

/**
 * Check whether a user is allowed to edit or complete a specific task
 */
const verifyTaskAccess = async (task, user) => {
  if (!user) return;
  const userRole = normalizeRole(user.role || '');
  if (MANAGEMENT_ROLES.includes(userRole)) return; // Admin/Founder/Manager always allowed

  const userIdStr = String(user._id || user.id);
  const emp = await Employee.findOne({ email: (user.email || '').toLowerCase() });
  const empIdStr = emp ? String(emp._id) : null;

  let isAssigned = empIdStr && task.assignedTo && String(task.assignedTo) === empIdStr;
  let isCreator = task.assignedBy && String(task.assignedBy) === userIdStr;

  let isProjectManager = false;
  if (task.project) {
    const proj = await Project.findById(task.project);
    if (proj && proj.manager && empIdStr && String(proj.manager) === empIdStr) {
      isProjectManager = true;
    }
  }

  if (!isAssigned && !isCreator && !isProjectManager) {
    throw new AppError('Forbidden: Only the assigned team member or project lead can view/update this task', 403);
  }
};

const createTask = async (data, userId) => {
  const task = await Task.create({
    ...data,
    assignedBy: userId
  });

  await logActivity({
    userId,
    action: 'Assigned Task',
    entity: 'Task',
    entityId: task._id,
    entityName: task.title
  });

  // Broadcast assignment notification alerts to team & members
  await sendTaskAssignmentNotifications(task);

  return task;
};

const listTasks = async (filter = {}, user = null) => {
  let query = { ...filter };

  if (user) {
    const userRole = normalizeRole(user.role || '');
    if (!MANAGEMENT_ROLES.includes(userRole)) {
      const emp = await Employee.findOne({ email: (user.email || '').toLowerCase() });
      const empId = emp ? emp._id : null;
      const managedProjects = emp ? await Project.find({ manager: emp._id }).select('_id') : [];
      const managedProjectIds = managedProjects.map((p) => p._id);

      const userScope = {
        $or: [
          { assignedTo: empId },
          { assignedBy: user._id || user.id },
          { project: { $in: managedProjectIds } }
        ]
      };

      if (emp && emp.team) {
        userScope.$or.push({ team: emp.team });
      }

      query = { $and: [query, userScope] };
    }
  }

  return Task.find(query)
    .populate('venture', 'name key')
    .populate('project', 'name')
    .populate('assignedTo', 'name avatar')
    .populate('assignedBy', 'name')
    .sort({ deadline: 1, createdAt: -1 })
    .lean();
};

const getTaskById = async (id, user = null) => {
  const task = await Task.findById(id)
    .populate('venture', 'name key')
    .populate('project', 'name manager')
    .populate('assignedTo', 'name avatar department')
    .populate('assignedBy', 'name avatar')
    .lean();

  if (!task) throw new AppError('Task not found', 404);
  if (user) await verifyTaskAccess(task, user);

  return task;
};

const updateTask = async (id, data, user = null) => {
  const existingTask = await Task.findById(id);
  if (!existingTask) throw new AppError('Task not found', 404);

  if (user) await verifyTaskAccess(existingTask, user);

  const userId = user ? (user._id || user.id) : null;
  const task = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  await logActivity({
    userId,
    action: 'Updated Task',
    entity: 'Task',
    entityId: task._id,
    entityName: task.title
  });

  await sendTaskAssignmentNotifications(task);

  return task;
};

const updateTaskStatus = async (id, status, user = null) => {
  const task = await Task.findById(id);
  if (!task) throw new AppError('Task not found', 404);

  const userId = user ? (user._id || user.id) : null;

  task.status = status;
  if (status === 'Completed') {
    task.progress = 100;
    task.completedDate = new Date();
  }
  await task.save();

  if (status === 'Completed' && task.assignedTo) {
    await recalculatePerformance(task.assignedTo);
  }

  await logActivity({
    userId,
    action: `Marked Task as ${status}`,
    entity: 'Task',
    entityId: task._id,
    entityName: task.title
  });

  await task.populate([
    { path: 'venture', select: 'name key' },
    { path: 'project', select: 'name' },
    { path: 'assignedTo', select: 'name avatar' },
    { path: 'assignedBy', select: 'name' }
  ]);

  return task;
};

const deleteTask = async (id, user = null) => {
  const task = await Task.findById(id);
  if (!task) throw new AppError('Task not found', 404);

  if (user) await verifyTaskAccess(task, user);

  const userId = user ? (user._id || user.id) : null;
  await Task.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'Deleted Task',
    entity: 'Task',
    entityId: task._id,
    entityName: task.title
  });

  return null;
};

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};
