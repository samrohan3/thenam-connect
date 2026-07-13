/**
 * Standard API response helpers.
 * Every endpoint uses these to ensure consistent shape:
 *   { success, message, data, pagination? }
 */

const success = (res, data = {}, message = 'Success', statusCode = 200, meta = {}) => {
  const body = { success: true, message, data };
  if (meta && Object.keys(meta).length) body.pagination = meta;
  return res.status(statusCode).json(body);
};

const created = (res, data = {}, message = 'Created successfully') =>
  success(res, data, message, 201);

const error = (res, message = 'An error occurred', statusCode = 500, errors = []) => {
  const body = { success: false, message };
  if (errors.length) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { success, created, error };
