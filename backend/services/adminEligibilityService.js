const { pool } = require('../config/database');
const winston = require('winston');

class AdminEligibilityService {
  /**
   * Create or update eligibility rule
   */
  async createEligibilityRule(ruleData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        faculty_id,
        rule_name,
        rule_type, // MIN_GPA, MIN_CREDITS, PREREQUISITES, ACADEMIC_STANDING, CREDIT_HOURS, CUSTOM
        description,
        parameters, // JSONB field: {min_gpa: 2.0, max_credit_hours: 18}
        is_active = true,
        applies_to, // ALL, MAJOR_ID, CLASS_LEVEL, PROGRAM_ID
        admin_id
      } = ruleData;

      // Check if rule exists
      const existingRule = await client.query(
        `SELECT id FROM enhanced_eligibility_rules 
         WHERE faculty_id = $1 AND rule_name = $2 AND rule_type = $3`,
        [faculty_id, rule_name, rule_type]
      );

      let result;
      if (existingRule.rows.length > 0) {
        // Update existing rule
        result = await client.query(
          `UPDATE enhanced_eligibility_rules
           SET description = $1, parameters = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $4
           RETURNING *`,
          [description, JSON.stringify(parameters), is_active, existingRule.rows[0].id]
        );

        await this.logAdminActivity(client, {
          action: 'UPDATE_ELIGIBILITY_RULE',
          entity_type: 'eligibility_rule',
          entity_id: existingRule.rows[0].id,
          after_value: result.rows[0],
          admin_id
        });
      } else {
        // Create new rule
        result = await client.query(
          `INSERT INTO enhanced_eligibility_rules
           (faculty_id, rule_name, rule_type, description, parameters, is_active, applies_to, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [faculty_id, rule_name, rule_type, description, JSON.stringify(parameters), is_active, applies_to, admin_id]
        );

        await this.logAdminActivity(client, {
          action: 'CREATE_ELIGIBILITY_RULE',
          entity_type: 'eligibility_rule',
          entity_id: result.rows[0].id,
          after_value: result.rows[0],
          admin_id
        });
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error creating eligibility rule:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get eligibility rules for faculty
   */
  async getEligibilityRules(facultyId, filter = {}) {
    try {
      let query = `
        SELECT * FROM enhanced_eligibility_rules
        WHERE faculty_id = $1
      `;
      const params = [facultyId];
      let paramCount = 2;

      if (filter.rule_type) {
        query += ` AND rule_type = $${paramCount}`;
        params.push(filter.rule_type);
        paramCount++;
      }

      if (filter.is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(filter.is_active);
        paramCount++;
      }

      query += ' ORDER BY rule_type, rule_name';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      winston.error('Error getting eligibility rules:', error);
      throw error;
    }
  }

  /**
   * Grant exception to a student for eligibility requirements
   */
  async grantException(exceptionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        student_id,
        rule_id,
        reason,
        exception_type, // PERMANENT_WAIVER, TEMPORARY_WAIVER, CONDITIONAL_WAIVER
        expiration_date, // For temporary waivers
        conditions_json, // For conditional waivers
        admin_id
      } = exceptionData;

      // Verify student exists
      const studentCheck = await client.query(
        'SELECT id FROM students WHERE id = $1',
        [student_id]
      );
      if (studentCheck.rows.length === 0) {
        throw new Error('Student not found');
      }

      // Verify rule exists
      const ruleCheck = await client.query(
        'SELECT id FROM enhanced_eligibility_rules WHERE id = $1',
        [rule_id]
      );
      if (ruleCheck.rows.length === 0) {
        throw new Error('Rule not found');
      }

      // Check for existing exception
      const existingException = await client.query(
        `SELECT id FROM student_eligibility_exceptions 
         WHERE student_id = $1 AND rule_id = $2 AND status = 'ACTIVE'`,
        [student_id, rule_id]
      );

      if (existingException.rows.length > 0) {
        throw new Error('Student already has an active exception for this rule');
      }

      const query = `
        INSERT INTO student_eligibility_exceptions
        (student_id, rule_id, reason, exception_type, status, expiration_date, conditions_json, granted_by, granted_at)
        VALUES ($1, $2, $3, $4, 'ACTIVE', $5, $6, $7, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await client.query(query, [
        student_id,
        rule_id,
        reason,
        exception_type,
        expiration_date || null,
        JSON.stringify(conditions_json) || null,
        admin_id
      ]);

      // Log activity
      await this.logAdminActivity(client, {
        action: 'GRANT_ELIGIBILITY_EXCEPTION',
        entity_type: 'eligibility_exception',
        entity_id: result.rows[0].id,
        after_value: result.rows[0],
        admin_id
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error granting exception:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Revoke exception
   */
  async revokeException(exceptionId, reason, admin_id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get current exception
      const currentResult = await client.query(
        'SELECT * FROM student_eligibility_exceptions WHERE id = $1',
        [exceptionId]
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Exception not found');
      }

      if (currentResult.rows[0].status !== 'ACTIVE') {
        throw new Error(`Cannot revoke exception with status: ${currentResult.rows[0].status}`);
      }

      // Update exception status
      const result = await client.query(
        `UPDATE student_eligibility_exceptions
         SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
         WHERE id = $2
         RETURNING *`,
        [reason, exceptionId]
      );

      // Log activity
      await this.logAdminActivity(client, {
        action: 'REVOKE_ELIGIBILITY_EXCEPTION',
        entity_type: 'eligibility_exception',
        entity_id: exceptionId,
        before_value: currentResult.rows[0],
        after_value: result.rows[0],
        admin_id
      });

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error revoking exception:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get exceptions for a student
   */
  async getStudentExceptions(studentId) {
    try {
      const query = `
        SELECT 
          see.*,
          r.rule_name, r.rule_type, r.description
        FROM student_eligibility_exceptions see
        JOIN enhanced_eligibility_rules r ON see.rule_id = r.id
        WHERE see.student_id = $1 AND see.status = 'ACTIVE'
        ORDER BY see.granted_at DESC
      `;

      const result = await pool.query(query, [studentId]);
      return result.rows;
    } catch (error) {
      winston.error('Error getting student exceptions:', error);
      throw error;
    }
  }

  /**
   * Check if student has valid exception for a rule
   */
  async hasValidException(studentId, ruleId) {
    try {
      const query = `
        SELECT id FROM student_eligibility_exceptions
        WHERE student_id = $1 AND rule_id = $2 AND status = 'ACTIVE'
        AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
      `;

      const result = await pool.query(query, [studentId, ruleId]);
      return result.rows.length > 0;
    } catch (error) {
      winston.error('Error checking exception validity:', error);
      throw error;
    }
  }

  /**
   * Evaluate eligibility rules for a student
   */
  async evaluateStudentEligibility(studentId, facultyId, context = {}) {
    try {
      // Get student data
      const studentQuery = `
        SELECT s.*, p.id as program_id, p.name_en as program_name
        FROM students s
        LEFT JOIN programs p ON s.program_id = p.id
        WHERE s.id = $1 AND s.faculty_id = $2
      `;
      const studentResult = await pool.query(studentQuery, [studentId, facultyId]);

      if (studentResult.rows.length === 0) {
        throw new Error('Student not found');
      }

      const student = studentResult.rows[0];

      // Get active eligibility rules
      const rulesQuery = `
        SELECT * FROM enhanced_eligibility_rules
        WHERE faculty_id = $1 AND is_active = true
      `;
      const rulesResult = await pool.query(rulesQuery, [facultyId]);

      const eligibilityResults = {
        student_id: studentId,
        overall_eligible: true,
        rules_evaluation: [],
        exceptions: []
      };

      // Check each rule
      for (const rule of rulesResult.rows) {
        const ruleEvaluation = {
          rule_id: rule.id,
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          passed: true,
          reason: null,
          has_exception: false
        };

        // Check if student has exception
        const hasException = await this.hasValidException(studentId, rule.id);
        if (hasException) {
          ruleEvaluation.has_exception = true;
          eligibilityResults.exceptions.push(rule.rule_name);
          eligibilityResults.rules_evaluation.push(ruleEvaluation);
          continue;
        }

        // Evaluate rule based on type
        try {
          const evaluation = await this.evaluateRule(student, rule, context);
          ruleEvaluation.passed = evaluation.passed;
          ruleEvaluation.reason = evaluation.reason;

          if (!evaluation.passed) {
            eligibilityResults.overall_eligible = false;
          }
        } catch (error) {
          ruleEvaluation.passed = false;
          ruleEvaluation.reason = error.message;
          eligibilityResults.overall_eligible = false;
        }

        eligibilityResults.rules_evaluation.push(ruleEvaluation);
      }

      return eligibilityResults;
    } catch (error) {
      winston.error('Error evaluating eligibility:', error);
      throw error;
    }
  }

  /**
   * Evaluate individual rule
   */
  async evaluateRule(student, rule, context) {
    const { rule_type, parameters } = rule;
    const params = parameters || {};

    switch (rule_type) {
      case 'MIN_GPA':
        const minGpa = params.min_gpa || 2.0;
        return {
          passed: (student.gpa || 0) >= minGpa,
          reason: `Student GPA: ${student.gpa || 0}, Required: ${minGpa}`
        };

      case 'MIN_CREDITS':
        const minCredits = params.min_credits || 0;
        const studentCredits = context.completed_credits || student.completed_credits || 0;
        return {
          passed: studentCredits >= minCredits,
          reason: `Student Credits: ${studentCredits}, Required: ${minCredits}`
        };

      case 'ACADEMIC_STANDING':
        const requiredStanding = params.required_standing || 'GOOD';
        return {
          passed: (student.standing || 'GOOD') === requiredStanding,
          reason: `Student Standing: ${student.standing || 'GOOD'}, Required: ${requiredStanding}`
        };

      case 'CREDIT_HOURS':
        const maxHours = params.max_credit_hours || 18;
        const currentHours = context.current_semester_hours || 0;
        return {
          passed: currentHours <= maxHours,
          reason: `Current Hours: ${currentHours}, Max: ${maxHours}`
        };

      case 'PREREQUISITES':
        // This would check against completed courses
        return {
          passed: true,
          reason: 'Prerequisites met'
        };

      case 'CUSTOM':
        // Custom rules evaluation would go here
        return {
          passed: true,
          reason: 'Custom rule evaluated'
        };

      default:
        return {
          passed: true,
          reason: 'Unknown rule type'
        };
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

module.exports = AdminEligibilityService;
