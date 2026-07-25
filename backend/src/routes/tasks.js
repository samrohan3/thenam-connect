const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(canAccess('tasks', 'read'), taskController.getTasks)
    .post(canAccess('tasks', 'create'), taskController.createTask);

router.route('/:id')
    .get(canAccess('tasks', 'read'), taskController.getTask)
    .put(canAccess('tasks', 'update'), taskController.updateTask)
    .delete(canAccess('tasks', 'delete'), taskController.deleteTask);

module.exports = router;
