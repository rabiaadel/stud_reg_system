-- ============================================================================
-- Complete Tanta University Course Catalog & Academic Rules Seed
-- Faculty of Computers and Informatics - All 4 Specializations
-- Based on: db-extracted/bylaws_complete.json & specialization_courses_complete.json
-- ============================================================================

BEGIN;

-- ============================================================================
-- GRADING SCALES (Faculty Standard)
-- ============================================================================
INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'A+', 95.0, 100.0, 4.0, 'Excellent'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'A', 90.0, 94.99, 4.0, 'Excellent'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'A-', 85.0, 89.99, 3.7, 'Very Good'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'B+', 80.0, 84.99, 3.3, 'Good'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'B', 75.0, 79.99, 3.0, 'Good'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'B-', 70.0, 74.99, 2.7, 'Satisfactory'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'C+', 65.0, 69.99, 2.3, 'Satisfactory'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'C', 60.0, 64.99, 2.0, 'Pass'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'D+', 55.0, 59.99, 1.3, 'Pass'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'D', 50.0, 54.99, 1.0, 'Pass'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

INSERT INTO grading_scales (faculty_id, grade_letter, min_percentage, max_percentage, grade_points, description)
SELECT f.id, 'F', 0.0, 49.99, 0.0, 'Fail'
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (faculty_id, grade_letter) DO NOTHING;

-- ============================================================================
-- GENERAL & BASIC COURSES (Common across all specializations)
-- ============================================================================

-- General University Requirements (UNV)
INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'UNV111', 'Technical Report Writing', 'كتابة التقارير التقنية', 1, 1, true, 
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'GENERAL_UNIVERSITY_REQUIREMENTS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'UNV112', 'Societal Issues', 'القضايا المجتمعية', 1, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'GENERAL_UNIVERSITY_REQUIREMENTS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'UNV113', 'English Language (1)', 'اللغة الإنجليزية (1)', 1, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'GENERAL_UNIVERSITY_REQUIREMENTS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'UNV114', 'Communication Skills', 'مهارات التواصل', 1, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'GENERAL_UNIVERSITY_REQUIREMENTS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

-- Basic Sciences and Mathematics
INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS111', 'Math (1)', 'الرياضيات (1)', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS112', 'Discrete Mathematics', 'الرياضيات المنفصلة', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS113', 'Math (2)', 'الرياضيات (2)', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS114', 'Math (3)', 'الرياضيات (3)', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS115', 'Electronics', 'الإلكترونيات', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS116', 'Probability and Statistics (1)', 'الاحتمالات والإحصاء (1)', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'BS117', 'Operations Research', 'بحوث العمليات', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_SCIENCES_AND_MATHEMATICS' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

-- Basic Computing Sciences
INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS111', 'Fundamentals of Computer Science', 'أساسيات علوم الحاسب', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS112', 'Structured Programming', 'البرمجة المنظمة', 3, 1, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS211', 'Object Oriented Programming', 'البرمجة كائنية التوجه', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS213', 'Data Structures', 'هياكل البيانات', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS214', 'Database Systems (1)', 'أنظمة قواعد البيانات (1)', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS215', 'Software Engineering (1)', 'هندسة البرمجيات (1)', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, code, name_en, name_ar, credit_hours, level, is_mandatory, category_id, is_active)
SELECT f.id, 'CS216', 'Web Development Fundamentals', 'أساسيات تطوير الويب', 3, 2, true,
  (SELECT id FROM course_categories WHERE faculty_id = f.id AND code = 'BASIC_COMPUTING' LIMIT 1), true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- PREREQUISITES FOR CORE COURSES
-- ============================================================================

-- Math (2) requires Math (1)
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'BS113' AND p.code = 'BS111' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Math (3) requires Math (2)
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'BS114' AND p.code = 'BS113' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Probability and Statistics requires Math (1)
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, false
FROM courses c, courses p
WHERE c.code = 'BS116' AND p.code = 'BS111' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Operations Research requires Math (1)
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, false
FROM courses c, courses p
WHERE c.code = 'BS117' AND p.code = 'BS111' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- OOP requires Structured Programming
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'CS211' AND p.code = 'CS112' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Data Structures requires Structured Programming
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'CS213' AND p.code = 'CS112' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Database Systems requires Data Structures
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'CS214' AND p.code = 'CS213' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Software Engineering requires OOP
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'CS215' AND p.code = 'CS211' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- Web Development requires Structured Programming
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, min_grade, is_strict)
SELECT c.id, p.id, 1.0, true
FROM courses c, courses p
WHERE c.code = 'CS216' AND p.code = 'CS112' AND c.faculty_id = p.faculty_id
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

-- ============================================================================
-- ACADEMIC RULES (Article 1-20 from Faculty Bylaws)
-- ============================================================================

