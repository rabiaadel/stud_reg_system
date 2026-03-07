const express = require('express');
const { query, validationResult } = require('express-validator');
const registrationController = require('../controllers/registrationController');
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

// Get all registrations (Admin)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  query('per_page').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid per_page'),
  query('semester_id').optional().isInt({ min: 1 }).withMessage('Invalid semester ID'),
  query('student_id').optional().isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, authenticate, authorize(['admin']), registrationController.getAllRegistrations);

// Get registrations statistics
router.get('/statistics/summary', authenticate, authorize(['admin']), registrationController.getRegistrationStatistics);

module.exports = router;