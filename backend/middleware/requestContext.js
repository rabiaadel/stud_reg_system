const { v4: uuidv4 } = require('uuid');
const { logger } = require('../config/logger');

const requestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Attach a per-request logger with request metadata
  req.logger = logger.child({
    requestId,
    url: req.url,
    method: req.method,
  });

  next();
};

module.exports = { requestContext };
