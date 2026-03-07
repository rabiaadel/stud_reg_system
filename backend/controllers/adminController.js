const { pool } = require('../config/database');
const winston = require('winston');

class AdminController {
  // Get dashboard statistics
  async getDashboardStatistics(req, res) {
    try {
      // Total students
      const studentsQuery = 'SELECT COUNT(*) as total FROM students WHERE is_active = true';
      const studentsResult = await pool.query(studentsQuery);

      // Active registrations
      const registrationsQuery = `
        SELECT COUNT(*) as total FROM student_registrations sr
        JOIN semesters s ON sr.semester_id = s.id
        WHERE sr.status = 'Registered' AND s.is_active = true
      `;
      const registrationsResult = await pool.query(registrationsQuery);

      // Students on warning
      const warningsQuery = 'SELECT COUNT(*) as total FROM student_academic_standing WHERE is_on_warning = true AND is_dismissed = false';
      const warningsResult = await pool.query(warningsQuery);

      // Dismissed students
      const dismissedQuery = 'SELECT COUNT(*) as total FROM students WHERE is_dismissed = true';
      const dismissedResult = await pool.query(dismissedQuery);

      // Active semesters
      const semestersQuery = 'SELECT COUNT(*) as total FROM semesters WHERE is_active = true';
      const semestersResult = await pool.query(semestersQuery);

      // Total faculties
      const facultiesQuery = 'SELECT COUNT(*) as total FROM faculties WHERE is_active = true';
      const facultiesResult = await pool.query(facultiesQuery);

      // Average GPA
      const avgGpaQuery = 'SELECT AVG(cgpa) as avg_gpa FROM students WHERE cgpa > 0';
      const avgGpaResult = await pool.query(avgGpaQuery);

      res.json({
        success: true,
        data: {
          total_students: parseInt(studentsResult.rows[0].total),
          active_registrations: parseInt(registrationsResult.rows[0].total),
          students_on_warning: parseInt(warningsResult.rows[0].total),
          dismissed_students: parseInt(dismissedResult.rows[0].total),
          active_semesters: parseInt(semestersResult.rows[0].total),
          total_faculties: parseInt(facultiesResult.rows[0].total),
          average_cgpa: parseFloat(avgGpaResult.rows[0].avg_gpa || 0).toFixed(2),
          timestamp: new Date()
        }
      });
    } catch (error) {
      winston.error('Error getting dashboard statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
      });
    }
  }

  // Get audit logs
  async getAuditLogs(req, res) {
    try {
      const { page = 1, from_date, to_date } = req.query;

      let query = 'SELECT * FROM audit_logs WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (from_date) {
        query += ` AND created_at >= $${paramCount}`;
        params.push(from_date);
        paramCount++;
      }

      if (to_date) {
        query += ` AND created_at <= $${paramCount}`;
        params.push(to_date);
        paramCount++;
      }

      const offset = (page - 1) * 50;
      query += ` ORDER BY created_at DESC LIMIT 50 OFFSET $${paramCount}`;
      params.push(offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows.map(log => ({
          id: log.id,
          user_id: log.user_id,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          old_value: log.old_value,
          new_value: log.new_value,
          ip_address: log.ip_address,
          created_at: log.created_at
        }))
      });
    } catch (error) {
      winston.error('Error getting audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get audit logs',
      });
    }
  }

  // Recalculate all GPA
  async recalculateAllGPA(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get all students
      const studentsQuery = 'SELECT id FROM students';
      const studentsResult = await client.query(studentsQuery);

      let updatedCount = 0;

      for (const student of studentsResult.rows) {
        // Calculate CGPA
        const cgpaQuery = `
          SELECT COALESCE(AVG(sg.grade_points), 0) as cgpa
          FROM student_grades sg
          WHERE sg.student_id = $1 AND sg.is_first_attempt = true
        `;

        const cgpaResult = await client.query(cgpaQuery, [student.id]);
        const cgpa = parseFloat(cgpaResult.rows[0].cgpa).toFixed(3);

        // Update student CGPA
        await client.query(
          'UPDATE students SET cgpa = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [cgpa, student.id]
        );

        updatedCount++;
      }

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, new_value, created_at)
        VALUES ('RECALCULATE_ALL_GPA', 'system', $1, CURRENT_TIMESTAMP)
      `;

      await client.query(auditQuery, [JSON.stringify({ updated_students: updatedCount })]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Successfully recalculated GPA for ${updatedCount} students`,
        data: {
          students_updated: updatedCount,
          timestamp: new Date()
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error recalculating GPA:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to recalculate GPA',
      });
    } finally {
      client.release();
    }
  }

  // Send notifications
  async sendNotifications(req, res) {
    try {
      const { recipient_type, title, message, faculty_id } = req.body;

      let recipientQuery = '';
      const params = [title, message];

      if (recipient_type === 'all') {
        recipientQuery = `
          INSERT INTO notifications (student_id, notification_type, title, message, created_at)
          SELECT id, 'Admin', $1, $2, CURRENT_TIMESTAMP FROM students WHERE is_active = true
        `;
      } else if (recipient_type === 'faculty' && faculty_id) {
        recipientQuery = `
          INSERT INTO notifications (student_id, notification_type, title, message, created_at)
          SELECT id, 'Admin', $1, $2, CURRENT_TIMESTAMP FROM students WHERE faculty_id = $3 AND is_active = true
        `;
        params.push(faculty_id);
      } else if (recipient_type === 'student' && req.body.student_id) {
        recipientQuery = `
          INSERT INTO notifications (student_id, notification_type, title, message, created_at)
          VALUES ($3, 'Admin', $1, $2, CURRENT_TIMESTAMP)
        `;
        params.push(req.body.student_id);
      }

      if (!recipientQuery) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recipient type or missing parameters',
        });
      }

      await pool.query(recipientQuery, params);

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, new_value, created_at)
        VALUES ('SEND_NOTIFICATIONS', 'notification', $1, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [JSON.stringify({ recipient_type, title, message })]);

      res.json({
        success: true,
        message: 'Notifications sent successfully'
      });
    } catch (error) {
      winston.error('Error sending notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notifications',
      });
    }
  }
}

module.exports = new AdminController();