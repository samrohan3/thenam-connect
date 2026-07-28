const Project = require('../models/Project');
const Employee = require('../models/Employee');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const { createNotification } = require('./notificationService');

const sendProjectAssignmentNotifications = async (project) => {
  try {
    const recipientUserIds = new Set();

    // 1. Manager (Team Lead)
    if (project.manager) {
      const pm = await Employee.findById(project.manager);
      if (pm && pm.email) {
        const u = await User.findOne({ email: pm.email.toLowerCase() });
        if (u) recipientUserIds.add(String(u._id));
      }
    }

    // 2. Members
    if (project.members && project.members.length > 0) {
      const emps = await Employee.find({ _id: { $in: project.members } });
      const emails = emps.map((e) => e.email?.toLowerCase()).filter(Boolean);
      if (emails.length > 0) {
        const memberUsers = await User.find({ email: { $in: emails } });
        memberUsers.forEach((u) => recipientUserIds.add(String(u._id)));
      }
    }

    const deadlineStr = project.deadline
      ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No deadline set';
    const descriptionText = project.description ? project.description.trim() : 'No description provided';

    const title = `New Project Assigned: ${project.name}`;
    const message = `Status: ${project.status || 'Planning'} | Deadline: ${deadlineStr} | Description: ${descriptionText}`;

    for (const userId of recipientUserIds) {
      await createNotification({
        userId,
        title,
        message,
        type: 'project_created',
        entityType: 'Project',
        entityId: project._id,
        icon: 'folder'
      });
    }
  } catch (err) {
    console.error('Error sending project assignment notifications:', err.message);
  }
};

const createProject = async (data, userId) => {
  const project = await Project.create({
    ...data,
    createdBy: userId
  });

  await logActivity({
    userId,
    action: 'Created Project',
    entity: 'Project',
    entityId: project._id,
    entityName: project.name
  });

  await sendProjectAssignmentNotifications(project);

  return project;
};

const listProjects = async (filter = {}) => {
  return Project.find(filter)
    .populate('venture', 'name key')
    .populate('manager', 'name avatar')
    .populate('members', 'name avatar')
    .populate('taskCount')
    .sort({ createdAt: -1 })
    .lean();
};

const getProjectById = async (id) => {
  const project = await Project.findById(id)
    .populate('venture', 'name key')
    .populate('manager', 'name avatar')
    .populate('members', 'name avatar department')
    .populate('tasks')
    .populate('taskCount')
    .lean();

  if (!project) throw new AppError('Project not found', 404);
  return project;
};

const updateProject = async (id, data, userId) => {
  const project = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('venture', 'name key')
    .populate('manager', 'name avatar')
    .populate('members', 'name avatar')
    .populate('taskCount');
  if (!project) throw new AppError('Project not found', 404);

  await logActivity({
    userId,
    action: 'Updated Project',
    entity: 'Project',
    entityId: project._id,
    entityName: project.name
  });

  return project;
};

const deleteProject = async (id, userId) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError('Project not found', 404);

  await Project.findByIdAndDelete(id);

  await logActivity({
    userId,
    action: 'Deleted Project',
    entity: 'Project',
    entityId: project._id,
    entityName: project.name
  });

  return null;
};

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject
};
