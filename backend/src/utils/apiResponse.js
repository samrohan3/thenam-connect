/**
 * Send a standardized success response.
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send a standardized error response.
 */
const sendError = (res, message = 'An error occurred', errors = null, statusCode = 400) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated success response.
 */
const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
