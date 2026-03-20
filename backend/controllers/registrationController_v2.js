/**
 * Registration Controller v2
 * Comprehensive course registration with full bylaw enforcement
 * Integrates: bylawsEnforcementService, graduationEligibilityService, prerequisiteCheckService
 */

const db = require('../config/database');
const logger = require('../utils/logger') || console;
const bylawsEnforcement = require('../services/bylawsEnforcementService');
const graduationEligibility = require('../services/graduationEligibilityService');

// [POST] Register student for courses
exports.registerForCourses = async (req, res) => {
  try {
    const { studentId, courseIds = [], semesterId } = req.body;

    if (!studentId || !semesterId || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, courseIds, semesterId'
      });
    }

    // Step 1: Check overall registration eligibility
    const regEligibility = await bylawsEnforcement.checkRegistrationEligibility(
      studentId,
      semesterId
    );

    if (!regEligibility.eligible) {
      return res.status(403).json({
        success: false,
        message: 'Student not eligible for registration',
        blockers: regEligibility.blockers,
        warnings: regEligibility.warnings
      });
    }

    // Step 2: Validate each course individually
    const courseValidations = [];
    const eligibleCourses = [];

    for (const courseId of courseIds) {
      const courseElig = await bylawsEnforcement.checkCourseRegistrationEligibility(
        studentId,
        courseId,
        semesterId
      );

      courseValidations.push({
        courseId,
        eligible: courseElig.eligible,
        blockers: courseElig.blockers,
        warnings: courseElig.warnings
      });

      if (courseElig.eligible) {
        eligibleCourses.push(courseId);
      }
    }

    // Step 3: Validate credit hour constraints
    const creditValidation = await bylawsEnforcement.validateSemesterCredits(
      studentId,
      eligibleCourses,
      semesterId
    );

    if (!creditValidation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Credit hour constraints violated',
        totalCredits: creditValidation.totalCredits,
        minCredits: creditValidation.minCredits,
        maxCredits: creditValidation.maxCredits,
        violations: creditValidation.violations,
        courseValidations
      });
    }

    // Step 4: Perform registrations
    const registrations = [];
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      for (const courseId of eligibleCourses) {
        const result = await client.query(
          `INSERT INTO student_registrations (student_id, course_id, semester_id, status, registration_date)
           VALUES ($1, $2, $3, 'REGISTERED', NOW())
           RETURNING id, course_id, status`,
          [studentId, courseId, semesterId]
        );

        registrations.push(result.rows[0]);
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: `Successfully registered for ${registrations.length} courses`,
        registrations,
        warnings: regEligibility.warnings,
        ineligible_courses: courseValidations.filter(c => !c.eligible),
        credit_validation: creditValidation
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    logger.error('Error in course registration:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing registration: ' + error.message
    });
  }
};

// [GET] Get available courses for student
exports.getAvailableCourses = async (req, res) => {
  try {
    const { studentId, semesterId } = req.query;

    if (!studentId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters: studentId, semesterId'
      });
    }

    // Get student's current credits/standing
    const student = await db.query(
      `SELECT s.*, sp.id as specialization_id FROM students s
       LEFT JOIN specializations sp ON s.specialization_id = sp.id
       WHERE s.id = $1`,
      [studentId]
    );

    if (student.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const studentData = student.rows[0];

    // Get recommended courses based on prerequisites
    const courses = await bylawsEnforcement.getRecommendedCourses(
      studentId,
      studentData.specialization_id,
      30
    );

    // Validate each course's availability
    const availableCourses = [];

    for (const course of courses) {
      const validation = await bylawsEnforcement.checkCourseRegistrationEligibility(
        studentId,
        course.id,
        semesterId
      );

      availableCourses.push({
        ...course,
        eligible: validation.eligible,
        blockers: validation.blockers,
        warnings: validation.warnings,
        prerequisites_met: validation.blockers.length === 0
      });
    }

    return res.status(200).json({
      success: true,
      message: `Found ${availableCourses.length} available courses`,
      availableCount: availableCourses.length,
      courses: availableCourses
    });

  } catch (error) {
    logger.error('Error fetching available courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available courses: ' + error.message
    });
  }
};

// [GET] Check registration eligibility for specific student
exports.checkRegistrationEligibility = async (req, res) => {
  try {
    const { studentId, semesterId } = req.query;

    if (!studentId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, semesterId'
      });
    }

    const eligibility = await bylawsEnforcement.checkRegistrationEligibility(
      studentId,
      semesterId
    );

    return res.status(200).json({
      success: true,
      eligibility
    });

  } catch (error) {
    logger.error('Error checking registration eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking eligibility: ' + error.message
    });
  }
};

// [GET] Check graduation eligibility
exports.checkGraduationEligibility = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: studentId'
      });
    }

    const eligibility = await graduationEligibility.checkGraduationEligibility(studentId);
    const graduationEstimate = await graduationEligibility.estimateGraduationDate(studentId);

    return res.status(200).json({
      success: true,
      eligible_for_graduation: eligibility.eligible,
      eligibility_details: eligibility,
      graduation_estimate: graduationEstimate,
      missing_requirements_count: eligibility.missing_requirements.length
    });

  } catch (error) {
    logger.error('Error checking graduation eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking graduation eligibility: ' + error.message
    });
  }
};

// [GET] Get student's current semester registration
exports.getStudentRegistrations = async (req, res) => {
  try {
    const { studentId, semesterId } = req.query;

    if (!studentId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, semesterId'
      });
    }

    const registrations = await db.query(
      `SELECT sr.id, sr.status, c.code, c.name_en, c.credit_hours,
              sg.grade, sg.grade_points
       FROM student_registrations sr
       JOIN courses c ON sr.course_id = c.id
       LEFT JOIN student_grades sg ON sr.id = sg.student_registration_id
       WHERE sr.student_id = $1 AND sr.semester_id = $2
       ORDER BY c.code`,
      [studentId, semesterId]
    );

    const totalCredits = registrations.rows.reduce((sum, r) => sum + r.credit_hours, 0);

    return res.status(200).json({
      success: true,
      courseCount: registrations.rows.length,
      totalCredits,
      registrations: registrations.rows
    });

  } catch (error) {
    logger.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching registrations: ' + error.message
    });
  }
};

// [POST] Drop a course
exports.dropCourse = async (req, res) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: registrationId'
      });
    }

    // Verify registration exists
    const reg = await db.query(
      `SELECT * FROM student_registrations WHERE id = $1`,
      [registrationId]
    );

    if (reg.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Update status
    await db.query(
      `UPDATE student_registrations SET status = 'WITHDRAWN' WHERE id = $1`,
      [registrationId]
    );

    return res.status(200).json({
      success: true,
      message: 'Course dropped successfully',
      registrationId
    });

  } catch (error) {
    logger.error('Error dropping course:', error);
    res.status(500).json({
      success: false,
      message: 'Error dropping course: ' + error.message
    });
  }
};

// [GET] Get bylaw article explanation
exports.getBylawArticle = async (req, res) => {
  try {
    const { articleCode } = req.query;

    if (!articleCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: articleCode'
      });
    }

    const article = await bylawsEnforcement.getBylawArticle(articleCode);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Bylaw article ${articleCode} not found`
      });
    }

    return res.status(200).json({
      success: true,
      article
    });

  } catch (error) {
    logger.error('Error fetching bylaw article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bylaw article: ' + error.message
    });
  }
};
