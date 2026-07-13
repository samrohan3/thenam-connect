const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const taskService = require('../services/taskService');

const createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.body, req.user.id);
    return created(res, task, 'Task created successfully');
});

const getTasks = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.venture) filter.venture = req.query.venture;
    if (req.query.project) filter.project = req.query.project;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    
    const tasks = await taskService.listTasks(filter);
    return success(res, tasks, 'Tasks retrieved successfully');
});

const getTask = asyncHandler(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    return success(res, task, 'Task retrieved successfully');
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    return success(res, task, 'Task updated successfully');
});

const updateTaskStatus = asyncHandler(async (req, res) => {
    const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user.id);
    return success(res, task, 'Task status updated successfully');
});

const deleteTask = asyncHandler(async (req, res) => {
    await taskService.deleteTask(req.params.id, req.user.id);
    return success(res, null, 'Task deleted successfully');
});

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    updateTaskStatus,
    deleteTask
};
