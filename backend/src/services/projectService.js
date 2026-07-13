const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

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
    const project = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
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
