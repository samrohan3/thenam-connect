const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect, canAccess } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(canAccess('team', 'read'), employeeController.getEmployees)
  .post(canAccess('team', 'create'), employeeController.createEmployee);

router.patch('/:id/status', canAccess('team', 'update'), employeeController.updateEmployeeStatus);

router.route('/:id')
  .get(canAccess('team', 'read'), employeeController.getEmployee)
  .put(canAccess('team', 'update'), employeeController.updateEmployee)
  .delete(canAccess('team', 'delete'), employeeController.deleteEmployee);

module.exports = router;
