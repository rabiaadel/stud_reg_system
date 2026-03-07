const express = require('express');
const { param, query, validationResult } = require('express-validator');
const semesterController = require('../controllers/semesterController');
const { authenticate } = require('../middleware/auth');

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

// Get all semesters
router.get('/', [
  query('faculty_id').isInt({ min: 1 }).withMessage('Faculty ID required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
], handleValidationErrors, authenticate, semesterController.getSemesters);

// Get active semester
router.get('/active', [
  query('faculty_id').isInt({ min: 1 }).withMessage('Faculty ID required'),
], handleValidationErrors, authenticate, semesterController.getActiveSemester);

// Get semester details
router.get('/:semesterId', [
  param('semesterId').isInt({ min: 1 }).withMessage('Invalid semester ID'),
], handleValidationErrors, authenticate, semesterController.getSemesterDetails);

// Get semester deadlines
router.get('/:semesterId/deadlines', [
  param('semesterId').isInt({ min: 1 }).withMessage('Invalid semester ID'),
], handleValidationErrors, authenticate, semesterController.getSemesterDeadlines);

module.exports = router;