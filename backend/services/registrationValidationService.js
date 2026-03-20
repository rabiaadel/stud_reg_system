const { pool } = require('../config/database');
const winston = require('winston');

class RegistrationValidationService {
  /**
   * Comprehensive registration validation based on Tanta University bylaws
   */
  async validateRegistration(studentId, courseIds, semesterId) {
    try {
      const validationResult = {
        is_valid: true,
        errors: [],
        warnings: [],
        eligible_courses: courseIds
      };

      // Get student info
      const studentQuery = `
        SELECT s.*, sp.total_credits, sas.is_dismissed, sas.is_on_warning
        FROM students s
        LEFT JOIN specializations sp ON s.specialization_id = sp.id
        LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
        WHERE s.id = $1
      `;
      const studentResult = await pool.query(studentQuery, [studentId]);
      if (studentResult.rows.length === 0) {
        validationResult.is_valid = false;
        validationResult.errors.push('Student not found');
        return validationResult;
      }
      const student = studentResult.rows[0];

      // Check 1: Student not dismissed
      if (student.is_dismissed) {
        validationResult.is_valid = false;
        validationResult.errors.push('Student has been dismissed from faculty');
        return validationResult;
      }

      if (student.is_active === false) {
        validationResult.is_valid = false;
        validationResult.errors.push('Student account is inactive');
        return validationResult;
      }

      // Get semester info
      const semesterQuery = 'SELECT * FROM semesters WHERE id = $1';
      const semesterResult = await pool.query(semesterQuery, [semesterId]);
      if (semesterResult.rows.length === 0) {
        validationResult.is_valid = false;
        validationResult.errors.push('Semester not found');
        return validationResult;
      }
      const semester = semesterResult.rows[0];

      // Check 2: Semester is active
      if (!semester.is_active) {
        validationResult.warnings.push('Semester is not currently active');
      }

      // Check 3: Credit hour limits
      const creditValidation = await this.validateCreditHours(studentId, courseIds, semester);
      if (!creditValidation.is_valid) {
        validationResult.is_valid = false;
        validationResult.errors.push(...creditValidation.errors);
      } else {
        validationResult.warnings.push(...creditValidation.warnings);
      }

      // Check 4: Faculty/specialization constraints
      const constraintValidation = await this.validateRegistrationConstraints(student, creditValidation.totalCredits);
      if (!constraintValidation.is_valid) {
        validationResult.is_valid = false;
        validationResult.errors.push(...constraintValidation.errors);
      } else {
        validationResult.warnings.push(...constraintValidation.warnings);
      }

      // Check 5: Prerequisites
      const prerequisiteValidation = await this.validatePrerequisites(studentId, courseIds);
      if (!prerequisiteValidation.is_valid) {
        validationResult.is_valid = false;
        validationResult.errors.push(...prerequisiteValidation.errors);
        validationResult.eligible_courses = prerequisiteValidation.eligible_courses;
      }

      // Check 6: Attendance eligibility
      const attendanceValidation = await this.validateAttendance(studentId);
      if (!attendanceValidation.is_valid) {
        validationResult.warnings.push(...attendanceValidation.warnings);
      }

      // Check 7: Duplicate registration
      const duplicateValidation = await this.validateDuplicateRegistration(studentId, courseIds, semesterId);
      if (!duplicateValidation.is_valid) {
        validationResult.errors.push(...duplicateValidation.errors);
        validationResult.is_valid = false;
      }

      return validationResult;
    } catch (error) {
      winston.error('Error validating registration:', error);
      throw error;
    }
  }

