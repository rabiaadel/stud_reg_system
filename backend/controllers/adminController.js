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

      // Total courses
      const coursesQuery = 'SELECT COUNT(*) as total FROM courses WHERE is_active = true';
      const coursesResult = await pool.query(coursesQuery);

      // Graduation eligible
      const graduationQuery = 'SELECT COUNT(*) as total FROM graduation_eligibility WHERE is_eligible = true';
      const graduationResult = await pool.query(graduationQuery);

      res.json({
        success: true,
        data: {
          total_students: parseInt(studentsResult.rows[0].total),
          active_registrations: parseInt(registrationsResult.rows[0].total),
          students_on_warning: parseInt(warningsResult.rows[0].total),
          academic_warnings: parseInt(warningsResult.rows[0].total),
          dismissed_students: parseInt(dismissedResult.rows[0].total),
          active_semesters: parseInt(semestersResult.rows[0].total),
          total_faculties: parseInt(facultiesResult.rows[0].total),
          total_courses: parseInt(coursesResult.rows[0].total),
          graduation_eligible: parseInt(graduationResult.rows[0].total),
          average_gpa: parseFloat(avgGpaResult.rows[0].avg_gpa || 0),
          average_cgpa: parseFloat(avgGpaResult.rows[0].avg_gpa || 0),
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

      let query = `
        SELECT al.*, u.email as user_email
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE 1=1
      `;
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
          user_email: log.user_email || null,
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          old_value: log.old_value,
          new_value: log.new_value,
          changes: log.new_value ? JSON.stringify(log.new_value) : (log.old_value ? JSON.stringify(log.old_value) : null),
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

  // List account requests
  async getAccountRequests(req, res) {
    try {
      const { status = 'pending', role, faculty_id, search } = req.query;

      let query = `
        SELECT
          ar.*,
          f.name_en as faculty_name,
          d.name_en as department_name,
          sp.name_en as specialization_name,
          u.email as reviewed_by_email
        FROM account_requests ar
        LEFT JOIN faculties f ON ar.faculty_id = f.id
        LEFT JOIN departments d ON ar.department_id = d.id
        LEFT JOIN specializations sp ON ar.specialization_id = sp.id
        LEFT JOIN users u ON ar.reviewed_by = u.id
        WHERE 1 = 1
      `;
      const params = [];
      let paramCount = 1;

      if (status) {
        query += ` AND ar.status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (role) {
        query += ` AND ar.role = $${paramCount}`;
        params.push(role);
        paramCount++;
      }

      if (faculty_id) {
        query += ` AND ar.faculty_id = $${paramCount}`;
        params.push(faculty_id);
        paramCount++;
      }

      if (search) {
        query += ` AND (
          ar.email ILIKE $${paramCount}
          OR ar.first_name_en ILIKE $${paramCount}
          OR ar.last_name_en ILIKE $${paramCount}
          OR ar.student_id ILIKE $${paramCount}
          OR ar.employee_id ILIKE $${paramCount}
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ' ORDER BY ar.requested_at DESC';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      winston.error('Error getting account requests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get account requests',
      });
    }
  }

  // Approve account request
  async approveAccountRequest(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { requestId } = req.params;
      const { eligibility_status, eligibility_notes } = req.body || {};

      const requestResult = await client.query(
        'SELECT * FROM account_requests WHERE id = $1 FOR UPDATE',
        [requestId]
      );

      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Request not found' });
      }

      const request = requestResult.rows[0];
      if (request.status !== 'pending') {
        await client.query('ROLLBACK');
        return res.status(400).json({ success: false, message: 'Request already processed' });
      }

      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, faculty_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)
         RETURNING id, email, role, faculty_id, first_name, last_name`,
        [
          request.email,
          request.password_hash,
          request.first_name_en,
          request.last_name_en,
          request.role,
          request.faculty_id,
        ]
      );

      const user = userInsert.rows[0];
      let profile = null;

      if (request.role === 'student') {
        const studentInsert = await client.query(
          `INSERT INTO students (
             user_id, faculty_id, specialization_id, student_id, first_name_en, last_name_en,
             first_name_ar, last_name_ar, email, phone, national_id, date_of_birth, gender,
             admission_date, admission_type, is_active
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_DATE, $14, TRUE)
           RETURNING *`,
          [
            user.id,
            request.faculty_id,
            request.specialization_id,
            request.student_id,
            request.first_name_en,
            request.last_name_en,
            request.first_name_ar,
            request.last_name_ar,
            request.email,
            request.phone,
            request.national_id,
            request.date_of_birth,
            request.gender,
            request.admission_type,
          ]
        );
        profile = studentInsert.rows[0];
      }

      if (request.role === 'doctor') {
        const instructorInsert = await client.query(
          `INSERT INTO instructors (
             user_id, faculty_id, first_name_en, last_name_en, first_name_ar, last_name_ar,
             email, phone, employee_id, title, department_id, is_active
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
           RETURNING *`,
          [
            user.id,
            request.faculty_id,
            request.first_name_en,
            request.last_name_en,
            request.first_name_ar,
            request.last_name_ar,
            request.email,
            request.phone,
            request.employee_id,
            request.title,
            request.department_id,
          ]
        );
        profile = instructorInsert.rows[0];
      }

      await client.query(
        `UPDATE account_requests
         SET status = 'approved',
             reviewed_at = CURRENT_TIMESTAMP,
             reviewed_by = $2,
             approved_user_id = $3,
             eligibility_status = $4,
             eligibility_notes = $5
         WHERE id = $1`,
        [
          requestId,
          req.user.id,
          user.id,
          eligibility_status || 'verified',
          eligibility_notes || null,
        ]
      );

      await client.query(
        `INSERT INTO admin_activity_logs (admin_id, action_type, entity_type, entity_id, after_value, status, created_at)
         VALUES ($1, 'APPROVE_ACCOUNT_REQUEST', 'account_request', $2, $3, 'Success', CURRENT_TIMESTAMP)`,
        [req.user.id, requestId, JSON.stringify({ user, profile })]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Account request approved',
        data: { user, profile },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error approving account request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to approve account request',
      });
    } finally {
      client.release();
    }
  }

  // Reject account request
  async rejectAccountRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason, eligibility_status, eligibility_notes } = req.body || {};

      const result = await pool.query(
        `UPDATE account_requests
         SET status = 'rejected',
             reviewed_at = CURRENT_TIMESTAMP,
             reviewed_by = $2,
             rejection_reason = $3,
             eligibility_status = $4,
             eligibility_notes = $5
         WHERE id = $1 AND status = 'pending'
         RETURNING *`,
        [
          requestId,
          req.user.id,
          reason || 'Rejected by admin',
          eligibility_status || 'failed',
          eligibility_notes || null,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Request not found or already processed' });
      }

      await pool.query(
        `INSERT INTO admin_activity_logs (admin_id, action_type, entity_type, entity_id, after_value, status, created_at)
         VALUES ($1, 'REJECT_ACCOUNT_REQUEST', 'account_request', $2, $3, 'Success', CURRENT_TIMESTAMP)`,
        [req.user.id, requestId, JSON.stringify(result.rows[0])]
      );

      res.json({
        success: true,
        message: 'Account request rejected',
        data: result.rows[0],
      });
    } catch (error) {
      winston.error('Error rejecting account request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reject account request',
      });
    }
  }

  // Recalculate GPA and standing for a single student
  async recalculateStudent(req, res) {
    try {
      const { studentId } = req.params;

      const exists = await pool.query('SELECT id FROM students WHERE id = $1', [studentId]);
      if (exists.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      await pool.query('SELECT recalc_student_standing($1)', [studentId]);

      const standing = await pool.query(
        `SELECT cgpa, is_on_warning, is_dismissed
         FROM student_academic_standing
         WHERE student_id = $1`,
        [studentId]
      );

      return res.json({
        success: true,
        message: 'Student GPA and standing recalculated',
        data: standing.rows[0] || {},
      });
    } catch (error) {
      winston.error('Error recalculating student:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to recalculate student standing',
      });
    }
  }

  // Send notifications
  async sendNotifications(req, res) {
    try {
      const { recipient_type, title, message, faculty_id, student_id } = req.body;

      const baseParams = [title || 'Admin Notice', message];
      let recipientQuery;

      switch (recipient_type) {
        case 'all':
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            SELECT id, 'Admin', $1, $2, CURRENT_TIMESTAMP FROM students WHERE is_active = true
          `;
          break;
        case 'warning':
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            SELECT sas.student_id, 'Admin', $1, $2, CURRENT_TIMESTAMP
            FROM student_academic_standing sas
            JOIN students s ON s.id = sas.student_id
            WHERE sas.is_on_warning = true AND s.is_active = true
          `;
          break;
        case 'graduation_eligible':
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            SELECT ge.student_id, 'Admin', $1, $2, CURRENT_TIMESTAMP
            FROM graduation_eligibility ge
            JOIN students s ON s.id = ge.student_id
            WHERE ge.is_eligible = true AND s.is_active = true
          `;
          break;
        case 'dismissed':
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            SELECT id, 'Admin', $1, $2, CURRENT_TIMESTAMP FROM students WHERE is_dismissed = true
          `;
          break;
        case 'faculty':
          if (!faculty_id) {
            return res.status(400).json({ success: false, message: 'faculty_id required' });
          }
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            SELECT id, 'Admin', $1, $2, CURRENT_TIMESTAMP FROM students WHERE faculty_id = $3 AND is_active = true
          `;
          baseParams.push(faculty_id);
          break;
        case 'student':
          if (!student_id) {
            return res.status(400).json({ success: false, message: 'student_id required' });
          }
          recipientQuery = `
            INSERT INTO notifications (student_id, notification_type, title, message, created_at)
            VALUES ($3, 'Admin', $1, $2, CURRENT_TIMESTAMP)
          `;
          baseParams.push(student_id);
          break;
        default:
          return res.status(400).json({ success: false, message: 'Invalid recipient type' });
      }

      await pool.query(recipientQuery, baseParams);

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, new_value, created_at)
        VALUES ('SEND_NOTIFICATIONS', 'notification', $1, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [JSON.stringify({ recipient_type, title, message, faculty_id, student_id })]);

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
