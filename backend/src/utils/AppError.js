/**
 * Custom operational error class.
 * Controllers throw AppError instead of generic Error so the global
 * error handler can distinguish operational from programming errors.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