  /**
   * Validate credit hours based on student level and CGPA
   */
  async validateCreditHours(studentId, courseIds, semester) {
    try {
      const result = {
        is_valid: true,
        errors: [],
        warnings: []
      };

      // Get course credit hours
      const coursesQuery = `
        SELECT SUM(credit_hours) as total_credits
        FROM courses
        WHERE id = ANY($1)
      `;
      const coursesResult = await pool.query(coursesQuery, [courseIds]);
      const totalCredits = parseInt(coursesResult.rows[0].total_credits) || 0;
      result.totalCredits = totalCredits;

      // Get student CGPA
      const cgpaQuery = `
        SELECT COALESCE(AVG(sg.grade_points), 0) as cgpa
        FROM student_grades sg
        WHERE sg.student_id = $1 AND sg.is_first_attempt = true
      `;
      const cgpaResult = await pool.query(cgpaQuery, [studentId]);
      const cgpa = parseFloat(cgpaResult.rows[0].cgpa);

      // Get registration constraints for student's specialization
      const constraintsQuery = `
        SELECT * FROM registration_constraints
        WHERE specialization_id = (SELECT specialization_id FROM students WHERE id = $1)
          AND academic_level = $2
        LIMIT 1
      `;
      
      // Determine academic level (1-4)
      const creditsPassedQuery = `
        SELECT COALESCE(SUM(c.credit_hours), 0) as credits_passed
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1 AND sg.grade_points >= 1.0
      `;
      const creditsPassedResult = await pool.query(creditsPassedQuery, [studentId]);
      const creditsPassed = parseInt(creditsPassedResult.rows[0].credits_passed);

      let academicLevel = 1; // Freshman
      if (creditsPassed >= 90) academicLevel = 4; // Senior
      else if (creditsPassed >= 60) academicLevel = 3; // Junior
      else if (creditsPassed >= 30) academicLevel = 2; // Sophomore

      const constraintsResult = await pool.query(constraintsQuery, [studentId, academicLevel]);
      const constraints = constraintsResult.rows[0];

      // Credit limits by CGPA and level
      let maxCredits = 20; // Default
      let minCredits = 2;

      if (constraints) {
        minCredits = constraints.min_credits || 2;
        maxCredits = constraints.max_credits || 20;
      } else {
        // Use bylaw defaults based on CGPA
        if (academicLevel === 1) maxCredits = 27; // Freshman
        else if (academicLevel === 2) maxCredits = 30; // Sophomore
        else if (academicLevel === 3) maxCredits = 22; // Junior
        else maxCredits = 132; // Senior (for graduation)

        // Adjust based on CGPA
        if (cgpa >= 3.0) maxCredits = 70;
        else if (cgpa < 2.5) maxCredits = 40;
      }

      // Summer semester has different limits
      if (semester.semester_name === 'Summer' || semester.semester_number === 3) {
        minCredits = 2;
        maxCredits = 7;
      }

      // Validate
      if (totalCredits < minCredits) {
        result.errors.push(`Minimum credit hours required: ${minCredits}. You have selected ${totalCredits}`);
        result.is_valid = false;
      }

      if (totalCredits > maxCredits) {
        result.errors.push(`Maximum credit hours allowed: ${maxCredits}. You have selected ${totalCredits}`);
        result.is_valid = false;
      }

      return result;
    } catch (error) {
      winston.error('Error validating credit hours:', error);
      throw error;
    }
  }

  /**
   * Validate specialization-level registration constraints
   */
  async validateRegistrationConstraints(student, totalCredits) {
    try {
      const result = { is_valid: true, errors: [], warnings: [] };
      if (!student.specialization_id) return result;

      const constraintsQuery = `
        SELECT *
        FROM registration_constraints
        WHERE specialization_id = $1
          AND (academic_level IS NULL OR academic_level = $2)
        ORDER BY academic_level NULLS LAST
        LIMIT 1
      `;

      const constraintsRes = await pool.query(constraintsQuery, [student.specialization_id, student.current_level]);
      if (constraintsRes.rows.length === 0) return result;

      const constraints = constraintsRes.rows[0];

      if (constraints.min_credits && totalCredits < constraints.min_credits) {
        result.is_valid = false;
        result.errors.push(`Minimum credits for this level is ${constraints.min_credits}. You selected ${totalCredits}.`);
      }
      if (constraints.max_credits && totalCredits > constraints.max_credits) {
        result.is_valid = false;
        result.errors.push(`Maximum credits for this level is ${constraints.max_credits}. You selected ${totalCredits}.`);
      }
      if (constraints.min_cgpa && student.cgpa < constraints.min_cgpa) {
        result.is_valid = false;
        result.errors.push(`Minimum CGPA required is ${constraints.min_cgpa.toFixed(2)}. Current CGPA is ${student.cgpa}.`);
      }
      if (constraints.max_cgpa && student.cgpa > constraints.max_cgpa) {
        result.warnings.push(`CGPA exceeds expected maximum (${constraints.max_cgpa}).`);
      }

      return result;
    } catch (error) {
      winston.error('Error validating registration constraints:', error);
      throw error;
    }
  }

