const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { logger } = require('../config/logger');
const { jwt: jwtConfig } = require('../config/config');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const userQuery = `
        SELECT id, email, password_hash, role, faculty_id, first_name, last_name, is_active
        FROM users
        WHERE email = $1
      `;
      const result = await pool.query(userQuery, [email]);

      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Account is inactive' });
      }

      const passwordMatches = await bcrypt.compare(password, user.password_hash || '');
      if (!passwordMatches) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      let profileId = null;
      if (user.role === 'student') {
        const studentResult = await pool.query(
          'SELECT id FROM students WHERE user_id = $1',
          [user.id]
        );
        profileId = studentResult.rows[0]?.id || null;
      }
      if (user.role === 'doctor') {
        const instructorResult = await pool.query(
          'SELECT id FROM instructors WHERE user_id = $1',
          [user.id]
        );
        profileId = instructorResult.rows[0]?.id || null;
      }

      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        faculty_id: user.faculty_id,
        profile_id: profileId,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      };

      if (!jwtConfig.secret) {
        logger.error('JWT secret not configured');
        return res.status(500).json({ success: false, message: 'Server configuration error' });
      }

      const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiry });

      return res.json({
        success: true,
        data: {
          token,
          user: payload,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Failed to login' });
    }
  }

  async register(req, res) {
    const client = await pool.connect();
    try {
      const {
        role,
        email,
        password,
        first_name_en,
        last_name_en,
        first_name_ar,
        last_name_ar,
        phone,
        national_id,
        student_id,
        employee_id,
        title,
        gender,
        date_of_birth,
        faculty_id,
        department_id,
        specialization_id,
        admission_type,
      } = req.body;

      const normalizedRole = role?.toLowerCase();
      if (!['student', 'doctor'].includes(normalizedRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      const existingRequest = await client.query('SELECT id FROM account_requests WHERE email = $1', [email]);
      if (existingRequest.rows.length > 0) {
        return res.status(409).json({ success: false, message: 'Registration request already submitted' });
      }

      if (national_id) {
        const existingNationalId = await client.query(
          'SELECT id FROM account_requests WHERE national_id = $1',
          [national_id]
        );
        if (existingNationalId.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'National ID already submitted' });
        }

        const existingNationalStudent = await client.query(
          'SELECT id FROM students WHERE national_id = $1',
          [national_id]
        );
        if (existingNationalStudent.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'National ID already registered' });
        }
      }

      if (normalizedRole === 'student' && student_id) {
        const existingStudentRequest = await client.query(
          'SELECT id FROM account_requests WHERE student_id = $1',
          [student_id]
        );
        if (existingStudentRequest.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'Student ID already submitted' });
        }

        const existingStudent = await client.query(
          'SELECT id FROM students WHERE student_id = $1',
          [student_id]
        );
        if (existingStudent.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'Student ID already exists' });
        }
      }

      if (normalizedRole === 'doctor' && employee_id) {
        const existingDoctorRequest = await client.query(
          'SELECT id FROM account_requests WHERE employee_id = $1',
          [employee_id]
        );
        if (existingDoctorRequest.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'Employee ID already submitted' });
        }

        const existingInstructor = await client.query(
          'SELECT id FROM instructors WHERE employee_id = $1',
          [employee_id]
        );
        if (existingInstructor.rows.length > 0) {
          return res.status(409).json({ success: false, message: 'Employee ID already exists' });
        }
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO account_requests (
          role, email, password_hash, first_name_en, last_name_en, first_name_ar, last_name_ar,
          phone, national_id, student_id, employee_id, title, gender, date_of_birth,
          faculty_id, department_id, specialization_id, admission_type
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18
        )
        RETURNING id, role, email, status, requested_at
      `;

      const result = await client.query(insertQuery, [
        normalizedRole,
        email,
        passwordHash,
        first_name_en,
        last_name_en,
        first_name_ar || null,
        last_name_ar || null,
        phone || null,
        national_id || null,
        normalizedRole === 'student' ? student_id : null,
        normalizedRole === 'doctor' ? employee_id : null,
        normalizedRole === 'doctor' ? title : null,
        gender || null,
        date_of_birth || null,
        faculty_id,
        department_id || null,
        specialization_id || null,
        admission_type || null,
      ]);

      return res.status(201).json({
        success: true,
        message: 'Registration request submitted. Awaiting admin approval.',
        data: result.rows[0],
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({ success: false, message: 'Failed to submit registration request' });
    } finally {
      client.release();
    }
  }

  async me(req, res) {
    return res.json({ success: true, data: req.user });
  }
}

module.exports = new AuthController();
