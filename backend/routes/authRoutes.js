const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

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

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password is required'),
  ],
  handleValidationErrors,
  authController.login
);

router.post(
  '/register',
  [
    body('role').isIn(['student', 'doctor']).withMessage('Role must be student or doctor'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('first_name_en').isLength({ min: 1, max: 100 }).withMessage('First name is required'),
    body('last_name_en').isLength({ min: 1, max: 100 }).withMessage('Last name is required'),
    body('faculty_id').isInt({ min: 1 }).withMessage('Faculty is required'),
    body('national_id').isLength({ min: 10, max: 20 }).withMessage('National ID is required'),
    body('student_id').custom((value, { req }) => {
      if (req.body.role === 'student' && (!value || String(value).trim().length === 0)) {
        throw new Error('Student ID is required for students');
      }
      return true;
    }),
    body('specialization_id').custom((value, { req }) => {
      if (req.body.role === 'student' && !value) {
        throw new Error('Specialization is required for students');
      }
      return true;
    }),
    body('admission_type').custom((value, { req }) => {
      if (req.body.role === 'student' && (!value || String(value).trim().length === 0)) {
        throw new Error('Admission type is required for students');
      }
      return true;
    }),
    body('employee_id').custom((value, { req }) => {
      if (req.body.role === 'doctor' && (!value || String(value).trim().length === 0)) {
        throw new Error('Employee ID is required for doctors');
      }
      return true;
    }),
    body('title').custom((value, { req }) => {
      if (req.body.role === 'doctor' && (!value || String(value).trim().length === 0)) {
        throw new Error('Title is required for doctors');
      }
      return true;
    }),
    body('department_id').custom((value, { req }) => {
      if (req.body.role === 'doctor' && !value) {
        throw new Error('Department is required for doctors');
      }
      return true;
    }),
  ],
  handleValidationErrors,
  authController.register
);

router.get('/me', authenticate, authController.me);

module.exports = router;
