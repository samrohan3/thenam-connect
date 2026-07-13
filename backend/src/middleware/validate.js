const Joi = require('joi');

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Usage: router.post('/path', validate(myJoiSchema), controller)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    return next();
  };
};

/**
 * Validate req.query against a schema
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }

    req.query = value;
    return next();
  };
};

module.exports = { validate, validateQuery };
