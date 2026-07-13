const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(employeeController.getEmployees)
    .post(employeeController.createEmployee);

router.route('/:id')
    .get(employeeController.getEmployee)
    .put(employeeController.updateEmployee)
    .delete(employeeController.deleteEmployee);

module.exports = router;
