// ============================================================================
// Semester Service — Manage semester lifecycle and registration windows
// Open/close semesters, manage add/drop/withdrawal windows
// ============================================================================

const db = require('../config/database');
const { BYLAWS } = require('../constants/bylaw');

class SemesterService {
  /**
   * Get current/active semester
   */
  async getCurrentSemester() {
    try {
      const query = `
        SELECT 
          s.id,
          s.code,
          s.name,
          st.name as semesterName,
          s.status,
          s.start_date,
          s.end_date,
          s.add_drop_deadline,
          s.withdrawal_deadline,
          s.grade_deadline,
          s.created_at
        FROM semesters s
        JOIN semesters_translations st ON s.id = st.semester_id AND st.lang = 'en'
        WHERE s.status = 'active'
        LIMIT 1
      `;
      
      const result = await db.query(query);
      return result.rows[0] || null;
    } catch (err) {
      console.error('Error fetching current semester:', err);
      throw err;
    }
  }

  /**
   * Get all semesters with status
   */
  async getAllSemesters() {
    try {
      const query = `
        SELECT 
          s.id,
          s.code,
          s.name,
          st.name as semesterName,
          s.status,
          s.start_date,
          s.end_date,
          s.academic_year,
          COUNT(DISTINCT sg.student_id) as enrolledStudents
        FROM semesters s
        LEFT JOIN semesters_translations st ON s.id = st.semester_id AND st.lang = 'en'
        LEFT JOIN student_registrations sr ON s.id = sr.semester_id
        LEFT JOIN student_grades sg ON s.id = sg.semester_id
        GROUP BY s.id, st.name
        ORDER BY s.start_date DESC
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (err) {
      console.error('Error fetching all semesters:', err);
      throw err;
    }
  }

  /**
   * Open semester for registration
   * Sets status, creates registration window
   */
  async openSemester(semesterId) {
    try {
      const now = new Date();
      const registrationDeadline = new Date(now.getTime() + (BYLAWS.REGISTRATION_WINDOW_DURATION_WEEKS * 7 * 24 * 60 * 60 * 1000));
      
      await db.query(`
        UPDATE semesters
        SET status = 'open', opened_at = NOW()
        WHERE id = $1
      `, [semesterId]);

      // Log action
      await db.query(`
        INSERT INTO semester_status_logs (semester_id, action, timestamp)
        VALUES ($1, 'opened', NOW())
      `, [semesterId]);

      return { semesterId, status: 'open' };
    } catch (err) {
      console.error('Error opening semester:', err);
      throw err;
    }
  }

  /**
   * Close semester
   * Prevents new registrations, calculates grades
   */
  async closeSemester(semesterId) {
    try {
      await db.query(`
        UPDATE semesters
        SET status = 'closed', closed_at = NOW()
        WHERE id = $1
      `, [semesterId]);

      // Log action
      await db.query(`
        INSERT INTO semester_status_logs (semester_id, action, timestamp)
        VALUES ($1, 'closed', NOW())
      `, [semesterId]);

      return { semesterId, status: 'closed' };
    } catch (err) {
      console.error('Error closing semester:', err);
      throw err;
    }
  }

  /**
   * Check if student can add/drop courses
   * Must be within add/drop window
   */
  async isWithinAddDropWindow(semesterId) {
    try {
      const query = `
        SELECT 
          add_drop_deadline,
          end_date,
          status
        FROM semesters
        WHERE id = $1
      `;
      
      const result = await db.query(query, [semesterId]);
      if (result.rows.length === 0) throw new Error('Semester not found');

      const semester = result.rows[0];
      const now = new Date();
      const deadline = new Date(semester.add_drop_deadline);

      return {
        withinWindow: now <= deadline && semester.status === 'active',
        deadline: semester.add_drop_deadline,
        daysRemaining: Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
      };
    } catch (err) {
      console.error('Error checking add/drop window:', err);
      throw err;
    }
  }

  /**
   * Check if student can withdraw from course
   * Must be before withdrawal deadline
   */
  async isWithinWithdrawalWindow(semesterId) {
    try {
      const query = `
        SELECT 
          withdrawal_deadline,
          status
        FROM semesters
        WHERE id = $1
      `;
      
      const result = await db.query(query, [semesterId]);
      if (result.rows.length === 0) throw new Error('Semester not found');

      const semester = result.rows[0];
      const now = new Date();
      const deadline = new Date(semester.withdrawal_deadline);

      return {
        withinWindow: now <= deadline && semester.status === 'active',
        deadline: semester.withdrawal_deadline,
        daysRemaining: Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
      };
    } catch (err) {
      console.error('Error checking withdrawal window:', err);
      throw err;
    }
  }

  /**
   * Get registration window info
   * Includes deadlines for add/drop, withdrawal, grading
   */
  async getRegistrationWindowInfo(semesterId) {
    try {
      const query = `
        SELECT 
          id,
          code,
          name,
          status,
          start_date,
          end_date,
          add_drop_deadline,
          withdrawal_deadline,
          grade_deadline,
          opened_at
        FROM semesters
        WHERE id = $1
      `;
      
      const result = await db.query(query, [semesterId]);
      if (result.rows.length === 0) throw new Error('Semester not found');

      const semester = result.rows[0];
      const now = new Date();

      return {
        semesterId: semester.id,
        code: semester.code,
        name: semester.name,
        status: semester.status,
        startDate: semester.start_date,
        endDate: semester.end_date,
        windows: {
          registration: {
            open: semester.opened_at,
            close: semester.add_drop_deadline,
            daysRemaining: Math.ceil((new Date(semester.add_drop_deadline) - now) / (1000 * 60 * 60 * 24))
          },
          addDrop: {
            deadline: semester.add_drop_deadline,
            active: now <= new Date(semester.add_drop_deadline)
          },
          withdrawal: {
            deadline: semester.withdrawal_deadline,
            active: now <= new Date(semester.withdrawal_deadline)
          },
          grading: {
            deadline: semester.grade_deadline,
            daysRemaining: Math.ceil((new Date(semester.grade_deadline) - now) / (1000 * 60 * 60 * 24))
          }
        }
      };
    } catch (err) {
      console.error('Error fetching registration window info:', err);
      throw err;
    }
  }

  /**
   * Update semester status (admin only)
   */
  async updateSemesterStatus(semesterId, status, updateFields = {}) {
    try {
      const validStatuses = ['planning', 'open', 'active', 'closed', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const query = `
        UPDATE semesters
        SET status = $1, ${Object.keys(updateFields).map((k, i) => `${k} = $${i + 3}`).join(', ')}, updated_at = NOW()
        WHERE id = $2
      `;
      
      const values = [status, semesterId, ...Object.values(updateFields)];
      await db.query(query, values);

      return { semesterId, status };
    } catch (err) {
      console.error('Error updating semester status:', err);
      throw err;
    }
  }
}

module.exports = new SemesterService();
