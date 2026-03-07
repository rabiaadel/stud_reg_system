const { pool } = require('../config/database');
const winston = require('winston');

class CourseController {
  // Get courses list
  async getCourses(req, res) {
    try {
      const { faculty_id, specialization_id, level, page = 1, per_page = 20 } = req.query;

      let query = `
        SELECT
          c.id,
          c.code,
          c.name_en,
          c.name_ar,
          c.description,
          c.credit_hours,
          c.level,
          c.is_mandatory,
          c.category_id,
          cc.name_en as category_name,
          c.is_active
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.faculty_id = $1 AND c.is_active = true
      `;

      const params = [faculty_id];
      let paramCount = 2;

      if (specialization_id) {
        query += ` AND c.specialization_id = $${paramCount}`;
        params.push(specialization_id);
        paramCount++;
      }

      if (level) {
        query += ` AND c.level = $${paramCount}`;
        params.push(level);
        paramCount++;
      }

      // Get total count
      const countQuery = query.replace('SELECT c.id, c.code, c.name_en, c.name_ar, c.description, c.credit_hours, c.level, c.is_mandatory, c.category_id, cc.name_en as category_name, c.is_active', 'SELECT COUNT(*) as total');
      const countResult = await pool.query(countQuery, params.slice(0, paramCount - 1));
      const total = parseInt(countResult.rows[0].total);

      // Add pagination
      const offset = (page - 1) * per_page;
      query += ` ORDER BY c.level, c.code LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(per_page, offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows.map(course => ({
          id: course.id,
          code: course.code,
          name: course.name_en,
          credit_hours: course.credit_hours,
          level: course.level,
          is_mandatory: course.is_mandatory,
          category: course.category_name,
          description: course.description,
          is_active: course.is_active
        })),
        meta: {
          total: total,
          per_page: parseInt(per_page),
          current_page: parseInt(page),
          last_page: Math.ceil(total / per_page),
          from: offset + 1,
          to: Math.min(offset + parseInt(per_page), total)
        }
      });
    } catch (error) {
      winston.error('Error getting courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get courses',
      });
    }
  }

  // Get course details
  async getCourseDetails(req, res) {
    try {
      const { courseId } = req.params;

      const courseQuery = `
        SELECT
          c.*,
          cc.name_en as category_name,
          cc.name_ar as category_name_ar
        FROM courses c
        LEFT JOIN course_categories cc ON c.category_id = cc.id
        WHERE c.id = $1
      `;

      const courseResult = await pool.query(courseQuery, [courseId]);

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const course = courseResult.rows[0];

      // Get prerequisites
      const prereqQuery = `
        SELECT
          c.id,
          c.code,
          c.name_en,
          c.name_ar,
          cp.min_grade,
          cp.is_strict
        FROM course_prerequisites cp
        JOIN courses c ON cp.prerequisite_course_id = c.id
        WHERE cp.course_id = $1
        ORDER BY c.code
      `;

      const prereqResult = await pool.query(prereqQuery, [courseId]);

      // Get dependent courses
      const dependentQuery = `
        SELECT
          c.id,
          c.code,
          c.name_en,
          c.name_ar
        FROM course_prerequisites cp
        JOIN courses c ON cp.course_id = c.id
        WHERE cp.prerequisite_course_id = $1
        ORDER BY c.code
      `;

      const dependentResult = await pool.query(dependentQuery, [courseId]);

      // Get schedules
      const scheduleQuery = `
        SELECT
          cs.*,
          s.semester_name,
          s.academic_year
        FROM course_schedules cs
        JOIN semesters s ON cs.semester_id = s.id
        WHERE cs.course_id = $1 AND cs.is_active = true
        ORDER BY s.start_date DESC
      `;

      const scheduleResult = await pool.query(scheduleQuery, [courseId]);

      res.json({
        success: true,
        data: {
          id: course.id,
          code: course.code,
          name_en: course.name_en,
          name_ar: course.name_ar,
          description: course.description,
          credit_hours: course.credit_hours,
          level: course.level,
          is_mandatory: course.is_mandatory,
          min_passing_grade: course.min_passing_grade,
          category: {
            id: course.category_id,
            name_en: course.category_name,
            name_ar: course.category_name_ar
          },
          prerequisites: prereqResult.rows.map(p => ({
            id: p.id,
            code: p.code,
            name_en: p.name_en,
            name_ar: p.name_ar,
            min_grade: p.min_grade,
            is_strict: p.is_strict
          })),
          dependent_courses: dependentResult.rows.map(d => ({
            id: d.id,
            code: d.code,
            name_en: d.name_en,
            name_ar: d.name_ar
          })),
          schedules: scheduleResult.rows.map(s => ({
            section: s.section,
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            location: s.location,
            instructor_id: s.instructor_id,
            capacity: s.capacity,
            enrolled_count: s.enrolled_count,
            semester: `${s.semester_name} ${s.academic_year}`
          })),
          is_active: course.is_active
        }
      });
    } catch (error) {
      winston.error('Error getting course details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course details',
      });
    }
  }

  // Check prerequisites
  async checkPrerequisites(req, res) {
    try {
      const { courseId } = req.params;
      const { student_id } = req.query;

      // Get course prerequisites
      const prereqQuery = `
        SELECT
          c.id,
          c.code,
          c.name_en,
          cp.min_grade,
          cp.is_strict
        FROM course_prerequisites cp
        JOIN courses c ON cp.prerequisite_course_id = c.id
        WHERE cp.course_id = $1
        ORDER BY c.code
      `;

      const prereqResult = await pool.query(prereqQuery, [courseId]);

      if (!student_id) {
        return res.json({
          success: true,
          data: {
            course_id: courseId,
            prerequisites: prereqResult.rows,
            can_register: null, // Cannot determine without student
            unmet_prerequisites: []
          }
        });
      }

      // Check student's grades for prerequisites
      const unmetPrerequisites = [];

      for (const prereq of prereqResult.rows) {
        const gradeQuery = `
          SELECT
            sg.grade_points,
            sg.grade_letter,
            c.code as course_code,
            c.name_en as course_name
          FROM student_grades sg
          JOIN student_registrations sr ON sg.student_registration_id = sr.id
          JOIN courses c ON sr.course_id = c.id
          WHERE sr.student_id = $1 AND sr.course_id = $2 AND sg.is_first_attempt = true
          ORDER BY sg.created_at DESC
          LIMIT 1
        `;

        const gradeResult = await pool.query(gradeQuery, [student_id, prereq.id]);

        if (gradeResult.rows.length === 0) {
          unmetPrerequisites.push({
            ...prereq,
            reason: 'Not taken'
          });
        } else {
          const grade = gradeResult.rows[0];
          if (grade.grade_points < prereq.min_grade) {
            unmetPrerequisites.push({
              ...prereq,
              student_grade: grade.grade_letter,
              student_grade_points: grade.grade_points,
              reason: `Grade below minimum (${prereq.min_grade})`
            });
          } else {
            prereq.student_grade = grade.grade_letter;
            prereq.student_grade_points = grade.grade_points;
            prereq.is_met = true;
          }
        }
      }

      const canRegister = unmetPrerequisites.length === 0;

      res.json({
        success: true,
        data: {
          course_id: courseId,
          student_id: student_id,
          can_register: canRegister,
          prerequisites: prereqResult.rows.map(p => ({
            id: p.id,
            code: p.code,
            name_en: p.name_en,
            min_grade: p.min_grade,
            is_strict: p.is_strict,
            student_grade: p.student_grade,
            student_grade_points: p.student_grade_points,
            is_met: p.is_met || false
          })),
          unmet_prerequisites: unmetPrerequisites
        }
      });
    } catch (error) {
      winston.error('Error checking prerequisites:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check prerequisites',
      });
    }
  }
}

module.exports = new CourseController();