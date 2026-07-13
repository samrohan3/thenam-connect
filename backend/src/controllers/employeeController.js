const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/apiResponse');
const employeeService = require('../services/employeeService');

const createEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.createEmployee(req.body, req.user.id);
    return created(res, employee, 'Employee created successfully');
});

const getEmployees = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.venture) filter.venture = req.query.venture;
    
    const employees = await employeeService.listEmployees(filter);
    return success(res, employees, 'Employees retrieved successfully');
});

const getEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return success(res, employee, 'Employee retrieved successfully');
});

const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user.id);
    return success(res, employee, 'Employee updated successfully');
});

const deleteEmployee = asyncHandler(async (req, res) => {
    await employeeService.deleteEmployee(req.params.id, req.user.id);
    return success(res, null, 'Employee deleted successfully');
});

module.exports = {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
};
