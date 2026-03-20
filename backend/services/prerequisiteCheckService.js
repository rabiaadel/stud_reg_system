// ============================================================================
// Prerequisite Check Service — Validate course prerequisites
// Ensures student has passed required prerequisite courses
// ============================================================================

const db = require('../config/database');
const { BYLAWS } = require('../constants/bylaw');

class PrerequisiteCheckService {
  /**
   * Check if student can register for a course
   * Validates: prerequisites, GPA, level requirements
   */
  async canRegisterForCourse(studentId, courseId) {
    try {
      // Get student info
      const studentQuery = `
        SELECT cgpa, academic_level, total_credits
        FROM students
        WHERE id = $1
      `;
      const studentResult = await db.query(studentQuery, [studentId]);
      if (studentResult.rows.length === 0) throw new Error('Student not found');
      
      const student = studentResult.rows[0];

      // Get course prerequisites
      const courseQuery = `
        SELECT id, code, name, credit_hours, min_gpa, min_level
        FROM courses
        WHERE id = $1
      `;
      const courseResult = await db.query(courseQuery, [courseId]);
      if (courseResult.rows.length === 0) throw new Error('Course not found');
      
      const course = courseResult.rows[0];

      // Check GPA requirement
      if (student.cgpa < (course.min_gpa || BYLAWS.PREREQUISITE_GPA_REQUIREMENT)) {
        return {
          canRegister: false,
          reason: 'GPA too low',
          details: `Your GPA ${student.cgpa} is below ${course.min_gpa || BYLAWS.PREREQUISITE_GPA_REQUIREMENT}`
        };
      }

      // Check level requirement
      if (course.min_level && student.academic_level < course.min_level) {
        return {
          canRegister: false,
          reason: 'Academic level too low',
          details: `You must be at least ${course.min_level}`
        };
      }

      // Check prerequisites
      const prereqCheck = await this.checkPrerequisites(studentId, courseId, student);
      if (!prereqCheck.satisfied) {
        return {
          canRegister: false,
          reason: 'Prerequisites not met',
          missing: prereqCheck.missingCourses,
          details: prereqCheck.missingCourses.map(c => c.name).join(', ')
        };
      }

      return {
        canRegister: true,
        course,
        student
      };
    } catch (err) {
      console.error('Error checking course registration:', err);
      throw err;
    }
  }

  /**
   * Get prerequisites for a course
   */
  async getCoursePrerequisites(courseId) {
    try {
      const query = `
        SELECT 
          cp.id,
          cp.course_id,
          cp.prerequisite_id,
          c.code,
          c.name,
          c.credit_hours
        FROM course_prerequisites cp
        JOIN courses c ON cp.prerequisite_id = c.id
        WHERE cp.course_id = $1
      `;
      
      const result = await db.query(query, [courseId]);
      return result.rows;
    } catch (err) {
      console.error('Error fetching prerequisites:', err);
      throw err;
    }
  }

  /**
   * Check if student has completed all prerequisites
   */
  async checkPrerequisites(studentId, courseId, student = null) {
    try {
      // Get course prerequisites
      const prerequisites = await this.getCoursePrerequisites(courseId);
      
      if (prerequisites.length === 0) {
        return { satisfied: true, missingCourses: [] };
      }

      // Get student's completed courses
      const completedQuery = `
        SELECT DISTINCT c.id, c.code, c.name
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1
        AND sg.grade_points >= 1.0  -- Passing grade (D or better)
      `;
      const completedResult = await db.query(completedQuery, [studentId]);
      const completedCourseIds = new Set(completedResult.rows.map(r => r.id));
      const completedCourses = completedResult.rows;

      // Check which prerequisites are missing
      const missingCourses = prerequisites.filter(
        prereq => !completedCourseIds.has(prereq.prerequisite_id)
      );

      return {
        satisfied: missingCourses.length === 0,
        completedCourses,
        missingCourses
      };
    } catch (err) {
      console.error('Error checking prerequisites:', err);
      throw err;
    }
  }

  /**
   * Get prerequisite tree for a course
   * Shows all required courses and co-requisites
   */
  async getPrerequisiteTree(courseId, depth = 0, visited = new Set()) {
    try {
      if (depth > 5 || visited.has(courseId)) return null;
      visited.add(courseId);

      const courseQuery = `
        SELECT code, name, credit_hours
        FROM courses
        WHERE id = $1
      `;
      const courseResult = await db.query(courseQuery, [courseId]);
      if (courseResult.rows.length === 0) return null;
      
      const course = courseResult.rows[0];

      // Get direct prerequisites
      const prerequisites = await this.getCoursePrerequisites(courseId);

      // Recursively get prerequisite trees
      const treesWithChildren = await Promise.all(
        prerequisites.map(async (prereq) => ({
          ...prereq,
          children: await this.getPrerequisiteTree(prereq.prerequisite_id, depth + 1, visited)
        }))
      );

      return {
        id: courseId,
        ...course,
        prerequisites: treesWithChildren
      };
    } catch (err) {
      console.error('Error building prerequisite tree:', err);
      throw err;
    }
  }

  /**
   * Validate a registration request
   * Comprehensive check before allowing registration
   */
  async validateRegistration(studentId, courseId, semesterId) {
    try {
      const checks = {
        canRegister: null,
        creditHours: null,
        window: null,
        conflicts: null
      };

      // 1. Basic prerequisite check
      checks.canRegister = await this.canRegisterForCourse(studentId, courseId);
      if (!checks.canRegister.canRegister) {
        return { valid: false, errors: checks, blockingIssue: 'Prerequisites' };
      }

      // 2. Get course credit hours
      const courseQuery = `
        SELECT credit_hours FROM courses WHERE id = $1
      `;
      const creditResult = await db.query(courseQuery, [courseId]);
      checks.creditHours = creditResult.rows[0].credit_hours;

      // 3. Check registration window
      const windowQuery = `
        SELECT add_drop_deadline FROM semesters WHERE id = $1
      `;
      const windowResult = await db.query(windowQuery, [semesterId]);
      const deadline = new Date(windowResult.rows[0].add_drop_deadline);
      const now = new Date();
      checks.window = { open: now <= deadline };

      // 4. Check for schedule conflicts
      const conflictQuery = `
        SELECT COUNT(*) as conflictCount
        FROM student_registrations sr
        JOIN course_schedules cs1 ON sr.course_id = cs1.course_id
        JOIN course_schedules cs2 ON cs1.day = cs2.day
          AND cs1.start_time < cs2.end_time
          AND cs1.end_time > cs2.start_time
        WHERE sr.student_id = $1
          AND sr.semester_id = $2
          AND cs2.course_id = $3
      `;
      const conflictCountResult = await db.query(conflictQuery, [studentId, semesterId, courseId]);
      checks.conflicts = { hasConflicts: parseInt(conflictCountResult.rows[0].conflictCount) > 0 };

      const allValid = checks.canRegister.canRegister && 
                       checks.window.open && 
                       !checks.conflicts.hasConflicts;

      return {
        valid: allValid,
        checks,
        warnings: checks.conflicts.hasConflicts ? ['Schedule conflict detected'] : []
      };
    } catch (err) {
      console.error('Error validating registration:', err);
      throw err;
    }
  }
}

module.exports = new PrerequisiteCheckService();
