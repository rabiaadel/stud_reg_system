// ============================================================================
// API Response Formatter — Standardized response shape for all endpoints
// Format: { success, data, message, errors, metadata }
// ============================================================================

/**
 * Success response shape
 * @param {*} data - Response payload
 * @param {string} message - Optional message
 * @param {Object} metadata - Optional metadata (pagination, counts, etc.)
 * @returns {Object}
 */
function success(data, message = 'Success', metadata = null) {
  return {
    success: true,
    data,
    message,
    ...(metadata && { metadata })
  };
}

/**
 * Error response shape
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array|Object} errors - Field-level errors or details
 * @returns {Object}
 */
function error(message, statusCode = 400, errors = null) {
  return {
    success: false,
    data: null,
    message,
    statusCode,
    ...(errors && { errors })
  };
}

/**
 * Validation errors (400)
 * @param {Object|Array} fieldErrors - { field: 'error message' }
 * @param {string} message
 * @returns {Object}
 */
function validation(fieldErrors, message = 'Validation failed') {
  return error(message, 400, fieldErrors);
}

/**
 * Unauthorized (401)
 * @param {string} message
 * @returns {Object}
 */
function unauthorized(message = 'Unauthorized') {
  return error(message, 401);
}

/**
 * Forbidden (403)
 * @param {string} message
 * @returns {Object}
 */
function forbidden(message = 'Access denied') {
  return error(message, 403);
}

/**
 * Not found (404)
 * @param {string} resource
 * @returns {Object}
 */
function notFound(resource = 'Resource') {
  return error(`${resource} not found`, 404);
}

/**
 * Conflict (409) - duplicate, state conflict
 * @param {string} message
 * @returns {Object}
 */
function conflict(message = 'Resource already exists') {
  return error(message, 409);
}

/**
 * Server error (500)
 * @param {string} message
 * @param {Error} err - Optional original error for logging
 * @returns {Object}
 */
function serverError(message = 'Internal server error', err = null) {
  if (err && process.env.NODE_ENV === 'development') {
    console.error('Server Error:', err);
  }
  return error(message, 500);
}

/**
 * Pagination metadata object
 * @param {number} page
 * @param {number} pageSize
 * @param {number} total
 * @returns {Object} { page, pageSize, total, pages }
 */
function pagination(page, pageSize, total) {
  return {
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
    hasMore: page < Math.ceil(total / pageSize)
  };
}

/**
 * Express middleware to attach response helpers to res
 * Usage: app.use(apiResponseMiddleware())
 * Then in controller: res.sendSuccess(data), res.sendError(msg)
 */
function middleware() {
  return (req, res, next) => {
    res.sendSuccess = (data, message = 'Success', metadata = null) => {
      return res.json(success(data, message, metadata));
    };

    res.sendError = (message, statusCode = 400, errors = null) => {
      return res.status(statusCode).json(error(message, statusCode, errors));
    };

    res.sendValidation = (fieldErrors, message = 'Validation failed') => {
      return res.status(400).json(validation(fieldErrors, message));
    };

    res.sendUnauthorized = (message = 'Unauthorized') => {
      return res.status(401).json(unauthorized(message));
    };

    res.sendForbidden = (message = 'Access denied') => {
      return res.status(403).json(forbidden(message));
    };

    res.sendNotFound = (resource = 'Resource') => {
      return res.status(404).json(notFound(resource));
    };

    res.sendConflict = (message = 'Resource already exists') => {
      return res.status(409).json(conflict(message));
    };

    res.sendServerError = (message = 'Internal server error', err = null) => {
      return res.status(500).json(serverError(message, err));
    };

    next();
  };
}

/**
 * Try-catch wrapper for async route handlers
 * Automatically sends error response on exception
 * 
 * Usage: app.get('/route', tryCatch(async (req, res) => { ... }))
 */
function tryCatch(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error('Route Error:', err);
      return res.status(err.statusCode || 500).json(
        serverError(err.message, err)
      );
    }
  };
}

module.exports = {
  success,
  error,
  validation,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  pagination,
  middleware,
  tryCatch
};
