-- ============================================================================
-- Student Registration System - Initial Database Seed
-- Django Users and Test Accounts
-- ============================================================================

-- Disable triggers temporarily for bulk insert
SET session_replication_role = replica;

-- ============================================================================
-- 1. UNIVERSITIES
-- ============================================================================
INSERT INTO universities (code, name_en, name_ar, country, city, email, phone, website, is_active)
VALUES 
('TU', 'Tanta University', 'جامعة طنطا', 'Egypt', 'Tanta', 'info@tanta.edu.eg', '+201000000000', 'https://www.tanta.edu.eg', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. FACULTIES
-- ============================================================================
INSERT INTO faculties (university_id, code, name_en, name_ar, description, dean_name, dean_email, is_active)
SELECT 
    (SELECT id FROM universities WHERE code = 'TU'),
    'FCO',
    'Faculty of Computers and Informatics',
    'كلية الحاسبات والمعلومات',
    'Faculty providing education in computer science, information systems, and information technology',
    'Dr. Mohamed Ahmed',
    'dean.fco@tanta.edu.eg',
    true
WHERE NOT EXISTS (SELECT 1 FROM faculties WHERE code = 'FCO')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. DEPARTMENTS
-- ============================================================================
INSERT INTO departments (faculty_id, code, name_en, name_ar, chair_name, chair_email, is_active)
SELECT 
    f.id, 'CS', 'Computer Science', 'علوم الحاسب', 'Dr. Ahmed Hassan', 'chair.cs@tanta.edu.eg', true
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM departments WHERE code = 'CS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, chair_name, chair_email, is_active)
SELECT 
    f.id, 'IS', 'Information Systems', 'نظم المعلومات', 'Dr. Fatima Ali', 'chair.is@tanta.edu.eg', true
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM departments WHERE code = 'IS')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, chair_name, chair_email, is_active)
SELECT 
    f.id, 'IT', 'Information Technology', 'تكنولوجيا المعلومات', 'Dr. Khaled Ibrahim', 'chair.it@tanta.edu.eg', true
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM departments WHERE code = 'IT')
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, chair_name, chair_email, is_active)
SELECT 
    f.id, 'SE', 'Software Engineering', 'هندسة البرمجيات', 'Dr. Hana Mostafa', 'chair.se@tanta.edu.eg', true
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM departments WHERE code = 'SE')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 4. SPECIALIZATIONS
-- ============================================================================
INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, is_active)
SELECT 
    d.id,
    d.faculty_id,
    'CS-SP',
    'Computer Science',
    'تخصص علوم الحاسب',
    'Program focusing on core computer science concepts',
    132,
    2.0,
    3,
    4,
    true
FROM departments d WHERE d.code = 'CS' AND NOT EXISTS (SELECT 1 FROM specializations WHERE code = 'CS-SP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, is_active)
SELECT 
    d.id,
    d.faculty_id,
    'IS-SP',
    'Information Systems',
    'تخصص نظم المعلومات',
    'Program focusing on business and information systems',
    132,
    2.0,
    3,
    4,
    true
FROM departments d WHERE d.code = 'IS' AND NOT EXISTS (SELECT 1 FROM specializations WHERE code = 'IS-SP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, is_active)
SELECT 
    d.id,
    d.faculty_id,
    'IT-SP',
    'Information Technology',
    'تخصص تكنولوجيا المعلومات',
    'Program focusing on IT infrastructure and networks',
    132,
    2.0,
    3,
    4,
    true
FROM departments d WHERE d.code = 'IT' AND NOT EXISTS (SELECT 1 FROM specializations WHERE code = 'IT-SP')
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, is_active)
SELECT 
    d.id,
    d.faculty_id,
    'SE-SP',
    'Software Engineering',
    'تخصص هندسة البرمجيات',
    'Program focusing on software development and engineering',
    132,
    2.0,
    3,
    4,
    true
FROM departments d WHERE d.code = 'SE' AND NOT EXISTS (SELECT 1 FROM specializations WHERE code = 'SE-SP')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 5. SEMESTERS
-- ============================================================================
INSERT INTO semesters (faculty_id, code, name_en, name_ar, academic_year, start_date, end_date, is_active, is_current)
SELECT 
    f.id,
    'FALL2024',
    'Fall 2024',
    'خريف 2024',
    2024,
    '2024-09-01'::DATE,
    '2024-12-31'::DATE,
    true,
    false
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM semesters WHERE code = 'FALL2024')
ON CONFLICT (code) DO NOTHING;

INSERT INTO semesters (faculty_id, code, name_en, name_ar, academic_year, start_date, end_date, is_active, is_current)
SELECT 
    f.id,
    'SPRING2025',
    'Spring 2025',
    'ربيع 2025',
    2025,
    '2025-02-01'::DATE,
    '2025-05-31'::DATE,
    true,
    true
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM semesters WHERE code = 'SPRING2025')
ON CONFLICT (code) DO NOTHING;

INSERT INTO semesters (faculty_id, code, name_en, name_ar, academic_year, start_date, end_date, is_active, is_current)
SELECT 
    f.id,
    'SUMMER2025',
    'Summer 2025',
    'صيف 2025',
    2025,
    '2025-06-01'::DATE,
    '2025-08-31'::DATE,
    false,
    false
FROM faculties f WHERE f.code = 'FCO' AND NOT EXISTS (SELECT 1 FROM semesters WHERE code = 'SUMMER2025')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 6. GRADING SCALES
-- ============================================================================
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 95, 100, 'A+', 4.0, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 90, 94, 'A', 4.0, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 85, 89, 'A-', 3.7, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 80, 84, 'B+', 3.3, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 75, 79, 'B', 3.0, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 70, 74, 'B-', 2.7, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 65, 69, 'C+', 2.3, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 60, 64, 'C', 2.0, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 50, 59, 'D', 1.0, true, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;
INSERT INTO grading_scales (faculty_id, scale_name, min_percentage, max_percentage, grade_letter, grade_point, is_passing, created_at)
SELECT f.id, 'Standard 4.0 Scale', 0, 49, 'F', 0.0, false, NOW() FROM faculties f WHERE f.code = 'FCO' ON CONFLICT DO NOTHING;

-- Re-enable triggers
SET session_replication_role = default;

-- Show insertion results
SELECT 'Database seeding completed successfully' as message;
