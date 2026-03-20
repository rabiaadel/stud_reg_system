const { pool } = require('../config/database');
const winston = require('winston');

class CourseAssignmentService {
  /**
   * Assign a course to an instructor for a specific semester/section
   */
  async assignCourseToInstructor(assignmentData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        instructor_id,
        course_id,
        semester_id,
        section,
        max_capacity,
        schedule_json,
        classroom,
        admin_id
      } = assignmentData;

      // Verify instructor exists
      const instructorCheck = await client.query(
        'SELECT id FROM instructors WHERE id = $1',
        [instructor_id]
      );
      if (instructorCheck.rows.length === 0) {
        throw new Error('Instructor not found');
      }

      // Verify course exists
      const courseCheck = await client.query(
        'SELECT id, credit_hours FROM courses WHERE id = $1',
        [course_id]
      );
      if (courseCheck.rows.length === 0) {
        throw new Error('Course not found');
      }

      // Check for duplicate assignment (same instructor, course, semester, section)
      const duplicateCheck = await client.query(
        `SELECT id FROM course_instructor_assignments 
         WHERE instructor_id = $1 AND course_id = $2 AND semester_id = $3 AND section = $4`,
        [instructor_id, course_id, semester_id, section]
      );
      if (duplicateCheck.rows.length > 0) {
        throw new Error('This assignment already exists');
      }

      const query = `
        INSERT INTO course_instructor_assignments
        (instructor_id, course_id, semester_id, section, max_capacity, schedule_json, classroom, assigned_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await client.query(query, [
        instructor_id,
        course_id,
        semester_id,
        section || 1,
        max_capacity || 50,
        schedule_json || null,
        classroom || null,
        admin_id || 1
      ]);

      // Log activity
      await this.logAdminActivity(client, {
        action: 'ASSIGN_COURSE_TO_INSTRUCTOR',
        entity_type: 'course_assignment',
        entity_id: result.rows[0].id,
        after_value: result.rows[0],
        admin_id
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error assigning course to instructor:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get assignments for a specific semester
   */
  async getAssignmentsBySemester(semesterId, filter = {}) {
    try {
      let query = `
        SELECT 
          cia.*,
          i.first_name_en, i.last_name_en, i.title,
          c.code as course_code, c.name_en as course_name, c.credits,
          COUNT(sr.id) as current_enrollment
        FROM course_instructor_assignments cia
        JOIN instructors i ON cia.instructor_id = i.id
        JOIN courses c ON cia.course_id = c.id
        LEFT JOIN student_registrations sr ON sr.course_id = cia.course_id 
          AND sr.semester_id = cia.semester_id
        WHERE cia.semester_id = $1
      `;
      const params = [semesterId];
      let paramCount = 2;

      if (filter.course_id) {
        query += ` AND cia.course_id = $${paramCount}`;
        params.push(filter.course_id);
        paramCount++;
      }

      if (filter.instructor_id) {
        query += ` AND cia.instructor_id = $${paramCount}`;
        params.push(filter.instructor_id);
        paramCount++;
      }

      query += `
        GROUP BY cia.id, i.id, c.id
        ORDER BY c.code, cia.section
      `;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      winston.error('Error getting assignments by semester:', error);
      throw error;
    }
  }

  /**
   * Get instructor's schedule for semester
   */
  async getInstructorSchedule(instructorId, semesterId) {
    try {
      const query = `
        SELECT 
          cia.*,
          c.code as course_code, c.name_en as course_name,
          COUNT(sr.id) as current_enrollment
        FROM course_instructor_assignments cia
        JOIN courses c ON cia.course_id = c.id
        LEFT JOIN student_registrations sr ON sr.course_id = cia.course_id 
          AND sr.semester_id = cia.semester_id
        WHERE cia.instructor_id = $1 AND cia.semester_id = $2
        GROUP BY cia.id, c.id
        ORDER BY c.code
      `;

      const result = await pool.query(query, [instructorId, semesterId]);
      return result.rows;
    } catch (error) {
      winston.error('Error getting instructor schedule:', error);
      throw error;
    }
  }

  /**
   * Update assignment details (capacity, classroom, schedule)
   */
  async updateAssignment(assignmentId, updates) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current state
      const currentResult = await client.query(
        'SELECT * FROM course_instructor_assignments WHERE id = $1',
        [assignmentId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Assignment not found');
      }

      const beforeValue = currentResult.rows[0];

      // Build update query
      const fields = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['max_capacity', 'classroom', 'schedule_json'];
      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(updates[key]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return beforeValue; // Nothing to update
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(assignmentId);

      const query = `
        UPDATE course_instructor_assignments
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await client.query(query, values);
      const afterValue = result.rows[0];

      // Log activity
      await this.logAdminActivity(client, {
        action: 'UPDATE_COURSE_ASSIGNMENT',
        entity_type: 'course_assignment',
        entity_id: assignmentId,
        before_value: beforeValue,
        after_value: afterValue
      });

      await client.query('COMMIT');
      return afterValue;
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error updating assignment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Remove course assignment
   */
  async removeAssignment(assignmentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current state
      const currentResult = await client.query(
        'SELECT * FROM course_instructor_assignments WHERE id = $1',
        [assignmentId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Assignment not found');
      }

      // Check if there are enrolled students
      const studentCheck = await client.query(
        `SELECT COUNT(*) as count FROM student_registrations 
         WHERE course_id = $1 AND semester_id = $2`,
        [currentResult.rows[0].course_id, currentResult.rows[0].semester_id]
      );

      if (parseInt(studentCheck.rows[0].count) > 0) {
        throw new Error('Cannot remove assignment with enrolled students');
      }

      // Delete assignment
      await client.query('DELETE FROM course_instructor_assignments WHERE id = $1', [assignmentId]);

      // Log activity
      await this.logAdminActivity(client, {
        action: 'DELETE_COURSE_ASSIGNMENT',
        entity_type: 'course_assignment',
        entity_id: assignmentId,
        before_value: currentResult.rows[0]
      });

      await client.query('COMMIT');
      return { success: true, message: 'Assignment removed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error removing assignment:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check instructor workload for semester
   */
  async getInstructorWorkload(instructorId, semesterId) {
    try {
      const query = `
        SELECT 
          i.id, i.first_name_en, i.last_name_en,
          COUNT(DISTINCT cia.id) as courses_count,
          SUM(c.credits) as total_credits,
          SUM(cia.max_capacity) as total_capacity,
          AVG(cia.max_capacity) as avg_class_size
        FROM instructors i
        LEFT JOIN course_instructor_assignments cia ON i.id = cia.instructor_id
        LEFT JOIN courses c ON cia.course_id = c.id
        WHERE i.id = $1 AND (cia.semester_id = $2 OR cia.semester_id IS NULL)
        GROUP BY i.id
      `;

      const result = await pool.query(query, [instructorId, semesterId]);
      return result.rows[0] || null;
    } catch (error) {
      winston.error('Error calculating instructor workload:', error);
      throw error;
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

module.exports = CourseAssignmentService;
