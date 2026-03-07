const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const studentController = require('../controllers/studentController');
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

// Get student profile
router.get('/:studentId', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, authenticate, studentController.getStudentProfile);

// Update student profile
router.put('/:studentId', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('first_name_en').optional().isLength({ min: 1, max: 100 }).withMessage('First name must be 1-100 characters'),
  body('last_name_en').optional().isLength({ min: 1, max: 100 }).withMessage('Last name must be 1-100 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().isLength({ min: 10, max: 20 }).withMessage('Phone must be 10-20 characters'),
], handleValidationErrors, authenticate, studentController.updateStudentProfile);

// Check registration eligibility
router.get('/:studentId/eligibility', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  query('semester_id').optional().isInt({ min: 1 }).withMessage('Invalid semester ID'),
], handleValidationErrors, authenticate, studentController.checkEligibility);

// Get planned schedule
router.get('/:studentId/planned-schedule', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  query('semester_id').optional().isInt({ min: 1 }).withMessage('Invalid semester ID'),
], handleValidationErrors, authenticate, studentController.getPlannedSchedule);

// Register for courses
router.post('/:studentId/register', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('course_ids').isArray({ min: 1 }).withMessage('At least one course ID required'),
  body('course_ids.*').isInt({ min: 1 }).withMessage('Invalid course ID'),
  body('semester_id').isInt({ min: 1 }).withMessage('Semester ID is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
], handleValidationErrors, authenticate, studentController.registerCourses);

// Withdraw from course
router.post('/:studentId/withdraw', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('course_id').isInt({ min: 1 }).withMessage('Course ID is required'),
  body('semester_id').isInt({ min: 1 }).withMessage('Semester ID is required'),
  body('reason').isLength({ min: 1, max: 255 }).withMessage('Reason is required and must be less than 255 characters'),
  body('is_excused').optional().isBoolean().withMessage('Is excused must be boolean'),
], handleValidationErrors, authenticate, studentController.withdrawCourse);

// Get student grades
router.get('/:studentId/grades', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  query('semester_id').optional().isInt({ min: 1 }).withMessage('Invalid semester ID'),
  query('course_id').optional().isInt({ min: 1 }).withMessage('Invalid course ID'),
  query('include_history').optional().isBoolean().withMessage('Include history must be boolean'),
], handleValidationErrors, authenticate, studentController.getStudentGrades);

// Get academic standing
router.get('/:studentId/academic-standing', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, authenticate, studentController.getAcademicStanding);

// Get academic standing history
router.get('/:studentId/standing-history', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  query('from_semester_id').optional().isInt({ min: 1 }).withMessage('Invalid from semester ID'),
  query('to_semester_id').optional().isInt({ min: 1 }).withMessage('Invalid to semester ID'),
], handleValidationErrors, authenticate, studentController.getStandingHistory);

// Get graduation eligibility
router.get('/:studentId/graduation-eligibility', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, authenticate, studentController.getGraduationEligibility);

// Get progress tracking
router.get('/:studentId/progress', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
], handleValidationErrors, authenticate, studentController.getProgressTracking);

// Admin routes (require admin authorization)
router.post('/:studentId/issue-warning', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('semester_id').isInt({ min: 1 }).withMessage('Semester ID is required'),
  body('reason').isLength({ min: 1, max: 255 }).withMessage('Reason is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
], handleValidationErrors, authenticate, authorize(['admin']), studentController.issueWarning);

router.post('/:studentId/dismiss', [
  param('studentId').isInt({ min: 1 }).withMessage('Invalid student ID'),
  body('reason').isLength({ min: 1, max: 255 }).withMessage('Reason is required'),
  body('dismissal_type').isIn(['Academic', 'Administrative']).withMessage('Invalid dismissal type'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
], handleValidationErrors, authenticate, authorize(['admin']), studentController.dismissStudent);

module.exports = router;