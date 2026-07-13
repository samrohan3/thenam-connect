const Joi = require('joi');

const createVentureSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  key: Joi.string().trim().lowercase().alphanum().min(2).max(50).required(),
  tagline: Joi.string().trim().max(200).optional().allow(''),
  description: Joi.string().trim().max(1000).optional().allow(''),
  status: Joi.string().valid('active', 'archived', 'inactive').default('active'),
  industry: Joi.string().trim().max(100).optional().allow(''),
  website: Joi.string().trim().uri({ allowRelative: false }).optional().allow(''),
  phone: Joi.string().trim().max(20).optional().allow(''),
  email: Joi.string().trim().email().optional().allow(''),
  address: Joi.string().trim().max(300).optional().allow(''),
  gradient: Joi.string().trim().optional().allow(''),
  colorTheme: Joi.string().trim().optional().allow(''),
  owner: Joi.string().hex().length(24).optional().allow('', null)
});

const updateVentureSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  tagline: Joi.string().trim().max(200).optional().allow(''),
  description: Joi.string().trim().max(1000).optional().allow(''),
  status: Joi.string().valid('active', 'archived', 'inactive').optional(),
  industry: Joi.string().trim().max(100).optional().allow(''),
  website: Joi.string().trim().uri({ allowRelative: false }).optional().allow(''),
  phone: Joi.string().trim().max(20).optional().allow(''),
  email: Joi.string().trim().email().optional().allow(''),
  address: Joi.string().trim().max(300).optional().allow(''),
  gradient: Joi.string().trim().optional().allow(''),
  colorTheme: Joi.string().trim().optional().allow(''),
  owner: Joi.string().hex().length(24).optional().allow('', null)
});

module.exports = { createVentureSchema, updateVentureSchema };
