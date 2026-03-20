const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const gradeController = require('../controllers/gradeController');
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

// Get student grades
router.get('/student/:studentId', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  query('semester_id').optional().isInt({ min: 1 }).withMessage('Invalid semester ID'),
  query('course_id').optional().isInt({ min: 1 }).withMessage('Invalid course ID'),
], handleValidationErrors, authenticate, gradeController.getStudentGrades);

// Post grade (Admin only)
router.post('/', [
  body('student_registration_id').isInt({ min: 1 }).withMessage('Student registration ID required'),
  body('coursework_score').optional().isDecimal().withMessage('Invalid coursework score'),
  body('midterm_score').optional().isDecimal().withMessage('Invalid midterm score'),
  body('final_exam_score').isDecimal().withMessage('Final exam score required'),
], handleValidationErrors, authenticate, authorize(['admin', 'doctor']), gradeController.postGrade);

// Update grade (Admin only)
router.put('/:gradeId', [
  param('gradeId').isInt({ min: 1 }).withMessage('Invalid grade ID'),
  body('coursework_score').optional().isDecimal().withMessage('Invalid coursework score'),
  body('midterm_score').optional().isDecimal().withMessage('Invalid midterm score'),
  body('final_exam_score').optional().isDecimal().withMessage('Invalid final exam score'),
], handleValidationErrors, authenticate, authorize(['admin', 'doctor']), gradeController.updateGrade);

module.exports = router;
