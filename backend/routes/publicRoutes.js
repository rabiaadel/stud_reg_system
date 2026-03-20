const express = require('express');
const { query, validationResult } = require('express-validator');
const publicController = require('../controllers/publicController');

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

router.get('/faculties', publicController.getFaculties);

router.get('/departments', [
  query('faculty_id').isInt({ min: 1 }).withMessage('faculty_id is required'),
], handleValidationErrors, publicController.getDepartments);

router.get('/specializations', [
  query('department_id').isInt({ min: 1 }).withMessage('department_id is required'),
], handleValidationErrors, publicController.getSpecializations);

module.exports = router;
