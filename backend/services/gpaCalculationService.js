// ============================================================================
// GPA Calculation Service — Wraps utils with database operations
// Called by controllers, uses gpaCalculator utility
// ============================================================================

const db = require('../config/database');
const {
  calculateSemesterGPA,
  calculateCGPA,
  calculatePassingCredits,
  calculateGradeDistribution
} = require('../utils/gpaCalculator');
const { getAcademicStandingStatus } = require('../constants/bylaw');

class GPACalculationService {
  /**
   * Calculate GPA for a specific semester
   * Queries: student grades for that semester
   */
  async calculateStudentSemesterGPA(studentId, semesterId) {
    try {
      const query = `
        SELECT 
          sg.grade_points as gradePoint,
          c.credit_hours as creditHours,
          c.code,
          c.name
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1 AND sg.semester_id = $2
        AND sg.grade_points IS NOT NULL
      `;
      
      const result = await db.query(query, [studentId, semesterId]);
      const grades = result.rows;

      const gpa = calculateSemesterGPA(grades);

      // Update student_grades_semester record
      await db.query(`
        UPDATE student_semester_grades
        SET gpa = $1, updated_at = NOW()
        WHERE student_id = $2 AND semester_id = $3
      `, [gpa, studentId, semesterId]);

      return {
        studentId,
        semesterId,
        gpa,
        coursesCount: grades.length,
        totalCredits: grades.reduce((sum, g) => sum + g.creditHours, 0)
      };
    } catch (err) {
      console.error('Error calculating semester GPA:', err);
      throw err;
    }
  }

  /**
   * Calculate cumulative GPA (CGPA) for a student
   * Queries: all student grades across all semesters
   */
  async calculateStudentCGPA(studentId) {
    try {
      const query = `
        SELECT 
          sg.grade_points as gradePoint,
          c.credit_hours as creditHours,
          s.name as semesterName,
          sem.id as semesterId
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        JOIN semesters sem ON sg.semester_id = sem.id
        JOIN semesters_translations s ON sem.id = s.semester_id AND s.lang = 'en'
        WHERE sg.student_id = $1
        AND sg.grade_points IS NOT NULL
        ORDER BY sem.start_date ASC
      `;
      
      const result = await db.query(query, [studentId]);
      const allGrades = result.rows;

      const cgpa = calculateCGPA(allGrades);
      const passingCredits = calculatePassingCredits(allGrades);

      // Update student profile
      await db.query(`
        UPDATE students
        SET cgpa = $1, total_credits = $2, updated_at = NOW()
        WHERE id = $3
      `, [cgpa, passingCredits, studentId]);

      // Determine academic standing
      const standingStatus = getAcademicStandingStatus(cgpa);

      return {
        studentId,
        cgpa,
        passingCredits,
        standingStatus,
        semestersCompleted: new Set(allGrades.map(g => g.semesterId)).size
      };
    } catch (err) {
      console.error('Error calculating CGPA:', err);
      throw err;
    }
  }

  /**
   * Get GPA progression (all semesters)
   * For trending and analysis
   */
  async getGPAProgression(studentId) {
    try {
      const query = `
        SELECT 
          sem.id as semesterId,
          s.name as semesterName,
          ssg.gpa,
          ssg.created_at as completedAt
        FROM student_semester_grades ssg
        JOIN semesters sem ON ssg.semester_id = sem.id
        JOIN semesters_translations s ON sem.id = s.semester_id AND s.lang = 'en'
        WHERE ssg.student_id = $1
        ORDER BY sem.start_date ASC
      `;
      
      const result = await db.query(query, [studentId]);
      return result.rows;
    } catch (err) {
      console.error('Error fetching GPA progression:', err);
      throw err;
    }
  }

  /**
   * Recalculate GPA for all students in a semester
   * Batch operation, used after grade entry deadline
   */
  async recalculateAllGradesBySemester(semesterId) {
    try {
      // Get all students with grades in this semester
      const studentQuery = `
        SELECT DISTINCT student_id
        FROM student_grades
        WHERE semester_id = $1
      `;
      const studentResult = await db.query(studentQuery, [semesterId]);
      const studentIds = studentResult.rows.map(r => r.student_id);

      const results = [];
      for (const studentId of studentIds) {
        const result = await this.calculateStudentSemesterGPA(studentId, semesterId);
        results.push(result);
      }

      return {
        semesterId,
        studentCount: studentIds.length,
        updated: results
      };
    } catch (err) {
      console.error('Error batch recalculating GPAs:', err);
      throw err;
    }
  }

  /**
   * Get academic standing for a student
   * Determines: Good Standing / Warning / Dismissal
   */
  async getAcademicStanding(studentId) {
    try {
      const query = `
        SELECT 
          id,
          cgpa,
          total_credits,
          academic_level,
          academic_status as currentStatus
        FROM students
        WHERE id = $1
      `;
      
      const result = await db.query(query, [studentId]);
      if (result.rows.length === 0) throw new Error('Student not found');

      const student = result.rows[0];
      const status = getAcademicStandingStatus(student.cgpa);

      // Check dismissal conditions
      const dismissalQuery = `
        SELECT COUNT(*) as warningCount
        FROM academic_standing_records
        WHERE student_id = $1 AND status = 'warning'
      `;
      const dismissalResult = await db.query(dismissalQuery, [studentId]);
      const warningCount = parseInt(dismissalResult.rows[0].warningCount);

      const isDismissed = warningCount >= 2 && student.cgpa < 1.75;

      return {
        studentId,
        cgpa: student.cgpa,
        totalCredits: student.total_credits,
        academicLevel: student.academic_level,
        currentStatus: status,
        warningCount,
        isDismissed,
        canRegister: !isDismissed && student.cgpa >= 2.0,
        recommendation: this._getStandingRecommendation(status, warningCount)
      };
    } catch (err) {
      console.error('Error fetching academic standing:', err);
      throw err;
    }
  }

  /**
   * Generate academic standing recommendation message
   */
  _getStandingRecommendation(status, warningCount) {
    const recommendations = {
      excellent: 'Excellent performance. Continue at this pace.',
      very_good: 'Very good progress. Maintain your efforts.',
      good: 'On track. Monitor your GPA.',
      warning: `At academic risk (warning ${warningCount}). Seek academic advising.`,
      dismissal: 'Academic dismissal – contact dean of students.'
    };
    return recommendations[status] || 'Check with academic advisor.';
  }
}

module.exports = new GPACalculationService();
