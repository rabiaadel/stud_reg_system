const { pool } = require('../config/database');
const winston = require('winston');

class GraduationEligibilityService {
  /**
   * Check graduation eligibility based on Tanta University bylaws
   * Requirements:
   * - 132 total credits with GPA >= 2.0
   * - Complete all required courses
   * - Graduation project completed
   * - Training/internship completed
   * - Not dismissed
   * - No incomplete enrollments
   */
  async checkGraduationEligibility(studentId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get student and specialization info
      const studentQuery = `
        SELECT s.*, sp.total_credits as required_credits, sp.min_cgpa
        FROM students s
        LEFT JOIN specializations sp ON s.specialization_id = sp.id
        WHERE s.id = $1
      `;
      const studentResult = await client.query(studentQuery, [studentId]);
      if (studentResult.rows.length === 0) throw new Error('Student not found');
      const student = studentResult.rows[0];

      const eligibility = {
        is_eligible: true,
        student_id: studentId,
        missing_requirements: [],
        requirements_met: [],
        errors: []
      };

      // Check 1: Dismissal status
      if (student.is_dismissed) {
        eligibility.is_eligible = false;
        eligibility.errors.push('Student has been dismissed from faculty');
      }

      // Check 2: Total credits requirement (need 132 credits)
      const creditsQuery = `
        SELECT COALESCE(SUM(c.credit_hours), 0) as credits_passed
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1 AND sg.grade_points >= 1.0 AND sg.is_first_attempt = true
      `;
      const creditsResult = await client.query(creditsQuery, [studentId]);
      const creditsPassed = parseInt(creditsResult.rows[0].credits_passed);
      const requiredCredits = student.required_credits || 132;

      if (creditsPassed >= requiredCredits) {
        eligibility.requirements_met.push({
          requirement: 'Total Credits',
          required: requiredCredits,
          completed: creditsPassed,
          status: 'met'
        });
      } else {
        eligibility.is_eligible = false;
        eligibility.missing_requirements.push({
          requirement: 'Total Credits',
          required: requiredCredits,
          completed: creditsPassed,
          remaining: requiredCredits - creditsPassed
        });
      }

      // Check 3: Minimum CGPA (typically 2.0)
      const cgpaQuery = `
        SELECT COALESCE(AVG(sg.grade_points), 0) as cgpa
        FROM student_grades sg
        WHERE sg.student_id = $1 AND sg.is_first_attempt = true
      `;
      const cgpaResult = await client.query(cgpaQuery, [studentId]);
      const cgpa = parseFloat(cgpaResult.rows[0].cgpa).toFixed(3);
      const minCgpa = student.min_cgpa || 2.0;

      if (parseFloat(cgpa) >= minCgpa) {
        eligibility.requirements_met.push({
          requirement: 'Minimum CGPA',
          required: minCgpa,
          completed: parseFloat(cgpa),
          status: 'met'
        });
      } else {
        eligibility.is_eligible = false;
        eligibility.missing_requirements.push({
          requirement: 'Minimum CGPA',
          required: minCgpa,
          completed: parseFloat(cgpa)
        });
      }

      // Check 4: Graduation Project (PR411 and PR412 - 6 credit hours)
      const projectQuery = `
        SELECT COUNT(*) as completed_projects, COALESCE(SUM(c.credit_hours), 0) as project_credits
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1 
          AND c.code IN ('PR411', 'PR412')
          AND sg.grade_points >= 1.0
      `;
      const projectResult = await client.query(projectQuery, [studentId]);
      const projectsCompleted = parseInt(projectResult.rows[0].completed_projects);
      const projectCreditsEarned = parseInt(projectResult.rows[0].project_credits);

      if (projectsCompleted >= 2) {
        eligibility.requirements_met.push({
          requirement: 'Graduation Projects',
          required: 2,
          completed: projectsCompleted,
          status: 'met'
        });
      } else {
        eligibility.is_eligible = false;
        eligibility.missing_requirements.push({
          requirement: 'Graduation Projects',
          required: 2,
          completed: projectsCompleted
        });
      }

      // Check 5: Training/Internship completion
      const trainingQuery = `
        SELECT COUNT(*) as completed_training
        FROM student_grades sg
        JOIN courses c ON sg.course_id = c.id
        WHERE sg.student_id = $1 
          AND c.code = 'TRAIN101'
          AND sg.grade_points >= 0  -- Training doesn't need passing grade
      `;
      const trainingResult = await client.query(trainingQuery, [studentId]);
      const trainingCompleted = parseInt(trainingResult.rows[0].completed_training) > 0;

      if (trainingCompleted) {
        eligibility.requirements_met.push({
          requirement: 'Training/Internship',
          status: 'met'
        });
      } else {
        eligibility.is_eligible = false;
        eligibility.missing_requirements.push({
          requirement: 'Training/Internship',
          status: 'not_met'
        });
      }

      // Check 6: No incomplete grades
      const incompleteQuery = `
        SELECT COUNT(*) as incomplete_count
        FROM student_grades sg
        WHERE sg.student_id = $1 AND sg.grade_letter = 'I'
      `;
      const incompleteResult = await client.query(incompleteQuery, [studentId]);
      const incompleteCount = parseInt(incompleteResult.rows[0].incomplete_count);

      if (incompleteCount === 0) {
        eligibility.requirements_met.push({
          requirement: 'No Incomplete Grades',
          status: 'met'
        });
      } else {
        eligibility.is_eligible = false;
        eligibility.missing_requirements.push({
          requirement: 'Incomplete Grades',
          incomplete_count: incompleteCount
        });
      }

      // Calculate estimated graduation date
      let estimatedGraduationDate = null;
      if (eligibility.is_eligible) {
        estimatedGraduationDate = new Date().toISOString().split('T')[0];
      }

      // Determine honors eligibility (CGPA >= 3.5)
      const isHonorsEligible = parseFloat(cgpa) >= 3.5;

      // Update graduation eligibility record
      const updateQuery = `
        INSERT INTO graduation_eligibility
        (student_id, total_credits_passed, total_credits_required, credits_remaining, cgpa, min_cgpa_required, is_eligible, is_honors_eligible, project_status, training_status, missing_requirements, estimated_graduation_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (student_id)
        DO UPDATE SET
          total_credits_passed = $2,
          total_credits_required = $3,
          credits_remaining = $4,
          cgpa = $5,
          min_cgpa_required = $6,
          is_eligible = $7,
          is_honors_eligible = $8,
          project_status = $9,
          training_status = $10,
          missing_requirements = $11,
          estimated_graduation_date = $12,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;

      const missingRequirementsJson = JSON.stringify(eligibility.missing_requirements);
      const projectStatus = projectsCompleted >= 2 ? 'completed' : 'in_progress';
      const trainingStatus = trainingCompleted ? 'completed' : 'not_started';

      await client.query(updateQuery, [
        studentId,
        creditsPassed,
        requiredCredits,
        Math.max(0, requiredCredits - creditsPassed),
        cgpa,
        minCgpa,
        eligibility.is_eligible,
        isHonorsEligible,
        projectStatus,
        trainingStatus,
        missingRequirementsJson,
        estimatedGraduationDate
      ]);

      await client.query('COMMIT');

      return {
        ...eligibility,
        graduation_summary: {
          is_eligible: eligibility.is_eligible,
          cgpa: parseFloat(cgpa),
          total_credits_earned: creditsPassed,
          total_credits_required: requiredCredits,
          is_honors_eligible: isHonorsEligible,
          estimated_graduation_date: estimatedGraduationDate
        }
      };
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error checking graduation eligibility:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get detailed graduation progress
   */
  async getGraduationProgress(studentId) {
    try {
      const query = `
        SELECT 
          ge.*,
          s.student_id,
          s.first_name_en,
          s.last_name_en,
          sp.name_en as specialization
        FROM graduation_eligibility ge
        JOIN students s ON ge.student_id = s.id
        LEFT JOIN specializations sp ON s.specialization_id = sp.id
        WHERE ge.student_id = $1
      `;

      const result = await pool.query(query, [studentId]);
      if (result.rows.length === 0) throw new Error('No graduation eligibility record found');

      const ge = result.rows[0];
      const progressPercent = Math.round((ge.total_credits_passed / ge.total_credits_required) * 100);

      return {
        student: {
          id: ge.student_id,
          full_name: `${ge.first_name_en} ${ge.last_name_en}`,
          specialization: ge.specialization
        },
        graduation_progress: {
          credits_earned: ge.total_credits_passed,
          credits_required: ge.total_credits_required,
          credits_remaining: ge.credits_remaining,
          progress_percentage: progressPercent
        },
        cgpa_status: {
          current_cgpa: parseFloat(ge.cgpa).toFixed(3),
          minimum_required: ge.min_cgpa_required,
          meets_requirement: parseFloat(ge.cgpa) >= ge.min_cgpa_required
        },
        project_status: ge.project_status,
        training_status: ge.training_status,
        is_eligible: ge.is_eligible,
        is_honors_eligible: ge.is_honors_eligible,
        missing_requirements: JSON.parse(ge.missing_requirements || '[]'),
        estimated_graduation_date: ge.estimated_graduation_date
      };
    } catch (error) {
      winston.error('Error getting graduation progress:', error);
      throw error;
    }
  }
}

module.exports = GraduationEligibilityService;
