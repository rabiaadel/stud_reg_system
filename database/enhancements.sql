-- ============================================================================
-- INSTRUCTOR AND COURSE ASSIGNMENT MANAGEMENT
-- ============================================================================

-- Users Table (core RBAC dependency)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'doctor', 'admin')), -- 'student', 'doctor', 'admin'
    faculty_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Account Requests Table (pending approvals)
CREATE TABLE IF NOT EXISTS account_requests (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'doctor')),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name_en VARCHAR(100) NOT NULL,
    last_name_en VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    phone VARCHAR(20),
    national_id VARCHAR(20),
    student_id VARCHAR(20),
    employee_id VARCHAR(20),
    title VARCHAR(50),
    gender CHAR(1),
    date_of_birth DATE,
    faculty_id INTEGER NOT NULL,
    department_id INTEGER,
    specialization_id INTEGER,
    admission_type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    eligibility_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'verified', 'failed')),
    eligibility_notes TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by INTEGER,
    rejection_reason TEXT,
    approved_user_id INTEGER,
    metadata JSONB,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CHECK (
      (role = 'student' AND student_id IS NOT NULL AND employee_id IS NULL)
      OR (role = 'doctor' AND employee_id IS NOT NULL AND student_id IS NULL)
    )
);
CREATE UNIQUE INDEX idx_account_requests_email ON account_requests(email);
CREATE INDEX idx_account_requests_status ON account_requests(status);
CREATE INDEX idx_account_requests_role ON account_requests(role);
CREATE UNIQUE INDEX idx_account_requests_student_id ON account_requests(student_id) WHERE student_id IS NOT NULL;
CREATE UNIQUE INDEX idx_account_requests_employee_id ON account_requests(employee_id) WHERE employee_id IS NOT NULL;
CREATE UNIQUE INDEX idx_account_requests_national_id ON account_requests(national_id) WHERE national_id IS NOT NULL;

ALTER TABLE account_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
  ALTER TABLE students
    ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_national_id ON students(national_id) WHERE national_id IS NOT NULL;

