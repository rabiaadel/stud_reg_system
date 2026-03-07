const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const courseController = require('../controllers/courseController');

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

// List available courses
router.get('/', [
  query('faculty_id').isInt({ min: 1 }).withMessage('Faculty ID is required'),
  query('specialization_id').optional().isInt({ min: 1 }).withMessage('Invalid specialization ID'),
  query('level').optional().isInt({ min: 1, max: 4 }).withMessage('Level must be 1-4'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
  query('per_page').optional().isInt({ min: 1, max: 100 }).withMessage('Per page must be 1-100'),
], handleValidationErrors, courseController.getCourses);

// Get course details
router.get('/:courseId', [
  param('courseId').isInt({ min: 1 }).withMessage('Invalid course ID'),
], handleValidationErrors, courseController.getCourseDetails);

// Check prerequisites
router.get('/:courseId/prerequisites', [
  param('courseId').isInt({ min: 1 }).withMessage('Invalid course ID'),
  query('student_id').optional().isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, courseController.checkPrerequisites);

module.exports = router;