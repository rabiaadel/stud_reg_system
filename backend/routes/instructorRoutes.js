const express = require('express');
const router = express.Router();
const InstructorManagementService = require('../services/instructorManagementService');
const CourseAssignmentService = require('../services/courseAssignmentService');
const { authenticate, authorize } = require('../middleware/auth');
const winston = require('winston');

const instructorService = new InstructorManagementService();
const assignmentService = new CourseAssignmentService();

// Require authentication for all instructor routes
router.use(authenticate);

/**
 * POST /api/v1/instructors
 * Create a new instructor (admin only)
 */
router.post('/', authorize(['admin']), async (req, res) => {
  try {
    const instructorData = {
      ...req.body,
      admin_id: req.user.id // From JWT
    };

    const instructor = await instructorService.createInstructor(instructorData);
    
    res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      data: instructor
    });
  } catch (error) {
    winston.error('Error creating instructor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating instructor'
    });
  }
});

/**
 * GET /api/v1/instructors
 * Get all instructors for faculty
 */
router.get('/', authorize(['admin', 'doctor']), async (req, res) => {
  try {
    const facultyId = req.query.faculty_id || req.user.faculty_id;
    const filter = {
      department_id: req.query.department_id,
      is_active: req.query.is_active !== 'false',
      search: req.query.search
    };

    const instructors = await instructorService.getInstructors(facultyId, filter);

    res.json({
      success: true,
      count: instructors.length,
      data: instructors
    });
  } catch (error) {
    winston.error('Error getting instructors:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching instructors'
    });
  }
});

/**
 * GET /api/v1/instructors/:id
 * Get instructor details with assignments
 */
router.get('/:id', authorize(['admin', 'doctor']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    const data = await instructorService.getInstructorWithAssignments(instructorId);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    winston.error('Error getting instructor:', error);
    res.status(error.message === 'Instructor not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Error fetching instructor'
    });
  }
});

/**
 * PUT /api/v1/instructors/:id
 * Update instructor details
 */
router.put('/:id', authorize(['admin']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    const updates = {
      ...req.body,
      admin_id: req.user.id
    };

    const instructor = await instructorService.updateInstructor(instructorId, updates);

    res.json({
      success: true,
      message: 'Instructor updated successfully',
      data: instructor
    });
  } catch (error) {
    winston.error('Error updating instructor:', error);
    res.status(error.message === 'Instructor not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Error updating instructor'
    });
  }
});

/**
 * DELETE /api/v1/instructors/:id
 * Deactivate instructor
 */
router.delete('/:id', authorize(['admin']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    await instructorService.deactivateInstructor(instructorId, req.body.reason);

    res.json({
      success: true,
      message: 'Instructor deactivated successfully'
    });
  } catch (error) {
    winston.error('Error deactivating instructor:', error);
    res.status(error.message === 'Instructor not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Error deactivating instructor'
    });
  }
});

/**
 * POST /api/v1/instructors/:id/assignments
 * Assign course to instructor
 */
router.post('/:id/assignments', authorize(['admin']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    const assignmentData = {
      ...req.body,
      instructor_id: instructorId,
      admin_id: req.user.id
    };

    const assignment = await assignmentService.assignCourseToInstructor(assignmentData);

    res.status(201).json({
      success: true,
      message: 'Course assigned successfully',
      data: assignment
    });
  } catch (error) {
    winston.error('Error assigning course:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error assigning course'
    });
  }
});

/**
 * GET /api/v1/instructors/:id/assignments
 * Get instructor's course assignments
 */
router.get('/:id/assignments', authorize(['admin', 'doctor']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    const semesterId = req.query.semester_id;

    const schedule = await assignmentService.getInstructorSchedule(instructorId, semesterId);

    res.json({
      success: true,
      count: schedule.length,
      data: schedule
    });
  } catch (error) {
    winston.error('Error getting assignments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching assignments'
    });
  }
});

/**
 * GET /api/v1/instructors/:id/workload
 * Get instructor workload analysis
 */
router.get('/:id/workload', authorize(['admin']), async (req, res) => {
  try {
    const instructorId = req.params.id;
    const semesterId = req.query.semester_id;

    const workload = await assignmentService.getInstructorWorkload(instructorId, semesterId);

    res.json({
      success: true,
      data: workload
    });
  } catch (error) {
    winston.error('Error calculating workload:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error calculating workload'
    });
  }
});

/**
 * PUT /api/v1/instructors/assignments/:assignmentId
 * Update course assignment
 */
router.put('/assignments/:assignmentId', authorize(['admin']), async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const updates = req.body;

    const assignment = await assignmentService.updateAssignment(assignmentId, updates);

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    winston.error('Error updating assignment:', error);
    res.status(error.message === 'Assignment not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Error updating assignment'
    });
  }
});

/**
 * DELETE /api/v1/instructors/assignments/:assignmentId
 * Remove course assignment
 */
router.delete('/assignments/:assignmentId', authorize(['admin']), async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const result = await assignmentService.removeAssignment(assignmentId);

    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    winston.error('Error removing assignment:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error removing assignment'
    });
  }
});

module.exports = router;
