const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const { logActivity } = require('./activityService');

const createEmployee = async (data, userId) => {
    const existing = await Employee.findOne({ email: data.email.toLowerCase() });
    if (existing) {
        throw new AppError('Employee with this email already exists', 400);
    }

    const employee = await Employee.create({
        ...data,
        email: data.email.toLowerCase(),
        createdBy: userId
    });

    await logActivity({
        userId,
        action: 'Added Employee',
        entity: 'Employee',
        entityId: employee._id,
        entityName: employee.name
    });

    return employee;
};

const listEmployees = async (filter = {}) => {
    return Employee.find(filter)
        .populate('venture', 'name key')
        .populate('reportingManager', 'name')
        .populate('taskCount')
        .sort({ joiningDate: -1 })
        .lean();
};

const getEmployeeById = async (id) => {
    const emp = await Employee.findById(id)
        .populate('venture', 'name key gradient')
        .populate('reportingManager', 'name email')
        .populate('projects', 'name status')
        .populate('taskCount')
        .lean();
    if (!emp) throw new AppError('Employee not found', 404);
    return emp;
};

const updateEmployee = async (id, data, userId) => {
    const emp = await Employee.findById(id);
    if (!emp) throw new AppError('Employee not found', 404);

    if (data.email && data.email.toLowerCase() !== emp.email) {
        const existing = await Employee.findOne({ email: data.email.toLowerCase() });
        if (existing) throw new AppError('Employee with this email already exists', 400);
        data.email = data.email.toLowerCase();
    }

    const updated = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });

    await logActivity({
        userId,
        action: 'Updated Employee',
        entity: 'Employee',
        entityId: updated._id,
        entityName: updated.name
    });

    return updated;
};

const deleteEmployee = async (id, userId) => {
    const emp = await Employee.findById(id);
    if (!emp) throw new AppError('Employee not found', 404);

    await Employee.findByIdAndDelete(id);

    await logActivity({
        userId,
        action: 'Deleted Employee',
        entity: 'Employee',
        entityId: emp._id,
        entityName: emp.name
    });
    return null;
};

const recalculatePerformance = async (employeeId) => {
    // In a real system, count completed tasks vs total assigned tasks, attendance, etc.
    // For now, a placeholder function that could be called when a task is completed.
    const emp = await Employee.findById(employeeId);
    if (!emp) return;
    
    // Fake logic for demonstration: 
    // real logic would aggregate from Tasks collection where assignedTo = employeeId
    emp.performance.rating = Math.min(100, emp.performance.rating + 1);
    await emp.save();
};

module.exports = {
    createEmployee,
    listEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    recalculatePerformance
};
