const express = require('express');
const { query, body, param, validationResult } = require('express-validator');
const academicRulesController = require('../controllers/academicRulesController');
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

// Get academic rules
router.get('/', [
  query('faculty_id').isInt({ min: 1 }).withMessage('Faculty ID required'),
  query('category').optional().isString().withMessage('Invalid category'),
  query('is_active').optional().isBoolean().withMessage('Invalid is_active'),
], handleValidationErrors, authenticate, academicRulesController.getRules);

// Get rule details
router.get('/:ruleId', [
  param('ruleId').isInt({ min: 1 }).withMessage('Invalid rule ID'),
], handleValidationErrors, authenticate, academicRulesController.getRuleDetails);

// Create rule (Admin only)
router.post('/', [
  body('faculty_id').isInt({ min: 1 }).withMessage('Faculty ID required'),
  body('rule_code').isString().isLength({ min: 1, max: 50 }).withMessage('Rule code required'),
  body('category').isString().isLength({ min: 1, max: 100 }).withMessage('Category required'),
  body('title').isString().isLength({ min: 1, max: 255 }).withMessage('Title required'),
  body('rule_data').isObject().withMessage('Rule data must be object'),
], handleValidationErrors, authenticate, authorize(['admin']), academicRulesController.createRule);

// Update rule (Admin only)
router.put('/:ruleId', [
  param('ruleId').isInt({ min: 1 }).withMessage('Invalid rule ID'),
  body('title').optional().isString().withMessage('Invalid title'),
  body('rule_data').optional().isObject().withMessage('Rule data must be object'),
], handleValidationErrors, authenticate, authorize(['admin']), academicRulesController.updateRule);

module.exports = router;