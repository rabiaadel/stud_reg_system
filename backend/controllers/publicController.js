const { pool } = require('../config/database');
const winston = require('winston');

class PublicController {
  async getFaculties(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, code, name_en, name_ar
         FROM faculties
         WHERE is_active = true
         ORDER BY name_en`
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      winston.error('Error getting faculties:', error);
      res.status(500).json({ success: false, message: 'Failed to load faculties' });
    }
  }

  async getDepartments(req, res) {
    try {
      const { faculty_id } = req.query;
      if (!faculty_id) {
        return res.status(400).json({ success: false, message: 'faculty_id is required' });
      }

      const result = await pool.query(
        `SELECT id, code, name_en, name_ar
         FROM departments
         WHERE faculty_id = $1 AND is_active = true
         ORDER BY name_en`,
        [faculty_id]
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      winston.error('Error getting departments:', error);
      res.status(500).json({ success: false, message: 'Failed to load departments' });
    }
  }

  async getSpecializations(req, res) {
    try {
      const { department_id } = req.query;
      if (!department_id) {
        return res.status(400).json({ success: false, message: 'department_id is required' });
      }

      const result = await pool.query(
        `SELECT id, code, name_en, name_ar
         FROM specializations
         WHERE department_id = $1 AND is_active = true
         ORDER BY name_en`,
        [department_id]
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      winston.error('Error getting specializations:', error);
      res.status(500).json({ success: false, message: 'Failed to load specializations' });
    }
  }
}

module.exports = new PublicController();
