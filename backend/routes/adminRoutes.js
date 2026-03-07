const express = require('express');
const { query, body, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Admin must be authenticated and authorized
router.use(authenticate, authorize(['admin']));

// System statistics
router.get('/statistics/dashboard', adminController.getDashboardStatistics);

// Audit logs
router.get('/audit-logs', [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  query('from_date').optional().isISO8601().withMessage('Invalid from_date'),
  query('to_date').optional().isISO8601().withMessage('Invalid to_date'),
], handleValidationErrors, adminController.getAuditLogs);

// Recalculate all GPA
router.post('/recalculate-all-gpa', adminController.recalculateAllGPA);

// Send notifications
router.post('/send-notifications', [
  body('recipient_type').isIn(['all', 'faculty', 'student']).withMessage('Invalid recipient type'),
  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title required'),
  body('message').isString().isLength({ min: 1 }).withMessage('Message required'),
], handleValidationErrors, adminController.sendNotifications);

module.exports = router;