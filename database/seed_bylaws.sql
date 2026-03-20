-- ========================================================================
-- COMPREHENSIVE SEED DATA - BYLAWS IMPLEMENTATION
-- Faculty of Computers and Informatics - Tanta University 2024
-- ========================================================================

-- ========================================================================
-- UNIVERSITY AND FACULTY DATA
-- ========================================================================
INSERT INTO universities (code, name_en, name_ar, country, city, email, phone, website, is_active)
VALUES (
    'TU',
    'Tanta University',
    'جامعة طنطا',
    'Egypt',
    'Tanta',
    'info@tanta.edu.eg',
    '+2-040-3347920',
    'www.tanta.edu.eg',
    TRUE
) ON CONFLICT DO NOTHING;

INSERT INTO faculties (university_id, code, name_en, name_ar, description, dean_name, dean_email, is_active)
VALUES (
    (SELECT id FROM universities WHERE code = 'TU'),
    'CIS',
    'Faculty of Computers and Informatics',
    'كلية الحاسبات والمعلومات',
    'Faculty offering Bachelor degrees in Computer Science, Information Systems, Information Technology, and Software Engineering',
    'Prof. Dr. Faculty Dean',
    'dean@cis.tanta.edu.eg',
    TRUE
) ON CONFLICT DO NOTHING;

-- ========================================================================
-- DEPARTMENTS
-- ========================================================================
INSERT INTO departments (faculty_id, code, name_en, name_ar, chair_name, chair_email, is_active)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'CS',
    'Computer Science Department',
    'قسم علوم الحاسبات',
    'Department Chair',
    'cs-chair@cis.tanta.edu.eg',
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'IS',
    'Information Systems Department',
    'قسم نظم المعلومات',
    'Department Chair',
    'is-chair@cis.tanta.edu.eg',
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'IT',
    'Information Technology Department',
    'قسم تكنولوجيا المعلومات',
    'Department Chair',
    'it-chair@cis.tanta.edu.eg',
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'SE',
    'Software Engineering Department',
    'قسم هندسة البرمجيات',
    'Department Chair',
    'se-chair@cis.tanta.edu.eg',
    TRUE
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- SPECIALIZATIONS (Article 3 - Bylaws)
-- ========================================================================
INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
VALUES
(
    (SELECT id FROM departments WHERE code = 'CS'),
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'CSPEC',
    'Computer Science',
    'علوم الحاسبات',
    'Focus on theoretical and practical computer science concepts',
    132,
    2.0,
    3,
    4,
    30,
    TRUE
),
(
    (SELECT id FROM departments WHERE code = 'IS'),
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'ISSPEC',
    'Information Systems',
    'نظم المعلومات',
    'Focus on information systems and data management',
    132,
    2.0,
    3,
    4,
    30,
    TRUE
),
(
    (SELECT id FROM departments WHERE code = 'IT'),
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'ITSPEC',
    'Information Technology',
    'تكنولوجيا المعلومات',
    'Focus on IT infrastructure and networking',
    132,
    2.0,
    3,
    4,
    30,
    TRUE
),
(
    (SELECT id FROM departments WHERE code = 'SE'),
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'SESPEC',
    'Software Engineering',
    'هندسة البرمجيات',
    'Focus on software development and engineering practices',
    132,
    2.0,
    3,
    4,
    30,
    TRUE
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- GRADING SCALES (Article 18-19, Article 20 - Bylaws)
-- ========================================================================
INSERT INTO grading_scales (faculty_id, grade_letter, grade_ar, min_percentage, max_percentage, grade_points, description)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'A+',
    'ممتاز جداً',
    96.0,
    100.0,
    4.0,
    'Excellent'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'A',
    'ممتاز',
    92.0,
    95.99,
    3.7,
    'Very Good'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'A-',
    'جيد جداً',
    88.0,
    91.99,
    3.4,
    'Good'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'B+',
    'جيد +',
    84.0,
    87.99,
    3.2,
    'Good Plus'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'B',
    'جيد',
    80.0,
    83.99,
    3.0,
    'Satisfactory'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'B-',
    'جيد -',
    76.0,
    79.99,
    2.8,
    'Satisfactory Minus'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'C+',
    'مقبول +',
    72.0,
    75.99,
    2.6,
    'Acceptable Plus'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'C',
    'مقبول',
    68.0,
    71.99,
    2.4,
    'Acceptable'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'C-',
    'مقبول -',
    64.0,
    67.99,
    2.2,
    'Acceptable Minus'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'D+',
    'ضعيف +',
    60.0,
    63.99,
    2.0,
    'Minimum Pass Plus'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'D',
    'ضعيف',
    55.0,
    59.99,
    1.5,
    'Minimum Pass'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'D-',
    'ضعيف جداً',
    50.0,
    54.99,
    1.0,
    'Just Passing'
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'F',
    'راسب',
    0.0,
    49.99,
    0.0,
    'Fail'
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- ACADEMIC SEMESTERS for current academic year
-- ========================================================================
INSERT INTO semesters (faculty_id, academic_year, semester_number, semester_name, start_date, end_date, is_active)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    '2024-2025',
    1,
    'Fall',
    '2024-09-01',
    '2025-01-30',
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    '2024-2025',
    2,
    'Spring',
    '2025-02-01',
    '2025-06-30',
    FALSE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    '2024-2025',
    3,
    'Summer',
    '2025-07-01',
    '2025-08-15',
    FALSE
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- SEMESTER DEADLINES (Article 12, 13, 14, 15 - Bylaws)
-- ========================================================================
INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT 
    s.id,
    'ADD_DROP',
    'Add/Drop Deadline',
    s.start_date + INTERVAL '14 days',
    2,
    'Last day to add or drop courses without penalty (Article 12)'
FROM semesters s
WHERE s.semester_name IN ('Fall', 'Spring') AND s.academic_year = '2024-2025'
ON CONFLICT DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT 
    s.id,
    'WITHDRAWAL',
    'Course Withdrawal Deadline',
    s.start_date + INTERVAL '49 days',
    7,
    'Last day to withdraw from courses with W grade (Article 13)'
FROM semesters s
WHERE s.semester_name IN ('Fall', 'Spring') AND s.academic_year = '2024-2025'
ON CONFLICT DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT 
    s.id,
    'MIDTERM_EXAM',
    'Midterm Exam Period',
    s.start_date + INTERVAL '63 days',
    9,
    'Midterm examination period'
FROM semesters s
WHERE s.semester_name IN ('Fall', 'Spring') AND s.academic_year = '2024-2025'
ON CONFLICT DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT 
    s.id,
    'ATTENDANCE_THRESHOLD',
    'Minimum Attendance Requirement',
    s.start_date + INTERVAL '98 days',
    14,
    'Students must achieve 42% attendance to enter final exam (Article 14)'
FROM semesters s
WHERE s.semester_name IN ('Fall', 'Spring') AND s.academic_year = '2024-2025'
ON CONFLICT DO NOTHING;

-- ========================================================================
-- REGISTRATION CONSTRAINTS (Article 11 - Bylaws)
-- ========================================================================
INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa, max_cgpa, is_new_student)
SELECT
    sp.id,
    1,
    2,
    27,
    0.0,
    4.0,
    TRUE
