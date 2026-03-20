const { pool } = require('../config/database');
const winston = require('winston');

class StudentSubjectModificationService {
  /**
   * Create a modification request (admin changing student's course)
   */
  async createModificationRequest(modificationData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        student_id,
        registration_id,
        action_type, // ADD, REMOVE, REPLACE_FROM, REPLACE_TO
        course_id,
        new_course_id, // For REPLACE_TO
        semester_id,
        reason,
        admin_id,
        requires_approval = true
      } = modificationData;

      // Verify student exists
      const studentCheck = await client.query(
        'SELECT id FROM students WHERE id = $1',
        [student_id]
      );
      if (studentCheck.rows.length === 0) {
        throw new Error('Student not found');
      }

      // Verify course(s) exist
      if (course_id) {
        const courseCheck = await client.query(
          'SELECT id FROM courses WHERE id = $1',
          [course_id]
        );
        if (courseCheck.rows.length === 0) {
          throw new Error('Course not found');
        }
      }

      if (new_course_id) {
        const newCourseCheck = await client.query(
          'SELECT id FROM courses WHERE id = $1',
          [new_course_id]
        );
        if (newCourseCheck.rows.length === 0) {
          throw new Error('New course not found');
        }
      }

      const status = requires_approval ? 'PENDING' : 'APPROVED';
      const approvedAt = requires_approval ? null : new Date();

      const query = `
        INSERT INTO student_subject_modifications
        (student_id, registration_id, action_type, course_id, new_course_id, semester_id, 
         reason, requested_by, status, requested_at, approved_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10)
        RETURNING *
      `;

      const result = await client.query(query, [
        student_id,
        registration_id || null,
        action_type,
        course_id,
        new_course_id || null,
        semester_id,
        reason || null,
        admin_id,
        status,
        approvedAt
      ]);

