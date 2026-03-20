const express = require('express');
const router = express.Router();
const StudentSubjectModificationService = require('../services/studentSubjectModificationService');
const AdminEligibilityService = require('../services/adminEligibilityService');
const { authenticate, authorize } = require('../middleware/auth');
const winston = require('winston');

const modificationService = new StudentSubjectModificationService();
const eligibilityService = new AdminEligibilityService();

// All admin management routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/admin/manage/modifications
 * Create a student subject modification request
 */
router.post('/modifications', authorize(['admin']), async (req, res) => {
  try {
    const modificationData = {
      ...req.body,
      admin_id: req.user.id
    };

    const modification = await modificationService.createModificationRequest(modificationData);

    res.status(201).json({
      success: true,
      message: 'Modification request created',
      data: modification
    });
  } catch (error) {
    winston.error('Error creating modification:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error creating modification'
    });
  }
});

/**
 * GET /api/v1/admin/manage/modifications/pending
 * Get all pending modifications for review
 */
router.get('/modifications/pending', authorize(['admin']), async (req, res) => {
  try {
    const filter = {
      semester_id: req.query.semester_id,
      action_type: req.query.action_type
    };

    const modifications = await modificationService.getPendingModifications(filter);

    res.json({
      success: true,
      count: modifications.length,
      data: modifications
    });
  } catch (error) {
    winston.error('Error getting pending modifications:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching modifications'
    });
  }
});

/**
 * GET /api/v1/admin/manage/modifications/:studentId
 * Get modification history for a student
 */
router.get('/modifications/:studentId', authorize(['admin']), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const filter = {
      status: req.query.status,
      semester_id: req.query.semester_id
    };

    const modifications = await modificationService.getStudentModificationHistory(studentId, filter);

    res.json({
      success: true,
      count: modifications.length,
      data: modifications
    });
  } catch (error) {
    winston.error('Error getting modification history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching modification history'
    });
  }
});

/**
 * PUT /api/v1/admin/manage/modifications/:modificationId/review
 * Review and approve/reject modification
 */
router.put('/modifications/:modificationId/review', authorize(['admin']), async (req, res) => {
  try {
    const modificationId = req.params.modificationId;
    const { decision, reviewer_notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid decision. Must be APPROVED or REJECTED'
      });
    }

    const modification = await modificationService.reviewModification(
      modificationId,
      decision,
      reviewer_notes,
      req.user.id
    );

    res.json({
      success: true,
      message: `Modification ${decision.toLowerCase()} successfully`,
      data: modification
    });
  } catch (error) {
    winston.error('Error reviewing modification:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error reviewing modification'
    });
  }
});

/**
 * POST /api/v1/admin/manage/bulk-modify
 * Bulk modify students in a course
 */
router.post('/bulk-modify', authorize(['admin']), async (req, res) => {
  try {
    const { course_id, semester_id, action, target_course_id } = req.body;

    const result = await modificationService.bulkModifyStudents(
      course_id,
      semester_id,
      action,
      target_course_id,
      req.user.id
    );

    res.json({
      success: true,
      message: `Bulk modification completed. ${result.total} students affected`,
      data: result
    });
  } catch (error) {
    winston.error('Error in bulk modification:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error in bulk modification'
    });
  }
});

/**
 * POST /api/v1/admin/manage/eligibility/rules
 * Create/Update eligibility rule
 */
router.post('/eligibility/rules', authorize(['admin']), async (req, res) => {
  try {
    const ruleData = {
      ...req.body,
      admin_id: req.user.id
    };

    const rule = await eligibilityService.createEligibilityRule(ruleData);

    res.status(201).json({
      success: true,
      message: 'Eligibility rule saved successfully',
      data: rule
    });
  } catch (error) {
    winston.error('Error creating eligibility rule:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error saving eligibility rule'
    });
  }
});

/**
 * GET /api/v1/admin/manage/eligibility/rules
 * Get eligibility rules
 */
router.get('/eligibility/rules', authorize(['admin']), async (req, res) => {
  try {
    const facultyId = req.query.faculty_id || req.user.faculty_id;
    const filter = {
      rule_type: req.query.rule_type,
      is_active: req.query.is_active !== 'false'
    };

    const rules = await eligibilityService.getEligibilityRules(facultyId, filter);

    res.json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    winston.error('Error getting eligibility rules:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching rules'
    });
  }
});

/**
 * POST /api/v1/admin/manage/eligibility/exceptions
 * Grant eligibility exception to student
 */
router.post('/eligibility/exceptions', authorize(['admin']), async (req, res) => {
  try {
    const exceptionData = {
      ...req.body,
      admin_id: req.user.id
    };

    const exception = await eligibilityService.grantException(exceptionData);

    res.status(201).json({
      success: true,
      message: 'Exception granted successfully',
      data: exception
    });
  } catch (error) {
    winston.error('Error granting exception:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error granting exception'
    });
  }
});

/**
 * GET /api/v1/admin/manage/eligibility/exceptions/:studentId
 * Get exceptions for a student
 */
router.get('/eligibility/exceptions/:studentId', authorize(['admin']), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const exceptions = await eligibilityService.getStudentExceptions(studentId);

    res.json({
      success: true,
      count: exceptions.length,
      data: exceptions
    });
  } catch (error) {
    winston.error('Error getting exceptions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching exceptions'
    });
  }
});

/**
 * PUT /api/v1/admin/manage/eligibility/exceptions/:exceptionId/revoke
 * Revoke eligibility exception
 */
router.put('/eligibility/exceptions/:exceptionId/revoke', authorize(['admin']), async (req, res) => {
  try {
    const exceptionId = req.params.exceptionId;
    const { reason } = req.body;

    const exception = await eligibilityService.revokeException(exceptionId, reason, req.user.id);

    res.json({
      success: true,
      message: 'Exception revoked successfully',
      data: exception
    });
  } catch (error) {
    winston.error('Error revoking exception:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error revoking exception'
    });
  }
});

/**
 * GET /api/v1/admin/manage/eligibility/evaluate/:studentId
 * Evaluate student eligibility with rules and exceptions
 */
router.get('/eligibility/evaluate/:studentId', authorize(['admin']), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const facultyId = req.query.faculty_id || req.user.faculty_id;
    const context = {
      completed_credits: req.query.completed_credits,
      current_semester_hours: req.query.current_semester_hours
    };

    const evaluation = await eligibilityService.evaluateStudentEligibility(studentId, facultyId, context);

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    winston.error('Error evaluating eligibility:', error);
    res.status(error.message === 'Student not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Error evaluating eligibility'
    });
  }
});

module.exports = router;
