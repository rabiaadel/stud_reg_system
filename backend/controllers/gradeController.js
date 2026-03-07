const { pool } = require('../config/database');
const winston = require('winston');

class GradeController {
  // Get student grades (from studentController - integrate here for simplicity)
  async getStudentGrades(req, res) {
    try {
      const { studentId } = req.params;
      const { semester_id, course_id, include_history } = req.query;

      let query = `
        SELECT
          sg.*,
          c.code as course_code,
          c.name_en as course_name,
          c.credit_hours,
          s.semester_name,
          s.academic_year
        FROM student_grades sg
        JOIN student_registrations sr ON sg.student_registration_id = sr.id
        JOIN courses c ON sg.course_id = c.id
        JOIN semesters s ON sg.semester_id = s.id
        WHERE sg.student_id = $1
      `;

      const params = [studentId];
      let paramCount = 2;

      if (semester_id) {
        query += ` AND sg.semester_id = $${paramCount}`;
        params.push(semester_id);
        paramCount++;
      }

      if (course_id) {
        query += ` AND sg.course_id = $${paramCount}`;
        params.push(course_id);
        paramCount++;
      }

      if (!include_history || include_history === 'false') {
        query += ` AND sg.is_first_attempt = true`;
      }

      query += ` ORDER BY s.start_date DESC, c.code`;

      const result = await pool.query(query, params);
      const grades = result.rows;

      res.json({
        success: true,
        data: {
          student_id: studentId,
          total_courses: grades.length,
          courses_passed: grades.filter(g => g.grade_points >= 1.0).length,
          grades: grades.map(grade => ({
            id: grade.id,
            semester: `${grade.semester_name} ${grade.academic_year}`,
            course_code: grade.course_code,
            course_name: grade.course_name,
            credit_hours: grade.credit_hours,
            coursework_score: grade.coursework_score,
            midterm_score: grade.midterm_score,
            final_exam_score: grade.final_exam_score,
            total_score: grade.total_score,
            grade_letter: grade.grade_letter,
            grade_points: grade.grade_points,
            is_first_attempt: grade.is_first_attempt
          }))
        }
      });
    } catch (error) {
      winston.error('Error getting student grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get student grades',
      });
    }
  }

  // Post grade
  async postGrade(req, res) {
    try {
      const { student_registration_id, coursework_score, midterm_score, final_exam_score } = req.body;

      // Validate scores
      if (final_exam_score < 0 || final_exam_score > 100) {
        return res.status(400).json({
          success: false,
          message: 'Final exam score must be between 0 and 100',
        });
      }

      // Get registration info
      const registrationQuery = `
        SELECT sr.*, c.credit_hours, s.id as student_id
        FROM student_registrations sr
        JOIN courses c ON sr.course_id = c.id
        JOIN students s ON sr.student_id = s.id
        WHERE sr.id = $1
      `;

      const registrationResult = await pool.query(registrationQuery, [student_registration_id]);

      if (registrationResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      const registration = registrationResult.rows[0];

      // Calculate total score: 40% coursework + 60% final
      const courseworkPercent = coursework_score ? coursework_score * 0.40 : 0;
      const finalPercent = final_exam_score * 0.60;
      const totalScore = courseworkPercent + finalPercent;

      // Get grading scale
      const scalingQuery = `
        SELECT * FROM grading_scales
        WHERE faculty_id = (SELECT faculty_id FROM students WHERE id = $1)
        AND min_percentage <= $2 AND max_percentage >= $2
        LIMIT 1
      `;

      const scalingResult = await pool.query(scalingQuery, [registration.student_id, totalScore]);
      const gradeScale = scalingResult.rows[0];

      // Create/update grade
      const gradeQuery = `
        INSERT INTO student_grades
        (student_registration_id, student_id, course_id, semester_id, coursework_score, midterm_score, final_exam_score, total_score, grade_letter, grade_points, is_first_attempt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        ON CONFLICT (student_registration_id)
        DO UPDATE SET
          coursework_score = $5,
          midterm_score = $6,
          final_exam_score = $7,
          total_score = $8,
          grade_letter = $9,
          grade_points = $10,
          is_first_attempt = true
        RETURNING *
      `;

      const gradeResult = await pool.query(gradeQuery, [
        student_registration_id,
        registration.student_id,
        registration.course_id,
        registration.semester_id,
        coursework_score || 0,
        midterm_score || 0,
        final_exam_score,
        totalScore,
        gradeScale ? gradeScale.grade_letter : 'F',
        gradeScale ? gradeScale.grade_points : 0
      ]);

      const grade = gradeResult.rows[0];

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, entity_id, new_value, created_at)
        VALUES ('POST_GRADE', 'grade', $1, $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [grade.id, JSON.stringify(grade)]);

      res.status(201).json({
        success: true,
        message: 'Grade posted successfully',
        data: {
          id: grade.id,
          student_registration_id: grade.student_registration_id,
          total_score: grade.total_score,
          grade_letter: grade.grade_letter,
          grade_points: grade.grade_points
        }
      });
    } catch (error) {
      winston.error('Error posting grade:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to post grade',
      });
    }
  }

  // Update grade
  async updateGrade(req, res) {
    try {
      const { gradeId } = req.params;
      const { coursework_score, midterm_score, final_exam_score } = req.body;

      // Get current grade
      const gradeQuery = 'SELECT * FROM student_grades WHERE id = $1';
      const gradeResult = await pool.query(gradeQuery, [gradeId]);

      if (gradeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Grade not found',
        });
      }

      const currentGrade = gradeResult.rows[0];
      const newCourseworkScore = coursework_score !== undefined ? coursework_score : currentGrade.coursework_score;
      const newMidtermScore = midterm_score !== undefined ? midterm_score : currentGrade.midterm_score;
      const newFinalExamScore = final_exam_score !== undefined ? final_exam_score : currentGrade.final_exam_score;

      // Recalculate total
      const totalScore = (newCourseworkScore * 0.40) + (newFinalExamScore * 0.60);

      // Get new grade letter
      const scaleQuery = `
        SELECT * FROM grading_scales
        WHERE faculty_id = (SELECT faculty_id FROM students WHERE id = $1)
        AND min_percentage <= $2 AND max_percentage >= $2
        LIMIT 1
      `;

      const scaleResult = await pool.query(scaleQuery, [currentGrade.student_id, totalScore]);
      const gradeScale = scaleResult.rows[0];

      // Update grade
      const updateQuery = `
        UPDATE student_grades
        SET
          coursework_score = $1,
          midterm_score = $2,
          final_exam_score = $3,
          total_score = $4,
          grade_letter = $5,
          grade_points = $6
        WHERE id = $7
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, [
        newCourseworkScore,
        newMidtermScore,
        newFinalExamScore,
        totalScore,
        gradeScale ? gradeScale.grade_letter : 'F',
        gradeScale ? gradeScale.grade_points : 0,
        gradeId
      ]);

      const updatedGrade = updateResult.rows[0];

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, entity_id, old_value, new_value, created_at)
        VALUES ('UPDATE_GRADE', 'grade', $1, $2, $3, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [gradeId, JSON.stringify(currentGrade), JSON.stringify(updatedGrade)]);

      res.json({
        success: true,
        message: 'Grade updated successfully',
        data: {
          id: updatedGrade.id,
          total_score: updatedGrade.total_score,
          grade_letter: updatedGrade.grade_letter,
          grade_points: updatedGrade.grade_points
        }
      });
    } catch (error) {
      winston.error('Error updating grade:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update grade',
      });
    }
  }
}

module.exports = new GradeController();