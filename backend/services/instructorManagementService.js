const { pool } = require('../config/database');
const winston = require('winston');

class InstructorManagementService {
  /**
   * Create a new instructor
   */
  async createInstructor(instructorData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        faculty_id,
        first_name_en,
        last_name_en,
        first_name_ar,
        last_name_ar,
        email,
        phone,
        employee_id,
        title,
        department_id
      } = instructorData;

      const query = `
        INSERT INTO instructors (
          faculty_id, first_name_en, last_name_en, first_name_ar, last_name_ar,
          email, phone, employee_id, title, department_id, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
        RETURNING *
      `;

      const result = await client.query(query, [
        faculty_id,
        first_name_en,
        last_name_en,
        first_name_ar || null,
        last_name_ar || null,
        email,
        phone || null,
        employee_id,
        title,
        department_id || null
      ]);

      // Log activity
      await this.logAdminActivity(client, {
        action_type: 'CREATE_INSTRUCTOR',
        entity_type: 'instructor',
        entity_id: result.rows[0].id,
        after_value: result.rows[0]
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error creating instructor:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all instructors for a faculty
   */
  async getInstructors(facultyId, filter = {}) {
    try {
      let query = 'SELECT * FROM instructors WHERE faculty_id = $1';
      const params = [facultyId];
      let paramCount = 2;

      if (filter.department_id) {
        query += ` AND department_id = $${paramCount}`;
        params.push(filter.department_id);
        paramCount++;
      }

      if (filter.is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(filter.is_active);
        paramCount++;
      }

      if (filter.search) {
        query += ` AND (first_name_en ILIKE $${paramCount} OR last_name_en ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${filter.search}%`);
        paramCount++;
      }

      query += ' ORDER BY first_name_en, last_name_en';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      winston.error('Error getting instructors:', error);
      throw error;
    }
  }

  /**
   * Get instructor by ID with assignments
   */
  async getInstructorWithAssignments(instructorId) {
    try {
      const instructorQuery = `
        SELECT i.*, d.name_en as department_name
        FROM instructors i
        LEFT JOIN departments d ON i.department_id = d.id
        WHERE i.id = $1
      `;
      const instructorResult = await pool.query(instructorQuery, [instructorId]);

      if (instructorResult.rows.length === 0) {
        throw new Error('Instructor not found');
      }

      const instructor = instructorResult.rows[0];

      // Get course assignments
      const assignmentsQuery = `
        SELECT 
          cia.*,
          c.code as course_code,
          c.name_en as course_name,
          s.semester_name,
          s.academic_year,
          COUNT(sr.id) as current_enrollment
        FROM course_instructor_assignments cia
        JOIN courses c ON cia.course_id = c.id
        JOIN semesters s ON cia.semester_id = s.id
        LEFT JOIN student_registrations sr ON sr.course_id = cia.course_id 
          AND sr.semester_id = cia.semester_id
        WHERE cia.instructor_id = $1
        GROUP BY cia.id, c.id, s.id
        ORDER BY s.start_date DESC
      `;

      const assignmentsResult = await pool.query(assignmentsQuery, [instructorId]);

      return {
        instructor,
        assignments: assignmentsResult.rows
      };
    } catch (error) {
      winston.error('Error getting instructor with assignments:', error);
      throw error;
    }
  }

  /**
   * Update instructor details
   */
  async updateInstructor(instructorId, updates) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current state
      const currentResult = await client.query(
        'SELECT * FROM instructors WHERE id = $1',
        [instructorId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Instructor not found');
      }

      const beforeValue = currentResult.rows[0];

      // Build update query
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(instructorId);

      const query = `
        UPDATE instructors
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);
      const afterValue = result.rows[0];

      // Log activity
      await this.logAdminActivity(client, {
        action_type: 'UPDATE_INSTRUCTOR',
        entity_type: 'instructor',
        entity_id: instructorId,
        before_value: beforeValue,
        after_value: afterValue
      });

      await client.query('COMMIT');
      return afterValue;
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error updating instructor:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Deactivate instructor
   */
  async deactivateInstructor(instructorId, reason) {
    return this.updateInstructor(instructorId, {
      is_active: false
    });
  }

  /**
   * Delete instructor (soft delete)
   */
  async deleteInstructor(instructorId) {
    return this.deactivateInstructor(instructorId);
  }

  /**
   * Log admin activity
   */
  async logAdminActivity(client, activity) {
    const { action_type, entity_type, entity_id, before_value, after_value, reason } = activity;

    const query = `
      INSERT INTO admin_activity_logs
      (admin_id, action_type, entity_type, entity_id, before_value, after_value, reason, status, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Success', CURRENT_TIMESTAMP)
    `;

    // Get admin ID from context (should be passed in)
    const adminId = activity.admin_id || 1; // Fallback for now

    await client.query(query, [
      adminId,
      action_type,
      entity_type,
      entity_id,
      JSON.stringify(before_value || null),
      JSON.stringify(after_value || null),
      reason || null
    ]);
  }
}

module.exports = InstructorManagementService;
