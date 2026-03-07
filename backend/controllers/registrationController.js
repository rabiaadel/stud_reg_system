const { pool } = require('../config/database');
const winston = require('winston');

class RegistrationController {
  // Get all registrations (Admin view)
  async getAllRegistrations(req, res) {
    try {
      const { page = 1, per_page = 20, semester_id, student_id } = req.query;

      let query = `
        SELECT
          sr.*,
          s.student_id as student_number,
          s.first_name_en,
          s.last_name_en,
          c.code as course_code,
          c.name_en as course_name,
          sem.semester_name,
          sem.academic_year
        FROM student_registrations sr
        JOIN students s ON sr.student_id = s.id
        JOIN courses c ON sr.course_id = c.id
        JOIN semesters sem ON sr.semester_id = sem.id
        WHERE 1=1
      `;

      const params = [];
      let paramCount = 1;

      if (semester_id) {
        query += ` AND sr.semester_id = $${paramCount}`;
        params.push(semester_id);
        paramCount++;
      }

      if (student_id) {
        query += ` AND sr.student_id = $${paramCount}`;
        params.push(student_id);
        paramCount++;
      }

      // Get total count
      const countQuery = query.replace(
        'SELECT sr.*, s.student_id as student_number, s.first_name_en, s.last_name_en, c.code as course_code, c.name_en as course_name, sem.semester_name, sem.academic_year',
        'SELECT COUNT(*) as total'
      );
      const countResult = await pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].total);

      // Add pagination
      const offset = (page - 1) * per_page;
      query += ` ORDER BY sem.start_date DESC, s.student_id, c.code`;
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(per_page, offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows.map(reg => ({
          id: reg.id,
          student_id: reg.student_number,
          student_name: `${reg.first_name_en} ${reg.last_name_en}`,
          course_code: reg.course_code,
          course_name: reg.course_name,
          semester: `${reg.semester_name} ${reg.academic_year}`,
          status: reg.status,
          registration_date: reg.registration_date,
          withdrawal_date: reg.withdrawal_date
        })),
        meta: {
          total: total,
          per_page: parseInt(per_page),
          current_page: parseInt(page),
          last_page: Math.ceil(total / per_page)
        }
      });
    } catch (error) {
      winston.error('Error getting all registrations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get registrations',
      });
    }
  }

  // Get registration statistics
  async getRegistrationStatistics(req, res) {
    try {
      // Total registrations
      const totalQuery = 'SELECT COUNT(*) as total FROM student_registrations';
      const totalResult = await pool.query(totalQuery);
      const totalRegistrations = parseInt(totalResult.rows[0].total);

      // Registrations by status
      const statusQuery = `
        SELECT status, COUNT(*) as count
        FROM student_registrations
        GROUP BY status
      `;
      const statusResult = await pool.query(statusQuery);

      // Active registrations this semester
      const activeQuery = `
        SELECT COUNT(*) as total
        FROM student_registrations sr
        JOIN semesters s ON sr.semester_id = s.id
        WHERE sr.status = 'Registered' AND s.is_active = true
      `;
      const activeResult = await pool.query(activeQuery);

      // Average credits per student
      const avgCreditsQuery = `
        SELECT AVG(total_credits) as avg_credits
        FROM (
          SELECT sr.student_id, SUM(c.credit_hours) as total_credits
          FROM student_registrations sr
          JOIN courses c ON sr.course_id = c.id
          WHERE sr.status = 'Registered'
          GROUP BY sr.student_id
        ) t
      `;
      const avgCreditsResult = await pool.query(avgCreditsQuery);

      res.json({
        success: true,
        data: {
          total_registrations: totalRegistrations,
          active_registrations: parseInt(activeResult.rows[0].total),
          registrations_by_status: statusResult.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count)
          })),
          average_credits_per_student: parseFloat(avgCreditsResult.rows[0].avg_credits || 0).toFixed(2)
        }
      });
    } catch (error) {
      winston.error('Error getting registration statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
      });
    }
  }
}

module.exports = new RegistrationController();