-- Rule 1: General Admission Requirements
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_001_ADMISSION', 'Admission', 'Admission Requirements',
  'Must have General Secondary Certificate in Science. Faculty Council may accept 1-2 exceptional students per registration period.',
  'CONSTRAINT', jsonb_build_object(
    'min_secondary_score', 0,
    'exceptional_limit_per_period', 2,
    'source', 'Article 1'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 2: 132 Credit Hours Requirement
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_004_CREDITS', 'Degree Requirements', 'Total Credits Requirement',
  'Students must complete 132 credit hours with GPA >= 2.0 to receive Bachelor degree.',
  'CONSTRAINT', jsonb_build_object(
    'total_credits_required', 132,
    'min_cgpa', 2.0,
    'source', 'Article 4: Credit Hour System'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 3: Maximum Study Duration
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_004_MAX_STUDY', 'Academic Calendar', 'Maximum Study Duration',
  'Students have maximum 4 years (8 regular semesters) to complete degree.',
  'CONSTRAINT', jsonb_build_object(
    'max_years', 4,
    'max_semesters', 8,
    'penalty', 'Dismissal from faculty',
    'source', 'Article 4'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 4: Specialization Start Requirement
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_020_SPECIALIZATION', 'Specialization', 'Specialization Start Requirements',
  'Students must complete 30+ credit hours before beginning specialization courses.',
  'CONSTRAINT', jsonb_build_object(
    'min_credits_before_specialization', 30,
    'source', 'Article 20'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 5: Four Specializations Available
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_003_SPECIALIZATIONS', 'Program Structure', 'Available Specializations',
  'Faculty awards Bachelor degree in 4 specializations: Computer Science, Information Systems, Information Technology, Software Engineering.',
  'INFORMATIONAL', jsonb_build_object(
    'specializations', jsonb_build_array(
      'Computer Science',
      'Information Systems',
      'Information Technology',
      'Software Engineering'
    ),
    'source', 'Article 3'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 6: Semester Structure
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_004_SEMESTER_STRUCTURE', 'Academic Calendar', 'Semester Structure',
  'Academic year has 2 mandatory semesters (Fall/Spring) and 1 optional Summer semester.',
  'INFORMATIONAL', jsonb_build_object(
    'mandatory_semesters', 2,
    'optional_semesters', 1,
    'semester_names', jsonb_build_array('Fall', 'Spring', 'Summer'),
    'source', 'Article 4'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 7: Credit Hour Definition
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_004_CREDIT_DEF', 'Credit System', 'Credit Hour Definition',
  'Lecture hour = 1 credit. Tutorial hour (2 hours) = 1 credit. Lab hour (3 hours) = 1 credit.',
  'INFORMATIONAL', jsonb_build_object(
    'lecture_hours_per_credit', 1,
    'tutorial_hours_per_credit', 2,
    'lab_hours_per_credit', 3,
    'source', 'Article 4'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 8: General Requirements
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_020_GENERAL_REQ', 'Course Distribution', 'General University Requirements',
  'Students must complete 12 credit hours of general requirements including 5 mandatory general courses.',
  'CONSTRAINT', jsonb_build_object(
    'total_credits', 12,
    'mandatory_credits', 5,
    'source', 'Article 20'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 9: Basic Sciences & Mathematics
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_020_BASIC_SCIENCE', 'Course Distribution', 'Basic Sciences and Mathematics',
  'Students must complete mathematics and basic sciences foundation courses (approx 70 credit hours equivalent).',
  'CONSTRAINT', jsonb_build_object(
    'total_credits', 70,
    'source', 'Article 20: Basic Sciences & Mathematics section'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 10: Graduation Projects
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_020_PROJECTS', 'Capstone', 'Graduation Project Requirements',
  'Students must complete 6 credit hours of graduation projects (PR411 and PR412). PR411 required after 85 credits, PR412 after PR411.',
  'CONSTRAINT', jsonb_build_object(
    'total_credits', 6,
    'courses', jsonb_build_array('PR411', 'PR412'),
    'pr411_min_credits', 85,
    'duration_weeks_per_project', 7,
    'source', 'Article 20'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 11: Academic Standing & Dismissal
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_STANDING', 'Academic Probation', 'Academic Standing Rules',
  'Student with GPA < 2.0 is placed on probation. Cumulative failures result in dismissal.',
  'CONSTRAINT', jsonb_build_object(
    'dismissal_cgpa_threshold', 2.0,
    'probation_cgpa_threshold', 2.0,
    'source', 'Faculty Standard Policy'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 12: Language of Instruction
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_005_LANGUAGE', 'Program Structure', 'Language of Instruction',
  'Primary language is English. Arabic permitted with university approval for specific courses.',
  'INFORMATIONAL', jsonb_build_object(
    'primary_language', 'English',
    'alternative_language', 'Arabic (with approval)',
    'source', 'Article 5'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- Rule 13: Academic Advisors
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data)
SELECT f.id, 'ART_006_ADVISORS', 'Student Support', 'Academic Advising',
  'Each group of students has assigned academic advisor. Advisor role is consultative; student is responsible for approved courses.',
  'INFORMATIONAL', jsonb_build_object(
    'advisor_role', 'Consultative',
    'student_responsibility', 'Ensure course selection complies with bylaws',
    'source', 'Article 6'
  )
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT (rule_code) DO NOTHING;

-- ============================================================================
-- REGISTRATION CONSTRAINTS BY ACADEMIC LEVEL
-- ============================================================================

-- Level 1 - First Year Constraints
INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa)
SELECT sp.id, 1, 12, 18, 0.0
FROM specializations sp WHERE sp.code IN ('CS-SP', 'IS-SP', 'IT-SP', 'SE-SP')
ON CONFLICT (specialization_id, academic_level, is_new_student) DO NOTHING;

-- Level 2 - Second Year Constraints
INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa)
SELECT sp.id, 2, 12, 20, 1.5
FROM specializations sp WHERE sp.code IN ('CS-SP', 'IS-SP', 'IT-SP', 'SE-SP')
ON CONFLICT (specialization_id, academic_level, is_new_student) DO NOTHING;

-- Level 3 - Third Year Constraints
INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa)
SELECT sp.id, 3, 12, 20, 2.0
FROM specializations sp WHERE sp.code IN ('CS-SP', 'IS-SP', 'IT-SP', 'SE-SP')
ON CONFLICT (specialization_id, academic_level, is_new_student) DO NOTHING;

-- Level 4 - Fourth Year Constraints
INSERT INTO registration_constraints (specialization_id, academic_level, min_credits, max_credits, min_cgpa)
SELECT sp.id, 4, 6, 18, 2.0
FROM specializations sp WHERE sp.code IN ('CS-SP', 'IS-SP', 'IT-SP', 'SE-SP')
ON CONFLICT (specialization_id, academic_level, is_new_student) DO NOTHING;

-- ============================================================================
-- CURRENT SEMESTERS (for registration)
-- ============================================================================

INSERT INTO semesters (faculty_id, academic_year, semester_number, semester_name, start_date, end_date, is_active)
SELECT f.id, '2025/2026', 1, 'Fall 2025', '2025-09-15'::date, '2025-12-20'::date, true
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT DO NOTHING;

INSERT INTO semesters (faculty_id, academic_year, semester_number, semester_name, start_date, end_date, is_active)
SELECT f.id, '2025/2026', 2, 'Spring 2026', '2026-02-01'::date, '2026-05-15'::date, false
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT DO NOTHING;

INSERT INTO semesters (faculty_id, academic_year, semester_number, semester_name, start_date, end_date, is_active)
SELECT f.id, '2025/2026', 3, 'Summer 2026', '2026-06-01'::date, '2026-07-15'::date, false
FROM faculties f WHERE f.code = 'FCO'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEMESTER DEADLINES
-- ============================================================================

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT s.id, 'REGISTRATION_START', 'Registration Opens', s.start_date + interval '0 days', 0, 'Course registration begins'
FROM semesters s WHERE s.semester_name = 'Fall 2025'
ON CONFLICT (semester_id, deadline_code) DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT s.id, 'REGISTRATION_END', 'Registration Deadline', s.start_date + interval '14 days', 2, 'Last day to register for courses'
FROM semesters s WHERE s.semester_name = 'Fall 2025'
ON CONFLICT (semester_id, deadline_code) DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT s.id, 'ADD_DROP_END', 'Add/Drop Deadline', s.start_date + interval '21 days', 3, 'Last day to add/drop courses'
FROM semesters s WHERE s.semester_name = 'Fall 2025'
ON CONFLICT (semester_id, deadline_code) DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT s.id, 'WITHDRAWAL_START', 'Withdrawal Period Starts', s.start_date + interval '28 days', 4, 'Can withdraw with W grade'
FROM semesters s WHERE s.semester_name = 'Fall 2025'
ON CONFLICT (semester_id, deadline_code) DO NOTHING;

INSERT INTO semester_deadlines (semester_id, deadline_code, deadline_name, deadline_date, deadline_week, description)
SELECT s.id, 'WITHDRAWAL_END', 'Withdrawal Deadline', s.start_date + interval '70 days', 10, 'Last day to withdraw'
FROM semesters s WHERE s.semester_name = 'Fall 2025'
ON CONFLICT (semester_id, deadline_code) DO NOTHING;

COMMIT;
