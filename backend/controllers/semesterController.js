const { pool } = require('../config/database');
const winston = require('winston');

class SemesterController {
  // Get semesters
  async getSemesters(req, res) {
    try {
      const { faculty_id, page = 1 } = req.query;

      const query = `
        SELECT id, academic_year, semester_name, semester_number, start_date, end_date, is_active
        FROM semesters
        WHERE faculty_id = $1
        ORDER BY start_date DESC
        LIMIT 20 OFFSET $2
      `;

      const offset = (page - 1) * 20;
      const result = await pool.query(query, [faculty_id, offset]);

      res.json({
        success: true,
        data: result.rows.map(semester => ({
          id: semester.id,
          academic_year: semester.academic_year,
          semester_name: semester.semester_name,
          semester_number: semester.semester_number,
          start_date: semester.start_date,
          end_date: semester.end_date,
          is_active: semester.is_active,
          full_name: `${semester.semester_name} ${semester.academic_year}`
        }))
      });
    } catch (error) {
      winston.error('Error getting semesters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get semesters',
      });
    }
  }

  // Get active semester
  async getActiveSemester(req, res) {
    try {
      const { faculty_id } = req.query;

      const query = `
        SELECT id, academic_year, semester_name, semester_number, start_date, end_date, is_active
        FROM semesters
        WHERE faculty_id = $1 AND is_active = true
        LIMIT 1
      `;

      const result = await pool.query(query, [faculty_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active semester found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      winston.error('Error getting active semester:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active semester',
      });
    }
  }

  // Get semester details
  async getSemesterDetails(req, res) {
    try {
      const { semesterId } = req.params;

      const query = `
        SELECT * FROM semesters WHERE id = $1
      `;

      const result = await pool.query(query, [semesterId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Semester not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      winston.error('Error getting semester details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get semester details',
      });
    }
  }

  // Get semester deadlines
  async getSemesterDeadlines(req, res) {
    try {
      const { semesterId } = req.params;

      const query = `
        SELECT * FROM semester_deadlines
        WHERE semester_id = $1
        ORDER BY deadline_date ASC
      `;

      const result = await pool.query(query, [semesterId]);

      res.json({
        success: true,
        data: result.rows.map(deadline => ({
          id: deadline.id,
          deadline_code: deadline.deadline_code,
          deadline_name: deadline.deadline_name,
          deadline_date: deadline.deadline_date,
          deadline_week: deadline.deadline_week,
          description: deadline.description,
          days_until_deadline: Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24))
        }))
      });
    } catch (error) {
      winston.error('Error getting semester deadlines:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get semester deadlines',
      });
    }
  }
}

module.exports = new SemesterController();