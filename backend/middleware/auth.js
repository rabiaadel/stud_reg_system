const jwt = require('jsonwebtoken');
const winston = require('winston');
const { jwt: jwtConfig } = require('../config/config');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    (req.logger || winston).warn('Missing auth token', { url: req.url });
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided',
    });
  }

  try {
    if (!jwtConfig.secret) {
      throw new Error('JWT secret not configured');
    }
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    (req.logger || winston).error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