FROM specializations sp WHERE sp.code IN ('CSPEC', 'ISSPEC', 'ITSPEC', 'SESPEC')
ON CONFLICT DO NOTHING;

INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa, max_cgpa, is_new_student)
SELECT
    sp.id,
    2,
    2,
    30,
    0.0,
    4.0,
    FALSE
FROM specializations sp WHERE sp.code IN ('CSPEC', 'ISSPEC', 'ITSPEC', 'SESPEC')
ON CONFLICT DO NOTHING;

INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa, max_cgpa, is_new_student)
SELECT
    sp.id,
    3,
    2,
    22,
    0.0,
    4.0,
    FALSE
FROM specializations sp WHERE sp.code IN ('CSPEC', 'ISSPEC', 'ITSPEC', 'SESPEC')
ON CONFLICT DO NOTHING;

INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa, max_cgpa, is_new_student)
SELECT
    sp.id,
    4,
    2,
    30,
    0.0,
    4.0,
    FALSE
FROM specializations sp WHERE sp.code IN ('CSPEC', 'ISSPEC', 'ITSPEC', 'SESPEC')
ON CONFLICT DO NOTHING;

-- ========================================================================
-- COURSE CATEGORIES (Article 9 - Bylaws)
-- ========================================================================
INSERT INTO course_categories (faculty_id, code, name_en, name_ar, percent_min, percent_max, is_mandatory)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'UNIV_REQ',
    'University Requirements',
    'المتطلبات الجامعية',
    8.0,
    10.0,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'MATH_SCI',
    'Mathematics and Basic Sciences',
    'الرياضيات والعلوم الأساسية',
    16.0,
    18.0,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'BASIC_CS',
    'Basic Computing Sciences',
    'أساسيات علوم الحاسبات',
    26.0,
    28.0,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'APPL_CS',
    'Applied Computing Sciences/Specialization',
    'تطبيقات علوم الحاسبات',
    28.0,
    30.0,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'PROJECTS',
    'Graduation Projects',
    'مشاريع التخرج',
    3.0,
    5.0,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'TRAINING',
    'Training/Internship',
    'التدريب والتطبيق العملي',
    3.0,
    5.0,
    TRUE
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- STUDENT BOARDS (Different boards for student interaction)
-- ========================================================================
INSERT INTO student_boards (faculty_id, board_type, board_name, board_name_ar, description, icon, sort_order, is_active)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'announcements',
    'Announcements',
    'الإعلانات',
    'Official announcements from faculty administration',
    '📢',
    1,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'academic_news',
    'Academic News',
    'أخبار أكاديمية',
    'Academic updates and important deadlines',
    '📚',
    2,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'course_discussions',
    'Course Discussions',
    'نقاشات المقررات',
    'General course-related discussions and Q&A',
    '💬',
    3,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'student_life',
    'Student Life',
    'حياة الطالب',
    'Non-academic student life and events',
    '🎓',
    4,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'career',
    'Career & Internships',
    'الوظائف والتدريب',
    'Career opportunities and internship postings',
    '💼',
    5,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'academic_standing',
    'Academic Standing',
    'الوضع الأكاديمي',
    'Information about academic warnings and probation',
    '⚠️',
    6,
    TRUE
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'graduation',
    'Graduation Info',
    'معلومات التخرج',
    'Graduation requirements and project information',
    '🎉',
    7,
    TRUE
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- ACADEMIC RULES (Implementing Bylaws)
-- ========================================================================
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from, effective_to)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'MIN_GPA_2.0',
    'Academic Standing',
    'Minimum Cumulative GPA',
    'Students must maintain minimum CGPA of 2.0 to remain in good standing (Article 20)',
    'GPA_THRESHOLD',
    '{"min_cgpa": 2.0, "status": "Required for graduation"}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'ATTENDANCE_42',
    'Attendance',
    'Minimum Attendance Requirement',
    'Students must achieve 42% attendance to enter final exam (Article 14)',
    'ATTENDANCE',
    '{"min_attendance": 42.0, "unit": "percent"}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'PASSING_40_30',
    'Grading',
    'Passing Grade Requirements',
    'Minimum passing grade is 40% of total course and 30% of final exam (Article 16)',
    'PASSING_GRADE',
    '{"min_course_percent": 40, "min_exam_percent": 30}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'STUDY_DURATION',
    'Time Limits',
    'Maximum Study Duration',
    'Student must complete degree within 4 academic years (8 regular semesters) (Article 26)',
    'STUDY_DURATION',
    '{"max_years": 4, "max_semesters": 8}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'WARNING_CONSECUTIVE',
    'Academic Warning',
    'Consecutive Academic Warning',
    'Student dismissed if on academic warning for 4 consecutive regular semesters (Article 25)',
    'DISMISSAL',
    '{"max_consecutive_warnings": 4}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'WARNING_TOTAL',
    'Academic Warning',
    'Total Academic Warning Count',
    'Student dismissed if on academic warning for 6 non-consecutive semesters (Article 25)',
    'DISMISSAL',
    '{"max_total_warnings": 6}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'LEAVE_CONSECUTIVE',
    'Leave of Absence',
    'Maximum Consecutive Leave',
    'Student may take leave for maximum 4 consecutive regular semesters (Article 15)',
    'LEAVE_RULES',
    '{"max_consecutive": 4, "max_total": 6}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'HONORS_3.0',
    'Honors',
    'Honors Degree Eligibility',
    'Honors degree requires CGPA ≥ 3.0 and completion within 4 years (Article 27)',
    'HONORS',
    '{"min_cgpa_honors": 3.0, "min_grade": "Very Good"}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'COURSE_REPEAT_3',
    'Course Repetition',
    'Maximum Improvement Retakes',
    'Student may retake maximum 3 passed courses to improve GPA (Article 23)',
    'COURSE_REPETITION',
    '{"max_improvement_retakes": 3, "max_grade": 2.3}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'PROJECT_85',
    'Graduation Projects',
    'Project Prerequisite',
    'Only students with 85+ credit hours may register for Graduation Project 1 (Article 21)',
    'PROJECT_REQUIREMENT',
    '{"min_credits_for_project": 85}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
),
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'DISMISSAL_COMBINED',
    'Dismissal',
    'Combined Dismissal Conditions',
    'Student dismissed if exceeding 4 years study or meeting warning conditions (Article 26)',
    'DISMISSAL',
    '{"max_years": 4, "max_semesters": 8}'::JSONB,
    TRUE,
    '2024-01-01',
    NULL
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- COURSE CATEGORIES DATA (General Requirement Courses)
-- ========================================================================
INSERT INTO course_categories (faculty_id, code, name_en, name_ar, percent_min, percent_max, is_mandatory)
VALUES
(
    (SELECT id FROM faculties WHERE code = 'CIS'),
    'GENERAL_EL',
    'General Electives',
    'اختيارات عامة',
    4.0,
    16.0,
    FALSE
)
ON CONFLICT DO NOTHING;

-- Comprehensive seed data is ready. Additional course data and instructor assignments
-- will be populated through the application's course management system.
-- This ensures flexibility for semester-specific course offerings and assignments.

COMMIT;