-- ============================================================================
-- AUTOMATIC UPDATED_AT MAINTENANCE
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GPA & STANDING RECOMPUTATION HELPERS
-- ============================================================================
CREATE OR REPLACE FUNCTION recalc_student_gpa(p_student_id INTEGER)
RETURNS TABLE (gpa NUMERIC, cgpa NUMERIC, total_credits INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH grade_cte AS (
    SELECT
      sg.semester_id,
      SUM(c.credit_hours * sg.grade_points) AS points,
      SUM(c.credit_hours) AS credits
    FROM student_grades sg
    JOIN courses c ON c.id = sg.course_id
    WHERE sg.student_id = p_student_id
    GROUP BY sg.semester_id
  ),
  aggregate_cte AS (
    SELECT
      CASE WHEN SUM(credits) > 0 THEN ROUND(SUM(points) / SUM(credits), 3) ELSE 0 END AS cgpa,
      (SELECT CASE WHEN credits > 0 THEN ROUND(points / credits, 3) ELSE 0 END FROM grade_cte ORDER BY semester_id DESC LIMIT 1) AS gpa,
      COALESCE(SUM(credits), 0) AS total_credits
    FROM grade_cte
  )
  SELECT gpa, cgpa, total_credits FROM aggregate_cte;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION recalc_student_standing(p_student_id INTEGER)
RETURNS VOID AS $$
DECLARE
  agg RECORD;
  current_sem INTEGER;
  warning_threshold CONSTANT NUMERIC := 2.0;
  dismissal_threshold CONSTANT NUMERIC := 1.5;
BEGIN
  SELECT * INTO agg FROM recalc_student_gpa(p_student_id);
  SELECT MAX(semester_id) INTO current_sem FROM student_grades WHERE student_id = p_student_id;

  IF agg IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO student_academic_standing (student_id, semester_id, gpa, cgpa, is_on_warning, is_dismissed, created_at, updated_at)
  VALUES (
    p_student_id,
    current_sem,
    agg.gpa,
    agg.cgpa,
    (agg.cgpa < warning_threshold),
    (agg.cgpa <= dismissal_threshold),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (student_id)
  DO UPDATE SET
    semester_id = EXCLUDED.semester_id,
    gpa = EXCLUDED.gpa,
    cgpa = EXCLUDED.cgpa,
    is_on_warning = EXCLUDED.is_on_warning,
    is_dismissed = EXCLUDED.is_dismissed,
    updated_at = CURRENT_TIMESTAMP;

  UPDATE students
  SET cgpa = agg.cgpa,
      total_credits_passed = agg.total_credits,
      is_dismissed = (agg.cgpa <= dismissal_threshold),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_recalc_standing()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalc_student_standing(OLD.student_id);
  ELSE
    PERFORM recalc_student_standing(NEW.student_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_grades_recalc ON student_grades;
CREATE TRIGGER trg_student_grades_recalc
AFTER INSERT OR UPDATE OR DELETE ON student_grades
FOR EACH ROW
EXECUTE FUNCTION trg_recalc_standing();

-- Instructors/Doctors Table
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    faculty_id INTEGER NOT NULL,
    first_name_en VARCHAR(100) NOT NULL,
    last_name_en VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    employee_id VARCHAR(20) UNIQUE,
    title VARCHAR(50), -- Professor, Associate Professor, Assistant Professor, etc.
    department_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE INDEX idx_instructors_faculty ON instructors(faculty_id);
CREATE INDEX idx_instructors_email ON instructors(email);

ALTER TABLE instructors ADD COLUMN IF NOT EXISTS user_id INTEGER;
DO $$
BEGIN
  ALTER TABLE instructors
    ADD CONSTRAINT fk_instructors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$ LANGUAGE plpgsql;
CREATE UNIQUE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);

-- Course Instructor Assignments Table
CREATE TABLE IF NOT EXISTS course_instructor_assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    instructor_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    section VARCHAR(10), -- Section A, B, C, etc.
    max_capacity INTEGER DEFAULT 50,
    enrolled_count INTEGER DEFAULT 0,
    schedule_json JSONB,
    classroom VARCHAR(100),
    assigned_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX idx_course_instructor_unique ON course_instructor_assignments(course_id, instructor_id, semester_id, section);
CREATE INDEX idx_course_instructor_semester ON course_instructor_assignments(semester_id);

ALTER TABLE course_instructor_assignments ADD COLUMN IF NOT EXISTS max_capacity INTEGER;
ALTER TABLE course_instructor_assignments ADD COLUMN IF NOT EXISTS schedule_json JSONB;
ALTER TABLE course_instructor_assignments ADD COLUMN IF NOT EXISTS classroom VARCHAR(100);
ALTER TABLE course_instructor_assignments ADD COLUMN IF NOT EXISTS assigned_by INTEGER;
DO $$
BEGIN
  ALTER TABLE course_instructor_assignments
    ADD CONSTRAINT fk_course_instructor_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- Specialization Course Requirements (maps courses to program rules)
CREATE TABLE IF NOT EXISTS specialization_course_requirements (
    id SERIAL PRIMARY KEY,
    specialization_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    requirement_type VARCHAR(50) NOT NULL, -- 'university', 'basic', 'core', 'elective', 'capstone', 'training'
    is_mandatory BOOLEAN DEFAULT TRUE,
    min_grade DECIMAL(3,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_spec_course_req_unique ON specialization_course_requirements(specialization_id, course_id, requirement_type);
CREATE INDEX idx_spec_course_req_course ON specialization_course_requirements(course_id);

-- Student Subject Modifications Table (Admin changing student courses)
CREATE TABLE IF NOT EXISTS student_subject_modifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    registration_id INTEGER,
    action_type VARCHAR(50) NOT NULL, -- 'ADD', 'REMOVE', 'REPLACE_FROM', 'REPLACE_TO'
    course_id INTEGER,
    new_course_id INTEGER,
    semester_id INTEGER NOT NULL,
    reason TEXT,
    requested_by INTEGER,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER, -- Admin user ID
    reviewer_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (registration_id) REFERENCES student_registrations(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (new_course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_modifications_student ON student_subject_modifications(student_id);
CREATE INDEX idx_modifications_status ON student_subject_modifications(status);
CREATE INDEX idx_modifications_requested_by ON student_subject_modifications(requested_by);

-- Enhanced Eligibility Rules Table
CREATE TABLE IF NOT EXISTS enhanced_eligibility_rules (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(50), -- 'prerequisite', 'gpa', 'credits', 'attendance', 'academic_level', 'custom'
    rule_type VARCHAR(20), -- 'numeric', 'boolean', 'condition'
    rule_parameters JSONB, -- Store flexible rule parameters
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_eligibility_rules_faculty ON enhanced_eligibility_rules(faculty_id);

-- Student Eligibility Exceptions Table (Admin can grant exceptions)
CREATE TABLE IF NOT EXISTS student_eligibility_exceptions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    eligibility_rule_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    approved_by INTEGER NOT NULL,
    approved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (eligibility_rule_id) REFERENCES enhanced_eligibility_rules(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_exceptions_student ON student_eligibility_exceptions(student_id);

-- Admin Activity Log Table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action_type VARCHAR(50),
    entity_type VARCHAR(50), -- 'student', 'course', 'instructor', 'registration', etc.
    entity_id INTEGER,
    entity_details JSONB,
    before_value JSONB,
    after_value JSONB,
    reason TEXT,
    ip_address INET,
    user_agent VARCHAR(500),
    status VARCHAR(20) DEFAULT 'Success', -- 'Success', 'Failed', 'Partial'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE INDEX idx_admin_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_entity ON admin_activity_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_date ON admin_activity_logs(created_at);

-- Apply updated_at triggers after all tables exist
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'universities','faculties','departments','specializations','courses',
    'academic_rules','students','student_registrations','student_grades',
    'student_academic_standing','course_schedules','course_instructor_assignments',
    'student_subject_modifications','admin_activity_logs','users','instructors',
    'account_requests','specialization_course_requirements',
    'enhanced_eligibility_rules','student_eligibility_exceptions'
  ])
  LOOP
    BEGIN
      EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', tbl || '_set_updated_at', tbl);
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
