-- Student Registration System Database Schema
-- PostgreSQL Version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universities Table
CREATE TABLE universities (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculties Table
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    university_id INTEGER NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    dean_name VARCHAR(255),
    dean_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
);
CREATE INDEX idx_faculties_university ON faculties(university_id);

-- Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    chair_name VARCHAR(255),
    chair_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_departments_faculty ON departments(faculty_id);

-- Specializations Table
CREATE TABLE specializations (
    id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL,
    faculty_id INTEGER NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    total_credits INTEGER DEFAULT 132,
    min_cgpa DECIMAL(3,2) DEFAULT 2.0,
    min_study_years INTEGER DEFAULT 3,
    max_study_years INTEGER DEFAULT 4,
    specialization_start_credits INTEGER DEFAULT 66,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_specializations_department ON specializations(department_id);

-- Academic Rules Table
CREATE TABLE academic_rules (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50),
    rule_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE INDEX idx_academic_rules_faculty ON academic_rules(faculty_id);
CREATE INDEX idx_academic_rules_category ON academic_rules(category);

-- Registration Constraints Table
CREATE TABLE registration_constraints (
    id SERIAL PRIMARY KEY,
    specialization_id INTEGER NOT NULL,
    academic_level INTEGER,
    min_credits INTEGER,
    max_credits INTEGER,
    min_cgpa DECIMAL(3,2),
    max_cgpa DECIMAL(3,2),
    is_new_student BOOLEAN,
    exceptions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_registration_constraints_unique ON registration_constraints(specialization_id, academic_level, is_new_student);

-- Semesters Table
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    academic_year VARCHAR(9),
    semester_number INTEGER,
    semester_name VARCHAR(20),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_semesters_unique ON semesters(faculty_id, academic_year, semester_number);
CREATE INDEX idx_semesters_faculty ON semesters(faculty_id);

-- Semester Deadlines Table
CREATE TABLE semester_deadlines (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER NOT NULL,
    deadline_code VARCHAR(50),
    deadline_name VARCHAR(255),
    deadline_date DATE NOT NULL,
    deadline_week INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_semester_deadlines_unique ON semester_deadlines(semester_id, deadline_code);

-- Course Categories Table
CREATE TABLE course_categories (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description TEXT,
    percent_min DECIMAL(4,2),
    percent_max DECIMAL(4,2),
    is_mandatory BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER NOT NULL,
    specialization_id INTEGER,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    credit_hours INTEGER NOT NULL CHECK (credit_hours > 0),
    level INTEGER,
    category_id INTEGER,
    is_mandatory BOOLEAN DEFAULT TRUE,
    min_passing_grade DECIMAL(3,2) DEFAULT 1.0 CHECK (min_passing_grade >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id),
    FOREIGN KEY (category_id) REFERENCES course_categories(id)
);
CREATE INDEX idx_courses_faculty ON courses(faculty_id);
CREATE INDEX idx_courses_code ON courses(code);

-- Course Prerequisites Table
CREATE TABLE course_prerequisites (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    prerequisite_course_id INTEGER NOT NULL,
    min_grade DECIMAL(3,2),
    is_strict BOOLEAN DEFAULT TRUE,
    logic VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_course_prerequisites_unique ON course_prerequisites(course_id, prerequisite_course_id);

-- Grading Scales Table
CREATE TABLE grading_scales (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER,
    grade_letter VARCHAR(3),
    grade_ar VARCHAR(50),
    min_percentage DECIMAL(5,2),
    max_percentage DECIMAL(5,2),
    grade_points DECIMAL(3,2),
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX idx_grading_scales_unique ON grading_scales(faculty_id, grade_letter);
CREATE INDEX idx_grading_scales_faculty ON grading_scales(faculty_id);

-- Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE,
    faculty_id INTEGER NOT NULL,
    specialization_id INTEGER,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender CHAR(1),
    national_id VARCHAR(20),
    admission_date DATE,
    admission_type VARCHAR(50),
    current_level INTEGER,
    total_credits_passed INTEGER DEFAULT 0,
    cgpa DECIMAL(3,3) DEFAULT 0,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissal_date DATE,
    dismissal_reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (specialization_id) REFERENCES specializations(id)
);
CREATE INDEX idx_students_faculty ON students(faculty_id);
CREATE INDEX idx_students_student_id ON students(student_id);

-- Student Registrations Table
CREATE TABLE student_registrations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Registered',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    withdrawal_date TIMESTAMP,
    withdrawal_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE UNIQUE INDEX idx_student_registrations_unique ON student_registrations(student_id, semester_id, course_id);
CREATE INDEX idx_student_registrations_student ON student_registrations(student_id);
CREATE INDEX idx_student_registrations_semester ON student_registrations(semester_id);

-- Student Grades Table
CREATE TABLE student_grades (
    id SERIAL PRIMARY KEY,
    student_registration_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    coursework_score DECIMAL(5,2) CHECK (coursework_score IS NULL OR (coursework_score >= 0 AND coursework_score <= 100)),
    midterm_score DECIMAL(5,2) CHECK (midterm_score IS NULL OR (midterm_score >= 0 AND midterm_score <= 100)),
    final_exam_score DECIMAL(5,2) CHECK (final_exam_score IS NULL OR (final_exam_score >= 0 AND final_exam_score <= 100)),
    total_score DECIMAL(5,2) CHECK (total_score IS NULL OR (total_score >= 0 AND total_score <= 100)),
    grade_letter VARCHAR(3),
    grade_points DECIMAL(3,2) CHECK (grade_points IS NULL OR (grade_points >= 0 AND grade_points <= 4.0)),
    is_first_attempt BOOLEAN DEFAULT TRUE,
    is_improvement_attempt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_registration_id) REFERENCES student_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE INDEX idx_student_grades_student ON student_grades(student_id);
CREATE INDEX idx_student_grades_course ON student_grades(course_id);

-- Student Academic Standing Table
CREATE TABLE student_academic_standing (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL UNIQUE,
    semester_id INTEGER,
    gpa DECIMAL(3,3),
    cgpa DECIMAL(3,3),
    is_on_warning BOOLEAN DEFAULT FALSE,
    consecutive_warning_count INTEGER DEFAULT 0,
    total_warning_count INTEGER DEFAULT 0,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissal_reason VARCHAR(255),
    is_on_probation BOOLEAN DEFAULT FALSE,
    probation_start_date DATE,
    probation_end_date DATE,
    is_honors_eligible BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE INDEX idx_student_academic_standing_student ON student_academic_standing(student_id);

-- Student Withdrawals Table
CREATE TABLE student_withdrawals (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    withdrawal_type VARCHAR(20),
    reason VARCHAR(255),
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_document_path VARCHAR(255),
    approved_by INTEGER,
    approved_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE INDEX idx_student_withdrawals_student ON student_withdrawals(student_id);

-- Student Progress Tracking Table
CREATE TABLE student_progress_tracking (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    total_courses_registered INTEGER,
    total_credits_registered INTEGER,
    courses_passed INTEGER,
    credits_passed INTEGER,
    total_credits_accumulated INTEGER,
    cgpa DECIMAL(3,3),
    is_on_track BOOLEAN,
    projections JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- Attendance Records Table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    total_sessions INTEGER,
    attended_sessions INTEGER,
    attendance_percentage DECIMAL(5,2) CHECK (attendance_percentage IS NULL OR (attendance_percentage >= 0 AND attendance_percentage <= 100)),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
CREATE UNIQUE INDEX idx_attendance_records_unique ON attendance_records(student_id, course_id, semester_id);

-- Graduation Eligibility Table
CREATE TABLE graduation_eligibility (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL UNIQUE,
    total_credits_passed INTEGER,
    total_credits_required INTEGER,
    credits_remaining INTEGER,
    cgpa DECIMAL(3,3),
    min_cgpa_required DECIMAL(3,2),
    is_eligible BOOLEAN DEFAULT FALSE,
    is_honors_eligible BOOLEAN DEFAULT FALSE,
    project_status VARCHAR(50),
    training_status VARCHAR(50),
    missing_requirements JSONB,
    estimated_graduation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Course Schedules Table
CREATE TABLE course_schedules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    section VARCHAR(10),
    day_of_week INTEGER,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    instructor_id INTEGER,
    capacity INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
    ,CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);
CREATE UNIQUE INDEX idx_course_schedules_unique ON course_schedules(course_id, semester_id, section);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER,
    faculty_id INTEGER,
    notification_type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

-- Course Repeat Tracking Table
CREATE TABLE course_repeat_tracking (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    first_attempt_grade DECIMAL(3,2),
    first_attempt_date DATE,
    repeat_count INTEGER DEFAULT 0,
    best_grade DECIMAL(3,2),
    best_grade_date DATE,
    is_for_improvement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);
CREATE UNIQUE INDEX idx_course_repeat_tracking_unique ON course_repeat_tracking(student_id, course_id);

-- Graduation Projects Table
CREATE TABLE graduation_projects (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    project_number INTEGER,
    project_title VARCHAR(255),
    project_description TEXT,
    start_date DATE,
    end_date DATE,
    advisor_id INTEGER,
    grade DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'NotStarted',
    submitted_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
