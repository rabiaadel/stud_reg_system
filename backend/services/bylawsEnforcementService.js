// Bylaws Enforcement Service - Implements Faculty of Computers and Informatics Rules
const { pool } = require('../config/database');
const logger = require('../config/logger').default || console;

class BylawsEnforcementService {
  /**
   * Check student eligibility for course registration
   * Implements multiple bylaws articles
   */
  async checkRegistrationEligibility(studentId) {
    const client = await pool.connect();
    try {
      const student = await client.query(
        `SELECT s.*, sp.min_cgpa, sp.max_study_years,
                sas.cgpa, sas.is_on_warning, sas.is_dismissed,
                COUNT(DISTINCT aw.id) as warning_count
         FROM students s
         LEFT JOIN specializations sp ON s.specialization_id = sp.id
         LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
         LEFT JOIN academic_warnings aw ON s.id = aw.student_id AND aw.status = 'active'
         WHERE s.id = $1
         GROUP BY s.id, sp.id, sas.id`,
        [studentId]
      );

      if (student.rows.length === 0) {
        return {
          is_eligible: false,
          reason: 'Student not found',
          status: 'NOT_FOUND',
        };
      }

      const studentData = student.rows[0];

      // Check if dismissed
      if (studentData.is_dismissed) {
        return {
          is_eligible: false,
          reason: 'Student has been dismissed from faculty',
          status: 'DISMISSED',
        };
      }

      // Check CGPA (Article 20)
      const minCgpa = studentData.min_cgpa || 2.0;
      if (studentData.cgpa < minCgpa) {
        return {
          is_eligible: false,
          reason: `CGPA ${studentData.cgpa} is below minimum required ${minCgpa}`,
          status: 'LOW_GPA',
          current_cgpa: studentData.cgpa,
          min_cgpa: minCgpa,
        };
      }

      // Check for academic warnings (Article 24-25)
      if (studentData.is_on_warning) {
        return {
          is_eligible: true,
          warning: 'Student is on academic warning - continue with caution',
          status: 'ON_WARNING',
          warning_count: studentData.warning_count,
        };
      }

      // Check study duration (Article 26)
      const semestersStudied = await client.query(
        `SELECT COUNT(DISTINCT semester_id) as semesters_count
         FROM student_registrations
         WHERE student_id = $1`,
        [studentId]
      );

      const semesters = semestersStudied.rows[0].semesters_count;
      const maxSemesters = (studentData.max_study_years || 4) * 2;

      if (semesters >= maxSemesters) {
        return {
          is_eligible: false,
          reason: `Student has exceeded maximum study duration (${maxSemesters} semesters)`,
          status: 'EXCEEDS_DURATION',
          semesters_studied: semesters,
          max_semesters: maxSemesters,
        };
      }

      // Check attendance threshold (Article 14)
      const attendanceCheck = await client.query(
        `SELECT AVG(ar.attendance_percentage) as avg_attendance
         FROM attendance_records ar
         JOIN student_registrations sr ON sr.course_id = ar.course_id
         WHERE ar.student_id = $1 AND ar.attendance_percentage IS NOT NULL
         LIMIT 10`,
        [studentId]
      );

      const avgAttendance = attendanceCheck.rows[0]?.avg_attendance || 100;
      if (avgAttendance < 42) {
        return {
          is_eligible: false,
          reason: 'Attendance below 42% threshold - cannot register',
          status: 'LOW_ATTENDANCE',
          current_attendance: avgAttendance,
        };
      }

      return {
        is_eligible: true,
        reason: 'Student is eligible for course registration',
        status: 'ELIGIBLE',
        current_cgpa: studentData.cgpa,
        min_cgpa: minCgpa,
        semesters_studied: semesters,
        max_semesters: maxSemesters,
        avg_attendance: avgAttendance,
      };
    } catch (error) {
      logger.error('Registration eligibility check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check academic standing and issue warnings if necessary
   * Implements Article 24-25
   */
  async checkAndIssueAcademicWarning(studentId, semesterId) {
    const client = await pool.connect();
    try {
      // Get current academic standing
      const standingResult = await client.query(
        `SELECT sas.* FROM student_academic_standing sas
         WHERE sas.student_id = $1 AND sas.semester_id = $2`,
        [studentId, semesterId]
      );

      if (standingResult.rows.length === 0) {
        return { issued: false, reason: 'No academic standing record found' };
      }

      const standing = standingResult.rows[0];

      // Check if CGPA is below 2.0 (Article 25)
      if (standing.cgpa < 2.0 && !standing.is_on_warning) {
        // Check if this is first semester (no warning for first semester)
        const firstSemesterCheck = await client.query(
          `SELECT COUNT(*) as semester_count FROM semesters
           WHERE id <= $1 AND faculty_id = (
             SELECT faculty_id FROM students WHERE id = $2
           )`,
          [semesterId, studentId]
        );

        if (firstSemesterCheck.rows[0].semester_count > 1) {
          // Issue warning
          await client.query(
            `INSERT INTO academic_warnings (
              student_id, semester_id, warning_type, severity, 
              cgpa_at_warning, issued_by, reason, status
            ) VALUES ($1, $2, 'GPA_BELOW_2.0', 'major', $3, 1, 
              'CGPA below 2.0 threshold', 'active')`,
            [studentId, semesterId, standing.cgpa]
          );

          // Update student academic standing
          await client.query(
            `UPDATE student_academic_standing 
             SET is_on_warning = TRUE, 
                 consecutive_warning_count = consecutive_warning_count + 1,
                 total_warning_count = total_warning_count + 1
             WHERE student_id = $1`,
            [studentId]
          );

          return {
            issued: true,
            warning_type: 'GPA_BELOW_2.0',
            message: `Academic warning issued - CGPA ${standing.cgpa} is below 2.0`,
          };
        }
      }

      return { issued: false, reason: 'No warning necessary' };
    } catch (error) {
      logger.error('Academic warning check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if student should be dismissed
   * Implements Article 25-26
   */
  async checkDismissal(studentId) {
    const client = await pool.connect();
    try {
      const student = await client.query(
        `SELECT s.*, sas.consecutive_warning_count, sas.total_warning_count,
                COUNT(DISTINCT sem.id) as semesters_count
         FROM students s
         LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
         LEFT JOIN student_registrations sr ON s.id = sr.student_id
         LEFT JOIN semesters sem ON sr.semester_id = sem.id
         WHERE s.id = $1
         GROUP BY s.id, sas.id`,
        [studentId]
      );

      if (student.rows.length === 0) {
        return { should_dismiss: false, reason: 'Student not found' };
      }

      const studentData = student.rows[0];
      const dismissalReasons = [];

      // Check consecutive warning count (Article 25)
      if (studentData.consecutive_warning_count >= 4) {
        dismissalReasons.push({
          type: 'ACADEMIC_WARNING_CONSECUTIVE',
          details: `${studentData.consecutive_warning_count} consecutive academic warnings`,
        });
      }

      // Check total warning count (Article 25)
      if (studentData.total_warning_count >= 6) {
        dismissalReasons.push({
          type: 'ACADEMIC_WARNING_TOTAL',
          details: `${studentData.total_warning_count} total academic warnings`,
        });
      }

      // Check study duration (Article 26)
      if (studentData.semesters_count >= 8) {
        dismissalReasons.push({
          type: 'EXCEEDS_STUDY_DURATION',
          details: `Exceeded maximum 8 regular semesters (${studentData.semesters_count} studied)`,
        });
      }

      if (dismissalReasons.length > 0) {
        return {
          should_dismiss: true,
          reasons: dismissalReasons,
          primary_reason: dismissalReasons[0].type,
        };
      }

      return { should_dismiss: false, reason: 'Student meets all dismissal criteria' };
    } catch (error) {
      logger.error('Dismissal check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check graduation eligibility
   * Implements multiple bylaws sections
   */
  async checkGraduationEligibility(studentId) {
    const client = await pool.connect();
    try {
      const student = await client.query(
        `SELECT s.*, sp.total_credits, sp.min_cgpa,
                sas.cgpa, sas.is_dismissed
         FROM students s
         LEFT JOIN specializations sp ON s.specialization_id = sp.id
         LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
         WHERE s.id = $1`,
        [studentId]
      );

      if (student.rows.length === 0) {
        return { is_eligible: false, reason: 'Student not found' };
      }

      const studentData = student.rows[0];
      const missingRequirements = [];

      // Check if dismissed
      if (studentData.is_dismissed) {
        missingRequirements.push('Student has been dismissed');
      }

      // Check CGPA (Article 20)
      const minCgpa = studentData.min_cgpa || 2.0;
      if (studentData.cgpa < minCgpa) {
        missingRequirements.push(
          `CGPA ${studentData.cgpa} is below minimum ${minCgpa}`
        );
      }

      // Check total credits (Article 8)
      const totalRequired = studentData.total_credits || 132;
      const creditResult = await client.query(
        `SELECT SUM(c.credit_hours) as total_credits
         FROM student_registrations sr
         JOIN courses c ON sr.course_id = c.id
         JOIN student_grades sg ON sr.id = sg.student_registration_id
         WHERE sr.student_id = $1 AND sg.grade_letter NOT IN ('F', 'D-')`,
        [studentId]
      );

      const creditsPassed = creditResult.rows[0]?.total_credits || 0;
      if (creditsPassed < totalRequired) {
        missingRequirements.push(
          `Credits passed ${creditsPassed} is below required ${totalRequired}`
        );
      }

      // Check project completion (Article 21)
      const projectResult = await client.query(
        `SELECT COUNT(*) as project_count FROM graduation_project_submissions
         WHERE student_id = $1 AND status IN ('Approved', 'Submitted')`,
        [studentId]
      );

      const projectsCompleted = projectResult.rows[0]?.project_count || 0;
      if (projectsCompleted < 2) {
        missingRequirements.push('Graduation projects not completed (need 2)');
      }

      // Check training/internship (Article 13)
      const trainingResult = await client.query(
        `SELECT status FROM student_training
         WHERE student_id = $1 AND status = 'Completed'`,
        [studentId]
      );

      if (trainingResult.rows.length === 0) {
        missingRequirements.push('Training/Internship not completed');
      }

      const isEligible = missingRequirements.length === 0;

      return {
        is_eligible: isEligible,
        total_credits_passed: creditsPassed,
        total_credits_required: totalRequired,
        cgpa: studentData.cgpa,
        min_cgpa_required: minCgpa,
        projects_completed: projectsCompleted,
        training_status: trainingResult.rows[0]?.status || 'Not Started',
        missing_requirements: missingRequirements,
      };
    } catch (error) {
      logger.error('Graduation eligibility check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check honors eligibility
   * Implements Article 27
   */
  async checkHonorsEligibility(studentId) {
    const client = await pool.connect();
    try {
      const student = await client.query(
        `SELECT s.*, sas.cgpa, sas.is_dismissed, COUNT(DISTINCT sem.id) as semesters_count
         FROM students s
         LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
         LEFT JOIN student_registrations sr ON s.id = sr.student_id
         LEFT JOIN semesters sem ON sr.semester_id = sem.id
         WHERE s.id = $1
         GROUP BY s.id, sas.id`,
        [studentId]
      );

      if (student.rows.length === 0) {
        return { is_eligible_for_honors: false, reason: 'Student not found' };
      }

      const studentData = student.rows[0];
      const reasons = [];

      // Check CGPA >= 3.0 (Article 27)
      if (studentData.cgpa < 3.0) {
        reasons.push(`CGPA ${studentData.cgpa} must be >= 3.0`);
      }

      // Check no dismissals
      if (studentData.is_dismissed) {
        reasons.push('Student must not be dismissed');
      }

      // Check completion within 4 years (8 semesters)
      if (studentData.semesters_count > 8) {
        reasons.push(`Must complete within 8 semesters (${studentData.semesters_count} studied)`);
      }

      // Check no failed courses
      const failedCoursesResult = await client.query(
        `SELECT COUNT(*) as failed_count FROM student_grades sg
         WHERE sg.student_id = $1 AND sg.grade_letter IN ('F', 'D-')`,
        [studentId]
      );

      if (failedCoursesResult.rows[0].failed_count > 0) {
        reasons.push('Student must have no failed courses');
      }

      const isEligible = reasons.length === 0;

      return {
        is_eligible_for_honors: isEligible,
        cgpa: studentData.cgpa,
        min_cgpa_required: 3.0,
        semesters_studied: studentData.semesters_count,
        failed_courses: failedCoursesResult.rows[0].failed_count,
        reasons_not_eligible: reasons,
      };
    } catch (error) {
      logger.error('Honors eligibility check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get academic standing classification
   * Implements Article 23
   */
  getAcademicClassification(cgpa) {
    if (cgpa < 1.0) return 'Poor';
    if (cgpa < 2.0) return 'Weak';
    if (cgpa < 2.5) return 'Satisfactory';
    if (cgpa < 3.0) return 'Good';
    if (cgpa < 3.5) return 'Very Good';
    return 'Excellent';
  }

  /**
   * Calculate maximum registrable credits based on CGPA and level
   * Implements Article 11
   */
  async getMaxRegistrableCredits(studentId, academicLevel) {
    const client = await pool.connect();
    try {
      const constraints = await client.query(
        `SELECT * FROM registration_constraints
         WHERE specialization_id = (SELECT specialization_id FROM students WHERE id = $1)
         AND academic_level = $2`,
        [studentId, academicLevel]
      );

      if (constraints.rows.length === 0) {
        return { max_credits: 30, reason: 'Default maximum' };
      }

      const constraint = constraints.rows[0];
      return {
        max_credits: constraint.max_credits,
        min_credits: constraint.min_credits,
        reason: 'Based on academic level and CGPA',
      };
    } catch (error) {
      logger.error('Get max credits error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check course repeat eligibility
   * Implements Article 22-23
   */
  async checkCourseRepeatEligibility(studentId, courseId, isForImprovement) {
    const client = await pool.connect();
    try {
      const repeatHistory = await client.query(
        `SELECT * FROM course_repetition_tracking
         WHERE student_id = $1 AND course_id = $2`,
        [studentId, courseId]
      );

      if (repeatHistory.rows.length === 0) {
        return { can_repeat: true, reason: 'First attempt' };
      }

      const history = repeatHistory.rows[0];

      if (isForImprovement) {
        // Check if CGPA < 2.0 (Article 23)
        const cgpaResult = await client.query(
          `SELECT cgpa FROM student_academic_standing WHERE student_id = $1`,
          [studentId]
        );

        const cgpa = cgpaResult.rows[0]?.cgpa || 0;
        if (cgpa >= 2.0) {
          // Check number of improvement attempts (max 3)
          const improvementCount = await client.query(
            `SELECT COUNT(*) as count FROM course_repetition_tracking
             WHERE student_id = $1 AND is_for_improvement = TRUE`,
            [studentId]
          );

          if (improvementCount.rows[0].count >= 3) {
            return {
              can_repeat: false,
              reason: 'Maximum 3 courses can be retaken for improvement',
            };
          }
        }

        return { can_repeat: true, reason: 'Eligible for improvement attempt' };
      }

      return { can_repeat: true, reason: 'Eligible for course repetition' };
    } catch (error) {
      logger.error('Course repeat eligibility check error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new BylawsEnforcementService();
