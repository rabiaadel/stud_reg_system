const { pool } = require('../config/database');
const winston = require('winston');

class StudentController {
  // Get student profile
  async getStudentProfile(req, res) {
    try {
      const { studentId } = req.params;

      const query = `
        SELECT
          s.id,
          s.student_id,
          s.first_name_en,
          s.last_name_en,
          s.first_name_ar,
          s.last_name_ar,
          s.email,
          s.phone,
          s.date_of_birth,
          s.gender,
          s.national_id,
          s.admission_date,
          s.admission_type,
          s.current_level,
          s.total_credits_passed,
          s.cgpa,
          s.is_dismissed,
          s.dismissal_date,
          s.dismissal_reason,
          s.is_active,
          f.name_en as faculty_name,
          sp.name_en as specialization_name
        FROM students s
        LEFT JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN specializations sp ON s.specialization_id = sp.id
        WHERE s.id = $1
      `;

      const result = await pool.query(query, [studentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      winston.error('Error getting student profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get student profile',
      });
    }
  }

  // Update student profile
  async updateStudentProfile(req, res) {
    try {
      const { studentId } = req.params;
      const updates = req.body;

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

      values.push(studentId);

      const query = `
        UPDATE students
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      res.json({
        success: true,
        message: 'Student profile updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      winston.error('Error updating student profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student profile',
      });
    }
  }

  // Check registration eligibility
  async checkEligibility(req, res) {
    try {
      const { studentId } = req.params;
      const { semester_id } = req.query;

      // Get student info
      const studentQuery = `
        SELECT
          s.*,
          f.name_en as faculty_name,
          sp.name_en as specialization_name,
          sas.is_on_warning,
          sas.total_warning_count,
          sas.consecutive_warning_count,
          ge.is_eligible as graduation_eligible,
          ge.credits_remaining
        FROM students s
        LEFT JOIN faculties f ON s.faculty_id = f.id
        LEFT JOIN specializations sp ON s.specialization_id = sp.id
        LEFT JOIN student_academic_standing sas ON s.id = sas.student_id
        LEFT JOIN graduation_eligibility ge ON s.id = ge.student_id
        WHERE s.id = $1
      `;

      const studentResult = await pool.query(studentQuery, [studentId]);

      if (studentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found',
        });
      }

      const student = studentResult.rows[0];

      // Get current semester
      let semesterQuery;
      let semesterParams;

      if (semester_id) {
        semesterQuery = 'SELECT * FROM semesters WHERE id = $1';
        semesterParams = [semester_id];
      } else {
        semesterQuery = 'SELECT * FROM semesters WHERE is_active = true AND faculty_id = $1 LIMIT 1';
        semesterParams = [student.faculty_id];
      }

      const semesterResult = await pool.query(semesterQuery, semesterParams);
      const semester = semesterResult.rows[0];

      // Get registration constraints
      const constraintsQuery = `
        SELECT * FROM registration_constraints
        WHERE specialization_id = $1 AND academic_level = $2
        ORDER BY min_cgpa DESC
        LIMIT 1
      `;

      const constraintsResult = await pool.query(constraintsQuery, [
        student.specialization_id,
        student.current_level
      ]);

      const constraints = constraintsResult.rows[0];

      // Check deadlines
      const deadlineQuery = `
        SELECT * FROM semester_deadlines
        WHERE semester_id = $1 AND deadline_code = 'registration_open'
        LIMIT 1
      `;

      const deadlineResult = await pool.query(deadlineQuery, [semester.id]);
      const deadline = deadlineResult.rows[0];

      const canRegister = !student.is_dismissed &&
                         student.is_active &&
                         (!deadline || new Date() <= new Date(deadline.deadline_date));

      res.json({
        success: true,
        data: {
          student_id: student.student_id,
          name: `${student.first_name_en} ${student.last_name_en}`,
          specialization: student.specialization_name,
          current_level: student.current_level,
          cgpa: student.cgpa,
          total_credits_passed: student.total_credits_passed,
          status: student.is_active ? (student.is_dismissed ? 'Dismissed' : 'Active') : 'Inactive',
          is_on_warning: student.is_on_warning,
          is_dismissed: student.is_dismissed,
          can_register: canRegister,
          registration_constraints: constraints ? {
            min_credits: constraints.min_credits,
            max_credits: constraints.max_credits,
            min_cgpa_required: constraints.min_cgpa,
            current_cgpa: student.cgpa
          } : null,
          semester: semester ? {
            id: semester.id,
            name: `${semester.semester_name} ${semester.academic_year}`,
            registration_deadline: deadline ? deadline.deadline_date : null,
            days_until_deadline: deadline ? Math.ceil((new Date(deadline.deadline_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
          } : null,
          graduation_eligible: student.graduation_eligible,
          credits_remaining: student.credits_remaining
        }
      });
    } catch (error) {
      winston.error('Error checking eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check eligibility',
      });
    }
  }

  // Get planned schedule
  async getPlannedSchedule(req, res) {
    try {
      const { studentId } = req.params;
      const { semester_id } = req.query;

      // Get current semester if not specified
      let semesterId = semester_id;
      if (!semesterId) {
        const semesterQuery = `
          SELECT s.id
          FROM semesters s
          JOIN students st ON s.faculty_id = st.faculty_id
          WHERE st.id = $1 AND s.is_active = true
          LIMIT 1
        `;
        const semesterResult = await pool.query(semesterQuery, [studentId]);
        if (semesterResult.rows.length > 0) {
          semesterId = semesterResult.rows[0].id;
        }
      }

      if (!semesterId) {
        return res.status(400).json({
          success: false,
          message: 'No active semester found',
        });
      }

      // Get registered courses for the semester
      const coursesQuery = `
        SELECT
          c.id,
          c.code,
          c.name_en,
          c.name_ar,
          c.credit_hours,
          c.level,
          cs.section,
          cs.day_of_week,
          cs.start_time,
          cs.end_time,
          cs.location,
          cs.instructor_id,
          sr.status,
          sr.registration_date
        FROM student_registrations sr
        JOIN courses c ON sr.course_id = c.id
        LEFT JOIN course_schedules cs ON c.id = cs.course_id AND cs.semester_id = sr.semester_id
        WHERE sr.student_id = $1 AND sr.semester_id = $2
        ORDER BY cs.day_of_week, cs.start_time
      `;

      const coursesResult = await pool.query(coursesQuery, [studentId, semesterId]);

      // Get semester info
      const semesterQuery = 'SELECT * FROM semesters WHERE id = $1';
      const semesterResult = await pool.query(semesterQuery, [semesterId]);
      const semester = semesterResult.rows[0];

      const totalCredits = coursesResult.rows.reduce((sum, course) => sum + course.credit_hours, 0);

      res.json({
        success: true,
        data: {
          student_id: studentId,
          semester: `${semester.semester_name} ${semester.academic_year}`,
          total_courses: coursesResult.rows.length,
          total_credits: totalCredits,
          courses: coursesResult.rows.map(course => ({
            course_id: course.id,
            course_code: course.code,
            course_name: course.name_en,
            credit_hours: course.credit_hours,
            level: course.level,
            status: course.status,
            registration_date: course.registration_date,
            schedules: course.section ? [{
              section: course.section,
              day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][course.day_of_week],
              time: `${course.start_time} - ${course.end_time}`,
              location: course.location,
              instructor_id: course.instructor_id
            }] : []
          }))
        }
      });
    } catch (error) {
      winston.error('Error getting planned schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get planned schedule',
      });
    }
  }

  // Register for courses
  async registerCourses(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { studentId } = req.params;
      const { course_ids, semester_id, notes } = req.body;

      // Check eligibility first
      const eligibilityCheck = await this.checkEligibilityLogic(client, studentId, semester_id);
      if (!eligibilityCheck.canRegister) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: eligibilityCheck.reason,
        });
      }

      // Validate courses and check prerequisites
      for (const courseId of course_ids) {
        const validation = await this.validateCourseRegistration(client, studentId, courseId, semester_id);
        if (!validation.valid) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Cannot register for course ${validation.courseCode}: ${validation.reason}`,
          });
        }
      }

      // Check credit limits
      const creditCheck = await this.checkCreditLimits(client, studentId, course_ids, semester_id);
      if (!creditCheck.valid) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: creditCheck.reason,
        });
      }

      // Register courses
      const registrations = [];
      for (const courseId of course_ids) {
        const registrationQuery = `
          INSERT INTO student_registrations (student_id, semester_id, course_id, status, registration_date)
          VALUES ($1, $2, $3, 'Registered', CURRENT_TIMESTAMP)
          RETURNING *
        `;

        const registrationResult = await client.query(registrationQuery, [studentId, semester_id, courseId]);
        registrations.push(registrationResult.rows[0]);
      }

      // Update student credits
      const creditsQuery = 'SELECT SUM(credit_hours) as total_credits FROM courses WHERE id = ANY($1)';
      const creditsResult = await client.query(creditsQuery, [course_ids]);
      const totalCredits = creditsResult.rows[0].total_credits;

      await client.query(
        'UPDATE students SET total_credits_passed = total_credits_passed + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [totalCredits, studentId]
      );

      // Recalculate GPA and standing
      await this.updateAcademicStanding(client, studentId, semester_id);

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          student_id: studentId,
          semester_id: semester_id,
          registered_courses: registrations.length,
          total_credits: totalCredits,
          registrations: registrations.map(reg => ({
            id: reg.id,
            course_id: reg.course_id,
            status: reg.status,
            registration_date: reg.registration_date
          }))
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error registering courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register courses',
      });
    } finally {
      client.release();
    }
  }

  // Helper method to check eligibility
  async checkEligibilityLogic(client, studentId, semesterId) {
    const studentQuery = 'SELECT * FROM students WHERE id = $1';
    const studentResult = await client.query(studentQuery, [studentId]);

    if (studentResult.rows.length === 0) {
      return { canRegister: false, reason: 'Student not found' };
    }

    const student = studentResult.rows[0];

    if (student.is_dismissed) {
      return { canRegister: false, reason: 'Student is dismissed' };
    }

    if (!student.is_active) {
      return { canRegister: false, reason: 'Student account is inactive' };
    }

    // Check registration deadline
    const deadlineQuery = `
      SELECT deadline_date FROM semester_deadlines
      WHERE semester_id = $1 AND deadline_code = 'registration_open'
    `;
    const deadlineResult = await client.query(deadlineQuery, [semesterId]);

    if (deadlineResult.rows.length > 0) {
      const deadline = new Date(deadlineResult.rows[0].deadline_date);
      if (new Date() > deadline) {
        return { canRegister: false, reason: 'Registration deadline has passed' };
      }
    }

    return { canRegister: true };
  }

  // Helper method to validate course registration
  async validateCourseRegistration(client, studentId, courseId, semesterId) {
    // Check if course exists and is active
    const courseQuery = 'SELECT * FROM courses WHERE id = $1 AND is_active = true';
    const courseResult = await client.query(courseQuery, [courseId]);

    if (courseResult.rows.length === 0) {
      return { valid: false, reason: 'Course not found or inactive', courseCode: 'Unknown' };
    }

    const course = courseResult.rows[0];

    // Check prerequisites
    const prereqQuery = `
      SELECT cp.prerequisite_course_id, c.code as prereq_code, c.name_en as prereq_name
      FROM course_prerequisites cp
      JOIN courses c ON cp.prerequisite_course_id = c.id
      WHERE cp.course_id = $1 AND cp.is_strict = true
    `;

    const prereqResult = await client.query(prereqQuery, [courseId]);

    for (const prereq of prereqResult.rows) {
      const gradeQuery = `
        SELECT sg.grade_points
        FROM student_grades sg
        JOIN student_registrations sr ON sg.student_registration_id = sr.id
        WHERE sr.student_id = $1 AND sr.course_id = $2 AND sg.is_first_attempt = true
        ORDER BY sg.created_at DESC
        LIMIT 1
      `;

      const gradeResult = await client.query(gradeQuery, [studentId, prereq.prerequisite_course_id]);

      if (gradeResult.rows.length === 0 || gradeResult.rows[0].grade_points < 1.0) {
        return {
          valid: false,
          reason: `Prerequisite not met: ${prereq.prereq_code} - ${prereq.prereq_name}`,
          courseCode: course.code
        };
      }
    }

    // Check for duplicate registration
    const duplicateQuery = `
      SELECT id FROM student_registrations
      WHERE student_id = $1 AND course_id = $2 AND semester_id = $3
    `;

    const duplicateResult = await client.query(duplicateQuery, [studentId, courseId, semesterId]);

    if (duplicateResult.rows.length > 0) {
      return { valid: false, reason: 'Already registered for this course', courseCode: course.code };
    }

    return { valid: true, courseCode: course.code };
  }

  // Helper method to check credit limits
  async checkCreditLimits(client, studentId, courseIds, semesterId) {
    // Get current registered credits
    const currentCreditsQuery = `
      SELECT COALESCE(SUM(c.credit_hours), 0) as current_credits
      FROM student_registrations sr
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.student_id = $1 AND sr.semester_id = $2 AND sr.status = 'Registered'
    `;

    const currentCreditsResult = await client.query(currentCreditsQuery, [studentId, semesterId]);
    const currentCredits = parseInt(currentCreditsResult.rows[0].current_credits);

    // Get new courses credits
    const newCreditsQuery = 'SELECT SUM(credit_hours) as new_credits FROM courses WHERE id = ANY($1)';
    const newCreditsResult = await client.query(newCreditsQuery, [courseIds]);
    const newCredits = parseInt(newCreditsResult.rows[0].new_credits || 0);

    const totalCredits = currentCredits + newCredits;

    // Get student info for constraints
    const studentQuery = 'SELECT * FROM students WHERE id = $1';
    const studentResult = await client.query(studentQuery, [studentId]);
    const student = studentResult.rows[0];

    // Get constraints
    const constraintsQuery = `
      SELECT * FROM registration_constraints
      WHERE specialization_id = $1 AND academic_level = $2
      ORDER BY min_cgpa DESC
      LIMIT 1
    `;

    const constraintsResult = await client.query(constraintsQuery, [
      student.specialization_id,
      student.current_level
    ]);

    if (constraintsResult.rows.length > 0) {
      const constraints = constraintsResult.rows[0];

      if (totalCredits > constraints.max_credits) {
        return {
          valid: false,
          reason: `Credit limit exceeded. Maximum allowed: ${constraints.max_credits}, Current: ${currentCredits}, New: ${newCredits}, Total: ${totalCredits}`
        };
      }
    }

    return { valid: true };
  }

  // Helper method to update academic standing
  async updateAcademicStanding(client, studentId, semesterId) {
    // Recalculate CGPA
    const cgpaQuery = `
      UPDATE students
      SET cgpa = (
        SELECT COALESCE(AVG(sg.grade_points), 0)
        FROM student_grades sg
        JOIN student_registrations sr ON sg.student_registration_id = sr.id
        WHERE sr.student_id = students.id AND sg.is_first_attempt = true
      )
      WHERE id = $1
    `;

    await client.query(cgpaQuery, [studentId]);

    // Update or create academic standing
    const standingQuery = `
      INSERT INTO student_academic_standing (student_id, semester_id, gpa, cgpa, updated_at)
      VALUES ($1, $2,
        (SELECT cgpa FROM students WHERE id = $1),
        (SELECT cgpa FROM students WHERE id = $1),
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (student_id)
      DO UPDATE SET
        semester_id = EXCLUDED.semester_id,
        gpa = EXCLUDED.gpa,
        cgpa = EXCLUDED.cgpa,
        updated_at = CURRENT_TIMESTAMP
    `;

    await client.query(standingQuery, [studentId, semesterId]);
  }

  // Withdraw from course
  async withdrawCourse(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { studentId } = req.params;
      const { course_id, semester_id, reason, is_excused } = req.body;

      // Check withdrawal deadline
      const deadlineQuery = `
        SELECT deadline_date FROM semester_deadlines
        WHERE semester_id = $1 AND deadline_code = 'withdrawal'
      `;

      const deadlineResult = await client.query(deadlineQuery, [semester_id]);

      if (deadlineResult.rows.length > 0) {
        const deadline = new Date(deadlineResult.rows[0].deadline_date);
        if (new Date() > deadline) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: 'Withdrawal deadline has passed',
          });
        }
      }

      // Update registration status
      const updateQuery = `
        UPDATE student_registrations
        SET status = 'Withdrawn', withdrawal_date = CURRENT_TIMESTAMP, withdrawal_reason = $1, updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $2 AND course_id = $3 AND semester_id = $4 AND status = 'Registered'
        RETURNING *
      `;

      const updateResult = await client.query(updateQuery, [reason, studentId, course_id, semester_id]);

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Registration not found or already withdrawn',
        });
      }

      // Get course credits to deduct
      const creditsQuery = 'SELECT credit_hours FROM courses WHERE id = $1';
      const creditsResult = await client.query(creditsQuery, [course_id]);
      const credits = creditsResult.rows[0].credit_hours;

      // Update student credits
      await client.query(
        'UPDATE students SET total_credits_passed = total_credits_passed - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [credits, studentId]
      );

      // Create withdrawal record
      const withdrawalQuery = `
        INSERT INTO student_withdrawals (student_id, semester_id, withdrawal_type, reason, is_excused, approved_date)
        VALUES ($1, $2, 'Course', $3, $4, CURRENT_TIMESTAMP)
      `;

      await client.query(withdrawalQuery, [studentId, semester_id, reason, is_excused]);

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Withdrawal successful',
        data: {
          student_id: studentId,
          course_id: course_id,
          withdrawal_date: new Date(),
          grade_status: 'W (Withdrawn)'
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      winston.error('Error withdrawing from course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to withdraw from course',
      });
    } finally {
      client.release();
    }
  }

  // Get student grades
  async getStudentGrades(req, res) {
    try {
      const { studentId } = req.params;
      const { semester_id, course_id, include_history } = req.query;

      let query = `
        SELECT
          sg.*,
          c.code as course_code,
          c.name_en as course_name,
          c.credit_hours,
          s.semester_name,
          s.academic_year
        FROM student_grades sg
        JOIN student_registrations sr ON sg.student_registration_id = sr.id
        JOIN courses c ON sg.course_id = c.id
        JOIN semesters s ON sg.semester_id = s.id
        WHERE sg.student_id = $1
      `;

      const params = [studentId];
      let paramCount = 2;

      if (semester_id) {
        query += ` AND sg.semester_id = $${paramCount}`;
        params.push(semester_id);
        paramCount++;
      }

      if (course_id) {
        query += ` AND sg.course_id = $${paramCount}`;
        params.push(course_id);
        paramCount++;
      }

      if (!include_history || include_history === 'false') {
        query += ` AND sg.is_first_attempt = true`;
      }

      query += ` ORDER BY s.start_date DESC, c.code`;

      const result = await pool.query(query, params);

      // Calculate GPA
      const grades = result.rows;
      const totalPoints = grades.reduce((sum, grade) => sum + (grade.grade_points * grade.credit_hours), 0);
      const totalCredits = grades.reduce((sum, grade) => sum + grade.credit_hours, 0);
      const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(3) : 0;

      res.json({
        success: true,
        data: {
          student_id: studentId,
          total_courses: grades.length,
          courses_passed: grades.filter(g => g.grade_points >= 1.0).length,
          gpa: parseFloat(gpa),
          grades: grades.map(grade => ({
            semester: `${grade.semester_name} ${grade.academic_year}`,
            course_code: grade.course_code,
            course_name: grade.course_name,
            credit_hours: grade.credit_hours,
            coursework_score: grade.coursework_score,
            midterm_score: grade.midterm_score,
            final_exam_score: grade.final_exam_score,
            total_score: grade.total_score,
            grade_letter: grade.grade_letter,
            grade_points: grade.grade_points,
            is_first_attempt: grade.is_first_attempt
          }))
        }
      });
    } catch (error) {
      winston.error('Error getting student grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get student grades',
      });
    }
  }

  // Get academic standing
  async getAcademicStanding(req, res) {
    try {
      const { studentId } = req.params;

      const query = `
        SELECT
          sas.*,
          s.cgpa,
          s.current_level,
          s.total_credits_passed,
          COUNT(CASE WHEN sg.grade_letter = 'F' THEN 1 END) as failed_courses_count
        FROM student_academic_standing sas
        JOIN students s ON sas.student_id = s.id
        LEFT JOIN student_grades sg ON s.id = sg.student_id AND sg.is_first_attempt = true
        WHERE sas.student_id = $1
        GROUP BY sas.id, s.id
      `;

      const result = await pool.query(query, [studentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Academic standing not found',
        });
      }

      const standing = result.rows[0];

      // Determine academic classification
      let classification = 'Good Standing';
      if (standing.cgpa >= 3.5) classification = 'Excellent';
      else if (standing.cgpa >= 3.0) classification = 'Very Good';
      else if (standing.cgpa >= 2.5) classification = 'Good';
      else if (standing.cgpa >= 2.0) classification = 'Satisfactory';
      else classification = 'Unsatisfactory';

      res.json({
        success: true,
        data: {
          student_id: studentId,
          gpa_this_semester: standing.gpa,
          cgpa: standing.cgpa,
          status: standing.is_dismissed ? 'Dismissed' : (standing.is_on_warning ? 'Warning' : 'Active'),
          is_on_warning: standing.is_on_warning,
          warning_count: {
            consecutive: standing.consecutive_warning_count,
            total: standing.total_warning_count
          },
          is_dismissed: standing.is_dismissed,
          is_on_probation: standing.is_on_probation,
          is_honors_eligible: standing.is_honors_eligible,
          academic_classification: classification,
          details: {
            min_cgpa_for_honors: 3.0,
            no_failed_courses: standing.failed_courses_count === 0,
            max_semesters_for_honors: 8,
            current_semesters: Math.ceil(standing.total_credits_passed / 15) // Approximate
          }
        }
      });
    } catch (error) {
      winston.error('Error getting academic standing:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get academic standing',
      });
    }
  }

  // Issue academic warning (Admin only)
  async issueWarning(req, res) {
    try {
      const { studentId } = req.params;
      const { semester_id, reason, notes } = req.body;

      // Update academic standing
      const updateQuery = `
        UPDATE student_academic_standing
        SET
          is_on_warning = true,
          total_warning_count = total_warning_count + 1,
          consecutive_warning_count = consecutive_warning_count + 1,
          notes = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $2
      `;

      await pool.query(updateQuery, [notes, studentId]);

      // Create notification
      const notificationQuery = `
        INSERT INTO notifications (student_id, notification_type, title, message, created_at)
        VALUES ($1, 'Warning', 'Academic Warning Issued', $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(notificationQuery, [studentId, `Academic warning issued: ${reason}`]);

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, entity_id, old_value, new_value, created_at)
        VALUES ('ISSUE_WARNING', 'student', $1, NULL, $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [studentId, JSON.stringify({ reason, notes, semester_id })]);

      res.json({
        success: true,
        message: 'Academic warning issued successfully',
        data: {
          student_id: studentId,
          warning_issued: true,
          reason: reason,
          issued_date: new Date()
        }
      });
    } catch (error) {
      winston.error('Error issuing warning:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to issue warning',
      });
    }
  }

  // Dismiss student (Admin only)
  async dismissStudent(req, res) {
    try {
      const { studentId } = req.params;
      const { reason, dismissal_type, notes } = req.body;

      // Update student
      const studentUpdateQuery = `
        UPDATE students
        SET
          is_dismissed = true,
          dismissal_date = CURRENT_TIMESTAMP,
          dismissal_reason = $1,
          is_active = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await pool.query(studentUpdateQuery, [reason, studentId]);

      // Update academic standing
      const standingUpdateQuery = `
        UPDATE student_academic_standing
        SET
          is_dismissed = true,
          dismissal_reason = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE student_id = $2
      `;

      await pool.query(standingUpdateQuery, [reason, studentId]);

      // Create notification
      const notificationQuery = `
        INSERT INTO notifications (student_id, notification_type, title, message, created_at)
        VALUES ($1, 'Dismissal', 'Student Dismissed', $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(notificationQuery, [studentId, `Student dismissed: ${reason}`]);

      // Log audit
      const auditQuery = `
        INSERT INTO audit_logs (action, entity_type, entity_id, old_value, new_value, created_at)
        VALUES ('DISMISS_STUDENT', 'student', $1, NULL, $2, CURRENT_TIMESTAMP)
      `;

      await pool.query(auditQuery, [studentId, JSON.stringify({ reason, dismissal_type, notes })]);

      res.json({
        success: true,
        message: 'Student dismissed successfully',
        data: {
          student_id: studentId,
          is_dismissed: true,
          dismissal_date: new Date(),
          dismissal_reason: reason
        }
      });
    } catch (error) {
      winston.error('Error dismissing student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to dismiss student',
      });
    }
  }

  // Get graduation eligibility
  async getGraduationEligibility(req, res) {
    try {
      const { studentId } = req.params;

      const query = `
        SELECT * FROM graduation_eligibility WHERE student_id = $1
      `;

      const result = await pool.query(query, [studentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Graduation eligibility not found',
        });
      }

      const eligibility = result.rows[0];

      res.json({
        success: true,
        data: {
          student_id: studentId,
          graduation_eligible: eligibility.is_eligible,
          eligibility_status: eligibility.is_eligible ? 'Eligible - All requirements met' : 'Not Eligible',
          credits: {
            required: eligibility.total_credits_required,
            earned: eligibility.total_credits_passed,
            remaining: eligibility.credits_remaining
          },
          cgpa: {
            current: eligibility.cgpa,
            minimum_required: eligibility.min_cgpa_required,
            meets_requirement: eligibility.cgpa >= eligibility.min_cgpa_required
          },
          requirements: {
            credits: {
              status: eligibility.credits_remaining <= 0 ? 'Completed' : 'Incomplete',
              value: eligibility.total_credits_passed,
              requirement: eligibility.total_credits_required
            },
            cgpa: {
              status: eligibility.cgpa >= eligibility.min_cgpa_required ? 'Meets' : 'Below',
              value: eligibility.cgpa,
              requirement: eligibility.min_cgpa_required
            }
          },
          honors_eligible: eligibility.is_honors_eligible,
          estimated_graduation_date: eligibility.estimated_graduation_date
        }
      });
    } catch (error) {
      winston.error('Error getting graduation eligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get graduation eligibility',
      });
    }
  }

  // Get progress tracking
  async getProgressTracking(req, res) {
    try {
      const { studentId } = req.params;

      const query = `
        SELECT * FROM student_progress_tracking
        WHERE student_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [studentId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Progress tracking not found',
        });
      }

      const progress = result.rows[0];

      res.json({
        success: true,
        data: {
          student_id: studentId,
          progress_percentage: progress.cgpa * 100 / 4, // Assuming 4.0 scale
          current_semester: progress.semester_id,
          semester_progress: {
            courses_registered: progress.total_courses_registered,
            credits_registered: progress.total_credits_registered,
            courses_passed: progress.courses_passed,
            credits_passed: progress.credits_passed,
            total_credits_required: 132, // From bylaws
            total_credits_accumulated: progress.total_credits_accumulated
          },
          academic_standing: progress.cgpa >= 2.0 ? 'Good Standing' : 'Academic Warning',
          cgpa: progress.cgpa
        }
      });
    } catch (error) {
      winston.error('Error getting progress tracking:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get progress tracking',
      });
    }
  }

  // Get standing history
  async getStandingHistory(req, res) {
    try {
      const { studentId } = req.params;
      const { from_semester_id, to_semester_id } = req.query;

      let query = `
        SELECT
          sas.*,
          s.semester_name,
          s.academic_year
        FROM student_academic_standing sas
        JOIN semesters s ON sas.semester_id = s.id
        WHERE sas.student_id = $1
      `;

      const params = [studentId];
      let paramCount = 2;

      if (from_semester_id) {
        query += ` AND sas.semester_id >= $${paramCount}`;
        params.push(from_semester_id);
        paramCount++;
      }

      if (to_semester_id) {
        query += ` AND sas.semester_id <= $${paramCount}`;
        params.push(to_semester_id);
        paramCount++;
      }

      query += ` ORDER BY s.start_date DESC`;

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          student_id: studentId,
          standing_history: result.rows.map(standing => ({
            semester: `${standing.semester_name} ${standing.academic_year}`,
            gpa: standing.gpa,
            cgpa: standing.cgpa,
            courses_passed: standing.courses_passed || 0,
            courses_failed: standing.courses_failed || 0,
            total_credits: standing.total_credits || 0,
            status: standing.is_dismissed ? 'Dismissed' : (standing.is_on_warning ? 'Warning' : 'Active'),
            warning_status: standing.is_on_warning ? 'Active Warning' : null,
            remarks: standing.notes || 'No remarks'
          }))
        }
      });
    } catch (error) {
      winston.error('Error getting standing history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get standing history',
      });
    }
  }
}

module.exports = new StudentController();