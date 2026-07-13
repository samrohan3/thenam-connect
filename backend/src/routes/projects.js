const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(projectController.getProjects)
    .post(projectController.createProject);

router.route('/:id')
    .get(projectController.getProject)
    .put(projectController.updateProject)
    .delete(projectController.deleteProject);

module.exports = router;
