-- ========================================================================
-- ENHANCED DATABASE SCHEMA ADDITIONS - BYLAWS COMPLIANCE
-- Faculty of Computers and Informatics - Tanta University
-- ========================================================================

-- ========================================================================
-- USERS TABLE (Base for all user types)
-- ========================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'doctor', 'admin', 'super_admin')),
    faculty_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_faculty ON users(faculty_id);

-- ========================================================================
-- ACCOUNT REQUESTS TABLE (For signup approvals)
-- ========================================================================
CREATE TABLE IF NOT EXISTS account_requests (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'doctor')),
    first_name_en VARCHAR(100) NOT NULL,
    last_name_en VARCHAR(100) NOT NULL,
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    phone VARCHAR(20),
    national_id VARCHAR(20) UNIQUE NOT NULL,
    gender CHAR(1),
    date_of_birth DATE,
    faculty_id INTEGER NOT NULL,
    specialization_id INTEGER,
    department_id INTEGER,
    -- Student-specific fields
    student_id VARCHAR(20),
    admission_type VARCHAR(50),
    -- Doctor/Instructor-specific fields
    employee_id VARCHAR(20),
    title VARCHAR(100),
    academic_degree VARCHAR(100),
    -- Status fields
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'review')),
    eligibility_status VARCHAR(50) DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'verified', 'failed')),
    eligibility_notes TEXT,
    rejection_reason TEXT,
    -- Approval tracking
    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,
    approved_user_id INTEGER,
    -- Documents
    documents JSONB,
    admission_letter_path VARCHAR(255),
    national_id_path VARCHAR(255),
    certificate_path VARCHAR(255),
    -- Audit
    ip_address INET,
    user_agent VARCHAR(500),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE RESTRICT,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_account_requests_status ON account_requests(status);
CREATE INDEX idx_account_requests_role ON account_requests(role);
CREATE INDEX idx_account_requests_faculty ON account_requests(faculty_id);
CREATE INDEX idx_account_requests_national_id ON account_requests(national_id);
CREATE INDEX idx_account_requests_email ON account_requests(email);

-- ========================================================================
-- INSTRUCTORS/DOCTORS TABLE (Enhanced)
-- ========================================================================
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    faculty_id INTEGER NOT NULL,
    department_id INTEGER,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    office_location VARCHAR(255),
    office_hours TEXT,
    academic_degree VARCHAR(100),
    specialization VARCHAR(255),
    title VARCHAR(100),
    bio TEXT,
    research_interests JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
CREATE INDEX idx_instructors_faculty ON instructors(faculty_id);
CREATE INDEX idx_instructors_department ON instructors(department_id);
CREATE INDEX idx_instructors_employee_id ON instructors(employee_id);

