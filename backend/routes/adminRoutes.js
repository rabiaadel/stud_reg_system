const express = require('express');
const { query, body, param, validationResult } = require('express-validator');
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

// Account requests (approvals)
router.get('/account-requests', [
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('role').optional().isIn(['student', 'doctor']).withMessage('Invalid role'),
  query('faculty_id').optional().isInt({ min: 1 }).withMessage('Invalid faculty_id'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Invalid search'),
], handleValidationErrors, adminController.getAccountRequests);

router.post('/account-requests/:requestId/approve', [
  param('requestId').isInt({ min: 1 }).withMessage('Invalid request id'),
  body('eligibility_status').optional().isIn(['pending', 'verified', 'failed']).withMessage('Invalid eligibility_status'),
  body('eligibility_notes').optional().isLength({ max: 500 }).withMessage('Eligibility notes too long'),
], handleValidationErrors, adminController.approveAccountRequest);

router.post('/account-requests/:requestId/reject', [
  param('requestId').isInt({ min: 1 }).withMessage('Invalid request id'),
  body('reason').optional().isLength({ min: 1, max: 255 }).withMessage('Invalid reason'),
  body('eligibility_status').optional().isIn(['pending', 'verified', 'failed']).withMessage('Invalid eligibility_status'),
  body('eligibility_notes').optional().isLength({ max: 500 }).withMessage('Eligibility notes too long'),
], handleValidationErrors, adminController.rejectAccountRequest);

// Recalculate all GPA
router.post('/recalculate-all-gpa', adminController.recalculateAllGPA);
router.post('/recalculate-student/:studentId', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student id'),
], handleValidationErrors, adminController.recalculateStudent);

// Send notifications
router.post('/send-notifications', [
  body('recipient_type').isIn(['all', 'faculty', 'student']).withMessage('Invalid recipient type'),
  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title required'),
  body('message').isString().isLength({ min: 1 }).withMessage('Message required'),
], handleValidationErrors, adminController.sendNotifications);

module.exports = router;
