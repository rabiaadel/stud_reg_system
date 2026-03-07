const { pool } = require('../config/database');
const winston = require('winston');

class AcademicRulesController {
  // Get rules
  async getRules(req, res) {
    try {
      const { faculty_id, category, is_active } = req.query;

      let query = 'SELECT * FROM academic_rules WHERE faculty_id = $1';
      const params = [faculty_id];
      let paramCount = 2;

      if (category) {
        query += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(is_active === 'true');
        paramCount++;
      }

      query += ' ORDER BY category, rule_code';

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows.map(rule => ({
          id: rule.id,
          rule_code: rule.rule_code,
          category: rule.category,
          title: rule.title,
          description: rule.description,
          rule_type: rule.rule_type,
          rule_data: rule.rule_data,
          is_active: rule.is_active,
          effective_from: rule.effective_from,
          effective_to: rule.effective_to
        }))
      });
    } catch (error) {
      winston.error('Error getting academic rules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get academic rules',
      });
    }
  }

  // Get rule details
  async getRuleDetails(req, res) {
    try {
      const { ruleId } = req.params;

      const query = 'SELECT * FROM academic_rules WHERE id = $1';
      const result = await pool.query(query, [ruleId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rule not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      winston.error('Error getting rule details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rule details',
      });
    }
  }

  // Create rule
  async createRule(req, res) {
    try {
      const { faculty_id, rule_code, category, title, description, rule_type, rule_data, effective_from, effective_to } = req.body;

      const query = `
        INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, effective_from, effective_to, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await pool.query(query, [
        faculty_id,
        rule_code,
        category,
        title,
        description || null,
        rule_type || 'json',
        rule_data,
        effective_from || null,
        effective_to || null
      ]);

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, entity_id, new_value, created_at)
        VALUES ('CREATE_RULE', 'academic_rule', $1, $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [result.rows[0].id, JSON.stringify(result.rows[0])]);

      res.status(201).json({
        success: true,
        message: 'Rule created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      winston.error('Error creating rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create rule',
      });
    }
  }

  // Update rule
  async updateRule(req, res) {
    try {
      const { ruleId } = req.params;
      const updates = req.body;

      let query = 'UPDATE academic_rules SET ';
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
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      query += fields.join(', ');
      query += ` WHERE id = $${paramCount} RETURNING *`;
      values.push(ruleId);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Rule not found',
        });
      }

      res.json({
        success: true,
        message: 'Rule updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      winston.error('Error updating rule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update rule',
      });
    }
  }
}

module.exports = new AcademicRulesController();