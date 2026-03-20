const { pool } = require('../config/database');
const winston = require('winston');

class AcademicStandingService {
  /**
   * Calculate academic standing based on CGPA
   * Rules from Tanta University bylaws:
   * - Warning if CGPA < 2.0 (except first semester)
   * - Dismissal if 4 consecutive warnings or 6 non-consecutive warnings
   */
  async calculateAcademicStanding(studentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get student info
      const studentQuery = `
        SELECT s.*, sas.is_on_warning, sas.consecutive_warning_count, sas.total_warning_count
        FROM students s
        LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
        WHERE s.id = $1
      `;
      const studentResult = await client.query(studentQuery, [studentId]);
      if (studentResult.rows.length === 0) throw new Error('Student not found');
      const student = studentResult.rows[0];

      // Calculate current CGPA
      const cgpaQuery = `
        SELECT 
          COALESCE(AVG(sg.grade_points), 0) as cgpa,
          COUNT(DISTINCT sg.semester_id) as semesters_completed
        FROM student_grades sg
        WHERE sg.student_id = $1 AND sg.is_first_attempt = true
      `;
      const cgpaResult = await client.query(cgpaQuery, [studentId]);
      const { cgpa, semesters_completed } = cgpaResult.rows[0];
      const roundedCgpa = parseFloat(cgpa).toFixed(3);

      // Determine warning status
      let isOnWarning = false;
      let consecutiveWarningCount = student.consecutive_warning_count || 0;
      let totalWarningCount = student.total_warning_count || 0;
      let isDismissed = false;
      let dismissalReason = null;

      if (semesters_completed > 1 && roundedCgpa < 2.0) {
        isOnWarning = true;
        consecutiveWarningCount += 1;
        totalWarningCount += 1;
      } else if (semesters_completed > 1 && roundedCgpa >= 2.0) {
        // Reset consecutive count if CGPA improves
        consecutiveWarningCount = 0;
      }

      // Check dismissal conditions
      if (consecutiveWarningCount >= 4 || totalWarningCount >= 6) {
        isDismissed = true;
        dismissalReason = consecutiveWarningCount >= 4 
          ? 'Dismissed: 4 consecutive academic warnings' 
          : 'Dismissed: 6 non-consecutive academic warnings';
      }

      // Update academic standing record
      const standingQuery = `
        INSERT INTO student_academic_standing
        (student_id, gpa, cgpa, is_on_warning, consecutive_warning_count, total_warning_count, is_dismissed, dismissal_reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (student_id)
        DO UPDATE SET
          cgpa = $3,
          is_on_warning = $4,
          consecutive_warning_count = $5,
          total_warning_count = $6,
          is_dismissed = $7,
          dismissal_reason = $8,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const standingResult = await client.query(standingQuery, [
        studentId,
        roundedCgpa,
        roundedCgpa,
        isOnWarning,
        consecutiveWarningCount,
        totalWarningCount,
        isDismissed,
        dismissalReason
      ]);

      // Update student record
      await client.query(
        'UPDATE students SET cgpa = $1, is_dismissed = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [roundedCgpa, isDismissed, studentId]
      );

      await client.query('COMMIT');

      return {
        student_id: studentId,
        cgpa: roundedCgpa,
        is_on_warning: isOnWarning,
        consecutive_warning_count: consecutiveWarningCount,
        total_warning_count: totalWarningCount,
        is_dismissed: isDismissed,
        dismissal_reason: dismissalReason,
        status: isDismissed ? 'Dismissed' : (isOnWarning ? 'Academic Warning' : 'Good Standing')
      };
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error calculating academic standing:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if student is eligible to register
   */
  async checkRegistrationEligibility(studentId, semesterId) {
    try {
      const query = `
        SELECT s.*, sas.is_on_warning, sas.is_dismissed
        FROM students s
        LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
        WHERE s.id = $1
      `;
      const result = await pool.query(query, [studentId]);
      if (result.rows.length === 0) throw new Error('Student not found');
      
      const student = result.rows[0];

      const eligibility = {
        is_eligible: true,
        warnings: [],
        errors: []
      };

      if (student.is_dismissed) {
        eligibility.is_eligible = false;
        eligibility.errors.push('Student has been dismissed from faculty');
      }

      if (student.is_on_warning) {
        eligibility.warnings.push('Student is on academic warning - CGPA below 2.0');
      }

      if (student.is_active === false) {
        eligibility.is_eligible = false;
        eligibility.errors.push('Student account is inactive');
      }

      return eligibility;
    } catch (error) {
      winston.error('Error checking registration eligibility:', error);
      throw error;
    }
  }

  /**
   * Get detailed academic standing profile
   */
  async getAcademicStandingProfile(studentId) {
    try {
      const query = `
        SELECT 
          s.id,
          s.student_id,
          s.first_name_en,
          s.last_name_en,
          s.cgpa,
          sas.gpa,
          sas.is_on_warning,
          sas.consecutive_warning_count,
          sas.total_warning_count,
          sas.is_dismissed,
          sas.dismissal_reason,
          sas.is_on_probation,
          sas.probation_start_date,
          sas.probation_end_date,
          sas.is_honors_eligible,
          COUNT(DISTINCT sg.course_id) FILTER (WHERE sg.grade_points >= 1.0) as courses_passed,
          COUNT(DISTINCT sg.course_id) FILTER (WHERE sg.grade_points < 1.0) as courses_failed,
          COALESCE(SUM(c.credit_hours) FILTER (WHERE sg.grade_points >= 1.0), 0) as total_credits_passed
        FROM students s
        LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
        LEFT JOIN student_grades sg ON s.id = sg.student_id
        LEFT JOIN courses c ON sg.course_id = c.id
        WHERE s.id = $1
        GROUP BY s.id, sas.id
      `;

      const result = await pool.query(query, [studentId]);
      if (result.rows.length === 0) throw new Error('Student not found');

      const standing = result.rows[0];
      
      // Determine GPA classification
      let gpaClassification = 'Poor';
      if (standing.cgpa < 1.0) gpaClassification = 'Poor';
      else if (standing.cgpa < 2.0) gpaClassification = 'Weak';
      else if (standing.cgpa < 2.5) gpaClassification = 'Satisfactory';
      else if (standing.cgpa < 3.0) gpaClassification = 'Good';
      else if (standing.cgpa < 3.5) gpaClassification = 'Very Good';
      else gpaClassification = 'Excellent';

      return {
        student: {
          id: standing.id,
          student_id: standing.student_id,
          full_name: `${standing.first_name_en} ${standing.last_name_en}`
        },
        academic_standing: {
          cgpa: parseFloat(standing.cgpa).toFixed(3),
          gpa_classification: gpaClassification,
          status: standing.is_dismissed ? 'Dismissed' : (standing.is_on_warning ? 'On Warning' : 'Good Standing')
        },
        warning_status: {
          is_on_warning: standing.is_on_warning,
          consecutive_warnings: standing.consecutive_warning_count,
          total_warnings: standing.total_warning_count
        },
        academic_record: {
          courses_passed: standing.courses_passed,
          courses_failed: standing.courses_failed,
          total_credits_passed: parseInt(standing.total_credits_passed)
        },
        dismissal_info: {
          is_dismissed: standing.is_dismissed,
          reason: standing.dismissal_reason
        },
        honors_status: {
          is_honors_eligible: standing.is_honors_eligible
        }
      };
    } catch (error) {
      winston.error('Error getting academic standing profile:', error);
      throw error;
    }
  }
}

module.exports = AcademicStandingService;