      // Log activity
      await this.logAdminActivity(client, {
        action: 'REQUEST_STUDENT_MODIFICATION',
        entity_type: 'student_modification',
        entity_id: result.rows[0].id,
        after_value: result.rows[0],
        admin_id
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error creating modification request:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Review and approve/reject modification
   */
  async reviewModification(modificationId, decision, reviewer_notes, reviewer_id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (!['APPROVED', 'REJECTED'].includes(decision)) {
        throw new Error('Invalid decision. Must be APPROVED or REJECTED');
      }

      // Get current modification
      const modResult = await client.query(
        'SELECT * FROM student_subject_modifications WHERE id = $1',
        [modificationId]
      );

      if (modResult.rows.length === 0) {
        throw new Error('Modification request not found');
      }

      const modification = modResult.rows[0];

      if (modification.status !== 'PENDING') {
        throw new Error(`Cannot review modification with status: ${modification.status}`);
      }

      // Update modification status
      const updateQuery = `
        UPDATE student_subject_modifications
        SET status = $1, 
            approved_at = CURRENT_TIMESTAMP,
            approved_by = $2,
            reviewer_notes = $3
        WHERE id = $4
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [decision, reviewer_id, reviewer_notes, modificationId]);
      const updatedModification = updateResult.rows[0];

      // If approved, apply the modification to registrations
      if (decision === 'APPROVED') {
        await this.applyModification(client, updatedModification);
      }

      // Log activity
      await this.logAdminActivity(client, {
        action: 'REVIEW_STUDENT_MODIFICATION',
        entity_type: 'student_modification',
        entity_id: modificationId,
        before_value: modification,
        after_value: updatedModification,
        admin_id: reviewer_id
      });

      await client.query('COMMIT');
      return updatedModification;
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error reviewing modification:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Apply approved modification to student registrations
   */
  async applyModification(client, modification) {
    try {
      const { student_id, action_type, course_id, new_course_id, semester_id, registration_id } = modification;

      switch (action_type) {
        case 'ADD':
          await client.query(
            `INSERT INTO student_registrations 
             (student_id, course_id, semester_id, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT DO NOTHING`,
            [student_id, course_id, semester_id]
          );
          break;

        case 'REMOVE':
          await client.query(
            `DELETE FROM student_registrations 
             WHERE id = $1 OR (student_id = $2 AND course_id = $3 AND semester_id = $4)`,
            [registration_id, student_id, course_id, semester_id]
          );
          break;

        case 'REPLACE_FROM':
          await client.query(
            `DELETE FROM student_registrations 
             WHERE id = $1 OR (student_id = $2 AND course_id = $3 AND semester_id = $4)`,
            [registration_id, student_id, course_id, semester_id]
          );
          break;

        case 'REPLACE_TO':
          await client.query(
            `INSERT INTO student_registrations 
             (student_id, course_id, semester_id, created_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT DO NOTHING`,
            [student_id, new_course_id, semester_id]
          );
          break;
      }
    } catch (error) {
      winston.error('Error applying modification:', error);
      throw error;
    }
  }

  /**
   * Get modification history for a student
   */
  async getStudentModificationHistory(studentId, filter = {}) {
    try {
      let query = `
        SELECT 
          ssm.*,
          c1.code as course_code, c1.name_en as course_name,
          c2.code as new_course_code, c2.name_en as new_course_name,
          s.semester_name,
          admin_u.first_name_en as requested_by_name,
          review_u.first_name_en as reviewed_by_name
        FROM student_subject_modifications ssm
        LEFT JOIN courses c1 ON ssm.course_id = c1.id
        LEFT JOIN courses c2 ON ssm.new_course_id = c2.id
        LEFT JOIN semesters s ON ssm.semester_id = s.id
        LEFT JOIN users admin_u ON ssm.requested_by = admin_u.id
        LEFT JOIN users review_u ON ssm.approved_by = review_u.id
        WHERE ssm.student_id = $1
      `;
      const params = [studentId];
      let paramCount = 2;

      if (filter.status) {
        query += ` AND ssm.status = $${paramCount}`;
        params.push(filter.status);
        paramCount++;
      }

      if (filter.semester_id) {
        query += ` AND ssm.semester_id = $${paramCount}`;
        params.push(filter.semester_id);
        paramCount++;
      }

      query += ' ORDER BY ssm.requested_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      winston.error('Error getting modification history:', error);
      throw error;
    }
  }

  /**
   * Get pending modifications for review
   */
  async getPendingModifications(filter = {}) {
    try {
      let query = `
        SELECT 
          ssm.*,
          st.user_id as student_user_id,
          st.first_name_en as student_first_name, st.last_name_en as student_last_name,
          c1.code as course_code, c1.name_en as course_name,
          c2.code as new_course_code, c2.name_en as new_course_name,
          s.semester_name
        FROM student_subject_modifications ssm
        JOIN students st ON ssm.student_id = st.id
        LEFT JOIN courses c1 ON ssm.course_id = c1.id
        LEFT JOIN courses c2 ON ssm.new_course_id = c2.id
        LEFT JOIN semesters s ON ssm.semester_id = s.id
        WHERE ssm.status = 'PENDING'
      `;
      const params = [];
      let paramCount = 1;

      if (filter.semester_id) {
        query += ` AND ssm.semester_id = $${paramCount}`;
        params.push(filter.semester_id);
        paramCount++;
      }

      if (filter.action_type) {
        query += ` AND ssm.action_type = $${paramCount}`;
        params.push(filter.action_type);
        paramCount++;
      }

      query += ' ORDER BY ssm.requested_at ASC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      winston.error('Error getting pending modifications:', error);
      throw error;
    }
  }

  /**
   * Bulk modify student subjects for a course
   */
  async bulkModifyStudents(courseId, semesterId, action, targetCourseId, admin_id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];

      if (action === 'MOVE_ALL') {
        // Get all students in current course
        const studentsQuery = `
          SELECT DISTINCT student_id 
          FROM student_registrations
          WHERE course_id = $1 AND semester_id = $2
        `;

        const studentsResult = await client.query(studentsQuery, [courseId, semesterId]);

        for (const row of studentsResult.rows) {
          const modification = await this.createModificationRequest({
            student_id: row.student_id,
            action_type: 'REPLACE_FROM',
            course_id: courseId,
            new_course_id: targetCourseId,
            semester_id: semesterId,
            reason: `Bulk move: ${action}`,
            admin_id,
            requires_approval: false
          });
          results.push(modification);
        }
      }

      await client.query('COMMIT');
      return {
        total: results.length,
        modifications: results
      };
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error in bulk modification:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Log admin activity
   */
  async logAdminActivity(client, activity) {
    const { action, entity_type, entity_id, before_value, after_value, admin_id } = activity;

    const query = `
      INSERT INTO admin_activity_logs
      (admin_id, action_type, entity_type, entity_id, before_value, after_value, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, 'Success', CURRENT_TIMESTAMP)
    `;

    await client.query(query, [
      admin_id || 1,
      action,
      entity_type,
      entity_id,
      JSON.stringify(before_value || null),
      JSON.stringify(after_value || null)
    ]);
  }
}

module.exports = StudentSubjectModificationService;
