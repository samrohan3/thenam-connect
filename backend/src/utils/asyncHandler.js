/**
 * asyncHandler — wraps async route handlers to eliminate try/catch boilerplate.
 * Any thrown error is forwarded to Express's global error handler via next(error).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
