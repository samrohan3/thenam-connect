const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(canAccess('projects', 'read'), projectController.getProjects)
    .post(canAccess('projects', 'create'), projectController.createProject);

router.route('/:id')
    .get(canAccess('projects', 'read'), projectController.getProject)
    .put(canAccess('projects', 'update'), projectController.updateProject)
    .delete(canAccess('projects', 'delete'), projectController.deleteProject);

module.exports = router;
