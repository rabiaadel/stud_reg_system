// Enhanced Authentication Controller with Account Request System
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { jwt: jwtConfig } = require('../config/config');
const logger = require('../config/logger').default || console;

class EnhancedAuthController {
  /**
   * Enhanced Login with role-based redirect
   */
  async login(req, res) {
    const client = await pool.connect();
    try {
      const { email, password } = req.body;

      // Find user by email
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
        [email]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Get role-specific profile for additional info
      let profile = null;
      if (user.role === 'student') {
        const studentResult = await client.query(
          'SELECT * FROM students WHERE user_id = $1',
          [user.id]
        );
        profile = studentResult.rows[0] || null;
      } else if (user.role === 'doctor') {
        const instructorResult = await client.query(
          'SELECT * FROM instructors WHERE user_id = $1',
          [user.id]
        );
        profile = instructorResult.rows[0] || null;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          faculty_id: user.faculty_id,
          profile_id: profile?.id || null,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn || '7d' }
      );

      // Update last login
      await client.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            first_name: user.first_name,
            last_name: user.last_name,
            faculty_id: user.faculty_id,
          },
          profile,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  /**
   * Enhanced Registration - Create Account Request
   * User role and type selection during signup
   */
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
        gender,
        date_of_birth,
        faculty_id,
        specialization_id,
        department_id,
        // Student fields
        student_id,
        admission_type,
        // Doctor fields
        employee_id,
        title,
        academic_degree,
      } = req.body;

      // Validate user type
      if (!['student', 'doctor'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be student or doctor',
        });
      }

      // Check if email already exists
      const emailCheckResult = await client.query(
        'SELECT id FROM account_requests WHERE email = $1 AND status = $2',
        [email, 'approved']
      );

      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create account request for admin approval
      const insertResult = await client.query(
        `INSERT INTO account_requests (
          email, password_hash, role, first_name_en, last_name_en, 
          first_name_ar, last_name_ar, phone, national_id, gender, 
          date_of_birth, faculty_id, specialization_id, department_id,
          student_id, admission_type, employee_id, title, academic_degree,
          status, eligibility_status, ip_address, user_agent, requested_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, 'pending', 'pending', $20, $21, CURRENT_TIMESTAMP
        ) RETURNING id, email, role, first_name_en, last_name_en, status`,
        [
          email,
          hashedPassword,
          role,
          first_name_en,
          last_name_en,
          first_name_ar || first_name_en,
          last_name_ar || last_name_en,
          phone,
          national_id,
          gender,
          date_of_birth,
          faculty_id,
          specialization_id,
          department_id,
          student_id,
          admission_type,
          employee_id,
          title,
          academic_degree,
          req.ip,
          req.get('user-agent'),
        ]
      );

      const accountRequest = insertResult.rows[0];

      // Log signup activity
      await client.query(
        `INSERT INTO admin_activity_logs (
          action_type, entity_type, entity_id, after_value, status, ip_address, user_agent, created_at
        ) VALUES ('ACCOUNT_REQUEST_CREATED', 'account_request', $1, $2, 'Pending Approval', $3, $4, CURRENT_TIMESTAMP)`,
        [
          accountRequest.id,
          JSON.stringify(accountRequest),
          req.ip,
          req.get('user-agent'),
        ]
      );

      res.status(201).json({
        success: true,
        message: `${role === 'student' ? 'Student' : 'Doctor/Instructor'} account request submitted. Admin approval pending.`,
        data: {
          id: accountRequest.id,
          email: accountRequest.email,
          role: accountRequest.role,
          status: accountRequest.status,
          message: 'Your account is pending admin approval. You will receive a notification once approved.',
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  /**
   * Get current user info
   */
  async me(req, res) {
    const client = await pool.connect();
    try {
      const userId = req.user.id;

      const userResult = await client.query(
        'SELECT id, email, first_name, last_name, role, faculty_id FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const user = userResult.rows[0];

      // Get profile based on role
      let profile = null;
      if (user.role === 'student') {
        const studentResult = await client.query(
          'SELECT * FROM students WHERE user_id = $1',
          [userId]
        );
        profile = studentResult.rows[0];
      } else if (user.role === 'doctor') {
        const instructorResult = await client.query(
          'SELECT * FROM instructors WHERE user_id = $1',
          [userId]
        );
        profile = instructorResult.rows[0];
      }

      res.json({
        success: true,
        data: { user, profile },
      });
    } catch (error) {
      logger.error('Me endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user info',
        error: error.message,
      });
    } finally {
      client.release();
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required',
        });
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      const newToken = jwt.sign(
        {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
          faculty_id: decoded.faculty_id,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn || '7d' }
      );

      res.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  /**
   * Logout (token invalidation could be implemented with a blacklist)
   */
  async logout(req, res) {
    try {
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req, res) {
    const client = await pool.connect();
    try {
      const { email } = req.body;

      const userResult = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent',
        });
      }

      // Generate reset token (implementation would send via email)
      const resetToken = jwt.sign(
        { id: userResult.rows[0].id, type: 'password_reset' },
        jwtConfig.secret,
        { expiresIn: '1h' }
      );

      // In production, send this token via email
      logger.info(`Password reset requested for ${email}`);

      res.json({
        success: true,
        message: 'Password reset link has been sent to your email',
        data: { resetToken }, // Remove in production
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
      });
    } finally {
      client.release();
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req, res) {
    const client = await pool.connect();
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
      }

      const decoded = jwt.verify(token, jwtConfig.secret);
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({
          success: false,
          message: 'Invalid token type',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedPassword, decoded.id]
      );

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Password reset failed',
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
}

module.exports = new EnhancedAuthController();