-- ========================================================================
-- ACADEMIC WARNINGS TABLE (Bylaws Section IX)
-- ========================================================================
CREATE TABLE IF NOT EXISTS academic_warnings (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    warning_type VARCHAR(50) NOT NULL CHECK (warning_type IN ('GPA_BELOW_2.0', 'ATTENDANCE', 'ACADEMIC_PROBATION')),
    severity VARCHAR(20) CHECK (severity IN ('minor', 'major')),
    reason TEXT,
    cgpa_at_warning DECIMAL(3,3),
    issued_by INTEGER,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_academic_warnings_student ON academic_warnings(student_id);
CREATE INDEX idx_academic_warnings_semester ON academic_warnings(semester_id);
CREATE INDEX idx_academic_warnings_status ON academic_warnings(status);

-- ========================================================================
-- STUDENT DISMISSALS TABLE (Bylaws Section IX)
-- ========================================================================
CREATE TABLE IF NOT EXISTS student_dismissals (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    dismissal_type VARCHAR(50) NOT NULL CHECK (dismissal_type IN (
        'ACADEMIC_WARNING_CONSECUTIVE',
        'ACADEMIC_WARNING_TOTAL',
        'EXCEEDS_STUDY_DURATION',
        'POOR_ACADEMIC_STANDING',
        'ADMINISTRATIVE'
    )),
    reason TEXT NOT NULL,
    consecutive_warnings_count INTEGER,
    total_warnings_count INTEGER,
    semesters_studied INTEGER,
    approved_by INTEGER,
    dismissal_date DATE,
    is_final BOOLEAN DEFAULT TRUE,
    can_appeal BOOLEAN DEFAULT TRUE,
    appeal_deadline DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_student_dismissals_student ON student_dismissals(student_id);
CREATE INDEX idx_student_dismissals_type ON student_dismissals(dismissal_type);

-- ========================================================================
-- LEAVE OF ABSENCE TABLE (Bylaws Section X)
-- ========================================================================
CREATE TABLE IF NOT EXISTS leave_of_absence (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('FULL_SEMESTER', 'PARTIAL', 'MEDICAL', 'ADMINISTRATIVE')),
    start_semester_id INTEGER NOT NULL,
    end_semester_id INTEGER,
    reason TEXT,
    duration_semesters INTEGER,
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_document_path VARCHAR(255),
    approved_by INTEGER,
    approved_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (start_semester_id) REFERENCES semesters(id),
    FOREIGN KEY (end_semester_id) REFERENCES semesters(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_leave_of_absence_student ON leave_of_absence(student_id);
CREATE INDEX idx_leave_of_absence_status ON leave_of_absence(status);

-- ========================================================================
-- GPA/CGPA AUDIT TRAIL TABLE
-- ========================================================================
CREATE TABLE IF NOT EXISTS gpa_audit_trail (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER,
    gpa_before DECIMAL(3,3),
    gpa_after DECIMAL(3,3),
    cgpa_before DECIMAL(3,3),
    cgpa_after DECIMAL(3,3),
    calculation_method VARCHAR(100),
    audit_reason VARCHAR(255),
    calculated_by INTEGER,
    is_manual BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (calculated_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_gpa_audit_trail_student ON gpa_audit_trail(student_id);

-- ========================================================================
-- ELIGIBILITY EXCEPTIONS TABLE (Bylaws Section XII)
-- ========================================================================
CREATE TABLE IF NOT EXISTS eligibility_exceptions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(100) NOT NULL,
    exception_type VARCHAR(50) NOT NULL CHECK (exception_type IN (
        'TEMPORARY_WAIVER',
        'PERMANENT_EXCEPTION',
        'CONDITIONAL_APPROVAL',
        'MEDICAL_ACCOMMODATION',
        'HARDSHIP'
    )),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
    expiration_date DATE,
    reason TEXT,
    supporting_documents JSONB,
    granted_by INTEGER,
    granted_at TIMESTAMP,
    revoked_by INTEGER,
    revoked_at TIMESTAMP,
    revoked_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_eligibility_exceptions_student ON eligibility_exceptions(student_id);
CREATE INDEX idx_eligibility_exceptions_status ON eligibility_exceptions(status);

-- ========================================================================
-- COURSE REPETITION AND IMPROVEMENT TRACKING (Bylaws Section XI)
-- ========================================================================
CREATE TABLE IF NOT EXISTS course_repetition_tracking (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    first_attempt_grade DECIMAL(3,2),
    first_attempt_date DATE,
    current_grade DECIMAL(3,2),
    is_for_improvement BOOLEAN DEFAULT FALSE,
    is_first_attempt BOOLEAN DEFAULT TRUE,
    max_grade_earned DECIMAL(3,2),
    reason_for_repeat VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE INDEX idx_course_repetition_student ON course_repetition_tracking(student_id);
CREATE INDEX idx_course_repetition_course ON course_repetition_tracking(course_id);

-- ========================================================================
-- GRADUATION PROJECT SUBMISSIONS
-- ========================================================================
CREATE TABLE IF NOT EXISTS graduation_project_submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    project_number INTEGER CHECK (project_number IN (1, 2)),
    semester_id INTEGER NOT NULL,
    advisor_id INTEGER,
    title VARCHAR(255),
    description TEXT,
    submission_date TIMESTAMP,
    project_document_path VARCHAR(255),
    status VARCHAR(50) DEFAULT 'NotStarted' CHECK (status IN (
        'NotStarted', 'InProgress', 'Submitted', 'UnderReview', 'Approved', 'Rejected'
    )),
    coursework_score DECIMAL(5,2),
    defense_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade_letter VARCHAR(3),
    grade_points DECIMAL(3,2),
    defense_committee JSONB,
    defense_date TIMESTAMP,
    reviewer_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (advisor_id) REFERENCES instructors(id) ON DELETE SET NULL
);
CREATE INDEX idx_graduation_projects_student ON graduation_project_submissions(student_id);
CREATE INDEX idx_graduation_projects_semester ON graduation_project_submissions(semester_id);

-- ========================================================================
-- TRAINING/INTERNSHIP RECORDS (Bylaws Section XI, XIII)
-- ========================================================================
CREATE TABLE IF NOT EXISTS student_training (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    company_name VARCHAR(255),
    company_address VARCHAR(255),
    supervisor_name VARCHAR(100),
    supervisor_email VARCHAR(100),
    supervisor_phone VARCHAR(20),
    start_date DATE,
    end_date DATE,
    duration_weeks INTEGER,
    location VARCHAR(255),
    training_type VARCHAR(50),
    description TEXT,
    status VARCHAR(50) DEFAULT 'NotStarted' CHECK (status IN (
        'NotStarted', 'InProgress', 'Completed', 'Cancelled'
    )),
    report_path VARCHAR(255),
    supervisor_rating DECIMAL(3,2),
    supervisor_comments TEXT,
    submitted_date TIMESTAMP,
    approved_by INTEGER,
    approved_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_student_training_student ON student_training(student_id);
CREATE INDEX idx_student_training_semester ON student_training(semester_id);

-- ========================================================================
-- ACADEMIC STANDING HISTORY (for tracking changes)
-- ========================================================================
CREATE TABLE IF NOT EXISTS academic_standing_history (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER,
    gpa DECIMAL(3,3),
    cgpa DECIMAL(3,3),
    status VARCHAR(100),
    classification VARCHAR(50) CHECK (classification IN (
        'Poor', 'Weak', 'Satisfactory', 'Good', 'Very Good', 'Excellent'
    )),
    is_on_warning BOOLEAN,
    is_dismissed BOOLEAN,
    is_honors_eligible BOOLEAN,
    recorded_by INTEGER,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_academic_standing_history_student ON academic_standing_history(student_id);

-- ========================================================================
-- CURRICULUM MAPPING TABLE (For specialization course grouping)
-- ========================================================================
CREATE TABLE IF NOT EXISTS curriculum_mapping (
    id SERIAL PRIMARY KEY,
    specialization_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_mandatory BOOLEAN DEFAULT FALSE,
    level INTEGER,
    semester_recommended INTEGER,
    credits INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_curriculum_mapping_unique ON curriculum_mapping(specialization_id, course_id);

-- ========================================================================
-- ADMIN ACTIVITY LOGS
-- ========================================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action_type VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    before_value JSONB,
    after_value JSONB,
    status VARCHAR(50),
    description TEXT,
    ip_address INET,
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_admin_activity_logs_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_entity ON admin_activity_logs(entity_type, entity_id);
CREATE INDEX idx_admin_activity_logs_type ON admin_activity_logs(action_type);

-- ========================================================================
-- ACADEMIC CALENDAR AND IMPORTANT DATES
-- ========================================================================
CREATE TABLE IF NOT EXISTS academic_calendar (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    academic_year VARCHAR(9),
    event_type VARCHAR(100),
    event_name VARCHAR(255),
    event_date DATE,
    start_date DATE,
    end_date DATE,
    description TEXT,
    is_holiday BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_academic_calendar_faculty ON academic_calendar(faculty_id);

-- ========================================================================
-- HONORS AND RECOGNITION TRACKING (Bylaws Section XIII)
-- ========================================================================
CREATE TABLE IF NOT EXISTS honors_and_recognition (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    honor_type VARCHAR(100) NOT NULL CHECK (honor_type IN (
        'WITH_DISTINCTION',
        'DEANS_LIST',
        'HIGH_HONORS',
        'EXCELLENCE_AWARD',
        'SCHOLARSHIP'
    )),
    academic_year VARCHAR(9),
    semester VARCHAR(20),
    cgpa_at_award DECIMAL(3,3),
    awarded_date DATE,
    awarded_by INTEGER,
    certificate_path VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (awarded_by) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_honors_and_recognition_student ON honors_and_recognition(student_id);

-- ========================================================================
-- NOTIFICATIONS AND ALERTS
-- ========================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    related_entity_type VARCHAR(100),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    action_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);

-- ========================================================================
-- COURSE INSTRUCTOR ASSIGNMENTS (many-to-many)
-- ========================================================================
CREATE TABLE IF NOT EXISTS course_instructor_assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    instructor_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    section VARCHAR(10),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (instructor_id) REFERENCES instructors(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_course_instructor_assignments_unique 
    ON course_instructor_assignments(course_id, semester_id, section);

-- ========================================================================
-- STUDENT BOARD/DISCUSSION TRACKING (For different boards)
-- ========================================================================
CREATE TABLE IF NOT EXISTS student_boards (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    board_type VARCHAR(100) NOT NULL,
    board_name VARCHAR(255),
    board_name_ar VARCHAR(255),
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_student_boards_faculty ON student_boards(faculty_id);

CREATE TABLE IF NOT EXISTS board_posts (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    title VARCHAR(255),
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_announcement BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES student_boards(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_board_posts_board ON board_posts(board_id);
CREATE INDEX idx_board_posts_author ON board_posts(author_id);
