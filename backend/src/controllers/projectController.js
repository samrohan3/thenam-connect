const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const projectService = require('../services/projectService');

const createProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.body, req.user.id);
    return created(res, project, 'Project created successfully');
});

const getProjects = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.venture) filter.venture = req.query.venture;
    
    const projects = await projectService.listProjects(filter);
    return success(res, projects, 'Projects retrieved successfully');
});

const getProject = asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById(req.params.id);
    return success(res, project, 'Project retrieved successfully');
});

const updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject(req.params.id, req.body, req.user.id);
    return success(res, project, 'Project updated successfully');
});

const deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject(req.params.id, req.user.id);
    return success(res, null, 'Project deleted successfully');
});

module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
};
