const Joi = require('joi');

const createEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().lowercase().required(),
  phone: Joi.string().trim().max(20).optional().allow(''),
  department: Joi.string().trim().max(100).required(),
  role: Joi.string().trim().max(100).required(),
  salary: Joi.number().min(0).default(0),
  joiningDate: Joi.date().iso().optional(),
  status: Joi.string().valid('Active', 'Inactive', 'On leave', 'Terminated').default('Active'),
  venture: Joi.string().hex().length(24).required(),
  reportingManager: Joi.string().hex().length(24).optional().allow('', null),
  address: Joi.object({
    street: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().optional().allow(''),
    state: Joi.string().trim().optional().allow(''),
    pincode: Joi.string().trim().optional().allow('')
  }).optional()
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().max(20).optional().allow(''),
  department: Joi.string().trim().max(100).optional(),
  role: Joi.string().trim().max(100).optional(),
  salary: Joi.number().min(0).optional(),
  joiningDate: Joi.date().iso().optional(),
  status: Joi.string().valid('Active', 'Inactive', 'On leave', 'Terminated').optional(),
  venture: Joi.string().hex().length(24).optional(),
  reportingManager: Joi.string().hex().length(24).optional().allow('', null),
  address: Joi.object({
    street: Joi.string().trim().optional().allow(''),
    city: Joi.string().trim().optional().allow(''),
    state: Joi.string().trim().optional().allow(''),
    pincode: Joi.string().trim().optional().allow('')
  }).optional()
});

module.exports = { createEmployeeSchema, updateEmployeeSchema };
