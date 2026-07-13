const Task = require('../models/Task');
const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');
const { recalculatePerformance } = require('./employeeService');

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

    return task;
};

const listTasks = async (filter = {}) => {
    return Task.find(filter)
        .populate('venture', 'name key')
        .populate('project', 'name')
        .populate('assignedTo', 'name avatar')
        .populate('assignedBy', 'name')
        .sort({ deadline: 1, createdAt: -1 })
        .lean();
};

const getTaskById = async (id) => {
    const task = await Task.findById(id)
        .populate('venture', 'name key')
        .populate('project', 'name')
        .populate('assignedTo', 'name avatar department')
        .populate('assignedBy', 'name avatar')
        .lean();
    if (!task) throw new AppError('Task not found', 404);
    return task;
};

const updateTask = async (id, data, userId) => {
    const task = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!task) throw new AppError('Task not found', 404);

    await logActivity({
        userId,
        action: 'Updated Task',
        entity: 'Task',
        entityId: task._id,
        entityName: task.title
    });

    return task;
};

const updateTaskStatus = async (id, status, userId) => {
    const task = await Task.findById(id);
    if (!task) throw new AppError('Task not found', 404);

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

    return task;
};

const deleteTask = async (id, userId) => {
    const task = await Task.findById(id);
    if (!task) throw new AppError('Task not found', 404);

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