  /**
   * Validate prerequisites for courses
   */
  async validatePrerequisites(studentId, courseIds) {
    try {
      const result = {
        is_valid: true,
        errors: [],
        eligible_courses: courseIds
      };

      // Get prerequisites for courses
      const prereqQuery = `
        SELECT 
          cp.course_id,
          cp.prerequisite_course_id,
          cp.min_grade,
          c.code as course_code,
          pc.code as prerequisite_code
        FROM course_prerequisites cp
        JOIN courses c ON cp.course_id = c.id
        JOIN courses pc ON cp.prerequisite_course_id = pc.id
        WHERE cp.course_id = ANY($1)
      `;

      const prereqResult = await pool.query(prereqQuery, [courseIds]);
      const prerequisites = prereqResult.rows;

      if (prerequisites.length === 0) {
        return result;
      }

      // Check each prerequisite
      for (const prereq of prerequisites) {
        const studentGradeQuery = `
          SELECT MAX(grade_points) as best_grade
          FROM student_grades
          WHERE student_id = $1 AND course_id = $2 AND grade_points >= 1.0
          LIMIT 1
        `;

        const studentGradeResult = await pool.query(studentGradeQuery, [studentId, prereq.prerequisite_course_id]);
        
        if (studentGradeResult.rows.length === 0 || studentGradeResult.rows[0].best_grade === null) {
          result.is_valid = false;
          result.errors.push(
            `Course ${prereq.course_code} requires passing ${prereq.prerequisite_code} first`
          );
          // Remove the course from eligible courses
          result.eligible_courses = result.eligible_courses.filter(cid => cid !== prereq.course_id);
        } else if (prereq.min_grade && studentGradeResult.rows[0].best_grade < prereq.min_grade) {
          result.is_valid = false;
          result.errors.push(
            `Course ${prereq.course_code} requires minimum grade of ${prereq.min_grade} in ${prereq.prerequisite_code}`
          );
          result.eligible_courses = result.eligible_courses.filter(cid => cid !== prereq.course_id);
        }
      }

      return result;
    } catch (error) {
      winston.error('Error validating prerequisites:', error);
      throw error;
    }
  }

  /**
   * Validate attendance eligibility (min 42%)
   */
  async validateAttendance(studentId) {
    try {
      const result = {
        is_valid: true,
        warnings: []
      };

      // Get current semester attendance
      const attendanceQuery = `
        SELECT COUNT(*) as total_with_low_attendance
        FROM attendance_records
        WHERE student_id = $1 AND attendance_percentage < 42
      `;

      const attendanceResult = await pool.query(attendanceQuery, [studentId]);
      const lowAttendanceCourses = parseInt(attendanceResult.rows[0].total_with_low_attendance);

      if (lowAttendanceCourses > 0) {
        result.warnings.push(
          `You have low attendance in ${lowAttendanceCourses} course(s). Attendance must be at least 42% to enter final exam`
        );
      }

      return result;
    } catch (error) {
      winston.error('Error validating attendance:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate registrations
   */
  async validateDuplicateRegistration(studentId, courseIds, semesterId) {
    try {
      const result = {
        is_valid: true,
        errors: []
      };

      // Check for existing registrations
      const duplicateQuery = `
        SELECT DISTINCT c.code
        FROM student_registrations sr
        JOIN courses c ON sr.course_id = c.id
        WHERE sr.student_id = $1 
          AND sr.semester_id = $2 
          AND sr.course_id = ANY($3)
          AND sr.status = 'Registered'
      `;

      const duplicateResult = await pool.query(duplicateQuery, [studentId, semesterId, courseIds]);
      
      if (duplicateResult.rows.length > 0) {
        const duplicateCodes = duplicateResult.rows.map(r => r.code).join(', ');
        result.is_valid = false;
        result.errors.push(
          `You are already registered for the following course(s) in this semester: ${duplicateCodes}`
        );
      }

      return result;
    } catch (error) {
      winston.error('Error validating duplicate registration:', error);
      throw error;
    }
  }
}

module.exports = RegistrationValidationService;
