-- ============================================================================

-- Auto-generated seed: Tanta University bylaws + course catalog

-- Source: db-extracted/bylaws_complete.json, specialization_courses_complete.json

-- ============================================================================

BEGIN;

INSERT INTO universities (code, name_en, name_ar, country, city, is_active)
VALUES ('TANTA', 'Tanta University', 'جامعة طنطا', 'Egypt', 'Tanta', TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO faculties (university_id, code, name_en, name_ar, description, is_active)
SELECT u.id, 'FCI', 'Faculty of Computers and Informatics', 'كلية الحاسبات والمعلومات', 'Official faculty for computing programs', TRUE
FROM universities u
WHERE u.code = 'TANTA'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, 'CS', 'Computer Science', 'قسم علوم الحاسب', TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, 'IS', 'Information Systems', 'قسم نظم المعلومات', TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, 'IT', 'Information Technology', 'قسم تكنولوجيا المعلومات', TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, 'SE', 'Software Engineering', 'قسم هندسة البرمجيات', TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, 'CS', 'Computer Science', 'Computer Science', 'Computer Science specialization', 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = 'CS' AND f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, 'IS', 'Information Systems', 'Information Systems', 'Information Systems specialization', 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = 'IS' AND f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, 'IT', 'Information Technology', 'Information Technology', 'Information Technology specialization', 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = 'IT' AND f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, 'SE', 'Software Engineering', 'Software Engineering', 'Software Engineering specialization', 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = 'SE' AND f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'GENERAL_UNIVERSITY_REQUIREMENTS', 'General University Requirements', 'Imported category: General University Requirements', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'BASIC_SCIENCES_AND_MATHEMATICS', 'Basic Sciences and Mathematics', 'Imported category: Basic Sciences and Mathematics', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'BASIC_SCIENCES', 'Basic Sciences', 'Imported category: Basic Sciences', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'BASIC_COMPUTING', 'Basic Computing', 'Imported category: Basic Computing', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'APPLIED_SCIENCES', 'Applied Sciences', 'Imported category: Applied Sciences', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'ELECTIVE', 'Elective', 'Imported category: Elective', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'INFORMATION_SYSTEMS_CORE', 'Information Systems Core', 'Imported category: Information Systems Core', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'INFORMATION_SYSTEMS_ELECTIVE', 'Information Systems Elective', 'Imported category: Information Systems Elective', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'INFORMATION_TECHNOLOGY_CORE', 'Information Technology Core', 'Imported category: Information Technology Core', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'INFORMATION_TECHNOLOGY_ELECTIVE', 'Information Technology Elective', 'Imported category: Information Technology Elective', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'SOFTWARE_ENGINEERING_CORE', 'Software Engineering Core', 'Imported category: Software Engineering Core', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, 'SOFTWARE_ENGINEERING_ELECTIVE', 'Software Engineering Elective', 'Imported category: Software Engineering Elective', FALSE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'UNV111', 'Technical Report Writing', 1, 1,
  (SELECT id FROM course_categories WHERE code = 'GENERAL_UNIVERSITY_REQUIREMENTS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'UNV112', 'Societal Issues', 1, 1,
  (SELECT id FROM course_categories WHERE code = 'GENERAL_UNIVERSITY_REQUIREMENTS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'UNV113', 'English Language (1)', 1, 1,
  (SELECT id FROM course_categories WHERE code = 'GENERAL_UNIVERSITY_REQUIREMENTS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'UNV114', 'Communication Skills', 1, 1,
  (SELECT id FROM course_categories WHERE code = 'GENERAL_UNIVERSITY_REQUIREMENTS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS111', 'Math (1)', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS112', 'Discrete Mathematics', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS113', 'Math (2)', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS114', 'Math (3)', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS115', 'Electronics', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS116', 'Probability and Statistics (1)', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'BS117', 'Operations Research', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'BASIC_SCIENCES_AND_MATHEMATICS'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'CS111', 'Fundamentals of Computer Science', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'CS112', 'Structured Programming', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'CS211', 'Object Oriented Programming', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'CS212', 'Data Structures', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'IS111', 'Intro to Information Systems', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, NULL, 'IT111', 'Digital Fundamentals', 3, 1,
  (SELECT id FROM course_categories WHERE code = 'BASIC_COMPUTING'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS311', 'Computer Security', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS312', 'Computer Organization', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS313', 'Artificial Intelligence', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS314', 'Machine Learning', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS315', 'Big Data Analysis', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS316', 'Advanced Operating Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS411', 'Computation Theory', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS412', 'Internet of Things', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS413', 'Problem Solving & Decision Making', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS414', 'Data Science', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS415', 'Cloud Computing', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS416', 'Compilers', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS214', 'Operating Systems', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS213', 'Algorithms Analysis', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'APPLIED_SCIENCES'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS321', 'Cryptography', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS322', 'Network & Internet Security', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS423', 'Mobile Computing', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS424', 'Mobile Application Programming', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS331', 'Human Computer Interaction', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS332', 'Knowledge Discovery', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS433', 'Selected Topics in AI', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS434', 'High Performance Computing', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS342', 'Data Models and Visualization', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'CS'), 'CS443', 'Natural Language Processing', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS211', 'Database Systems', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS212', 'Optimization Methods', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS311', 'Analysis and Design of Information Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS312', 'Database Management Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS313', 'File Management & Processing', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS314', 'Information Retrieval', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS315', 'Data Warehousing', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS316', 'Data Analytics & Management', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS317', 'Web-based Information Systems Development', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS318', 'Information Theory & Data Compression', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS411', 'Data Mining', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS412', 'Information Systems Project Management', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS413', 'Selected Topics in IS Engineering', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS321', 'Selected Topics in Data Engineering', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS322', 'Cloud Databases', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS331', 'Enterprise Information Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS332', 'Management Information Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS341', 'IS Quality Assurance', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS342', 'IS Security & Risk Management', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS351', 'Data Processing & Analysis', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS414', 'Selected Topics in Databases', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS415', 'IS Development Methodologies', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS423', 'Distributed Databases', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS424', 'Selected Topics in Advanced IS', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS433', 'E-Business', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS434', 'Business Process Management', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IS'), 'IS444', 'IS Audit & Control', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_SYSTEMS_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT211', 'Digital Logic Design', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT311', 'Computer Graphics', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT312', 'Pattern Recognition', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT313', 'Information & Computer Network Security', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT314', 'Signals & Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT315', 'Microprocessors', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT316', 'Image Processing', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT317', 'Advanced Computer Networks', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT318', 'Computer Architecture', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT319', 'Digital Multimedia', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT411', 'Robot Systems', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT413', 'Communication Technology', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT414', 'Cyber Security', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT415', 'Cloud Computing Networks', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT321', 'Network Operating Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT322', 'Blockchain Technology', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT331', 'Embedded Systems', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT332', 'Machine Vision', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT341', 'Computer Animation', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT342', 'Advanced Computer Graphics', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT423', 'Mobile Networks', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT424', 'Selected Topics in Networks', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT433', 'Advanced Pattern Recognition', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT434', 'Selected Topics in Embedded Systems', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT443', 'Advanced Image Processing', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'IT'), 'IT444', 'Selected Topics in Multimedia', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'INFORMATION_TECHNOLOGY_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE211', 'Software Engineering', 3, 2,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE311', 'Software Requirements Analysis', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE312', 'Software Engineering for Internet Applications', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE313', 'Software Design & Architecture', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE314', 'Software Quality Assurance', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE315', 'Advanced Software Engineering', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE316', 'User Interface Design', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE411', 'Software Project Management', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE412', 'Software Testing & Validation', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE413', 'Software Engineering Approach to HCI', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE415', 'Ethics in Software Engineering', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE416', 'Software Evolution & Maintenance', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE417', 'Embedded Systems Software Design', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_CORE'),
  TRUE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE321', 'Software Security', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE322', 'Design Patterns', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE423', 'Software Usability Engineering', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE424', 'Mobile Applications', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE331', 'Software Development Management', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE332', 'Web Application Development', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE433', 'Games Development', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE434', '3D Modeling & Design', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE341', 'Selected Topics in Software Engineering (1)', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE342', 'Professional Software Engineering Practice', 3, 3,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE443', 'Formal Methods in Software Engineering', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, (SELECT id FROM specializations WHERE code = 'SE'), 'SE444', 'Selected Topics in Software Engineering', 3, 4,
  (SELECT id FROM course_categories WHERE code = 'SOFTWARE_ENGINEERING_ELECTIVE'),
  FALSE, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (code) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'UNV111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'UNV112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'UNV113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'UNV114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'UNV111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'UNV112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'UNV113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'UNV114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'UNV111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'UNV112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'UNV113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'UNV114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'UNV111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'UNV112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'UNV113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'university', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'UNV114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS115'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS116'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'BS117'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS115'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS116'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'BS117'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS115'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS116'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'BS117'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS113'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS114'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS115'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS116'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'BS117'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS212'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'IS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'IT111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'CS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'CS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'CS211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'CS212'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IT111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'CS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'CS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'CS211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'CS212'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'CS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'CS112'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'CS211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'CS212'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'IS111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'basic', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'IT111'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS311'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS312'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS313'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS314'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS315'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS316'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS411'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS412'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS413'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS414'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS415'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS416'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS214'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS213'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS321'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS322'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS423'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS424'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS331'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS332'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS433'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS434'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS342'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'CS' AND c.code = 'CS443'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS212'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS311'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS312'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS313'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS314'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS315'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS316'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS317'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS318'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS411'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS412'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS413'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS321'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS322'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS331'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS332'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS341'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS342'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS351'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS414'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS415'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS423'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS424'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS433'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS434'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IS' AND c.code = 'IS444'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT311'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT312'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT313'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT314'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT315'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT316'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT317'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT318'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT319'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT411'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT413'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT414'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT415'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT321'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT322'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT331'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT332'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT341'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT342'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT423'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT424'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT433'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT434'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT443'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'IT' AND c.code = 'IT444'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE211'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE311'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE312'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE313'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE314'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE315'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE316'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE411'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE412'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE413'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE415'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE416'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'core', TRUE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE417'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE321'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE322'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE423'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE424'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE331'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE332'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE433'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE434'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE341'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE342'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE443'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, 'elective', FALSE
FROM specializations s, courses c
WHERE s.code = 'SE' AND c.code = 'SE444'
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'BS113' AND p.code = 'BS111'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'BS114' AND p.code = 'BS113'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'BS116' AND p.code = 'BS111'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'BS117' AND p.code = 'BS111'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS112' AND p.code = 'CS111'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS211' AND p.code = 'CS112'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS212' AND p.code = 'CS112'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS311' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS312' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS313' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS314' AND p.code = 'CS313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS315' AND p.code = 'IS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS316' AND p.code = 'CS214'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS411' AND p.code = 'CS213'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS412' AND p.code = 'CS312'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS413' AND p.code = 'CS313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS414' AND p.code = 'CS314'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS414' AND p.code = 'CS315'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS415' AND p.code = 'CS312'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS416' AND p.code = 'CS213'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS214' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS213' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS321' AND p.code = 'CS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS322' AND p.code = 'CS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS423' AND p.code = 'CS312'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS424' AND p.code = 'CS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS331' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS332' AND p.code = 'CS313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS433' AND p.code = 'CS313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS434' AND p.code = 'CS316'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS342' AND p.code = 'CS212'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'CS443' AND p.code = 'CS313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS211' AND p.code = 'CS112'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS212' AND p.code = 'IS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS311' AND p.code = 'IS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS312' AND p.code = 'IS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS313' AND p.code = 'IS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS314' AND p.code = 'IS211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS315' AND p.code = 'IS312'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS316' AND p.code = 'IS312'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS317' AND p.code = 'IS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS318' AND p.code = 'BS116'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS411' AND p.code = 'IS316'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS412' AND p.code = 'IS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IS413' AND p.code = 'IS311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT211' AND p.code = 'BS115'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT311' AND p.code = 'IT211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT312' AND p.code = 'IT211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT313' AND p.code = 'IT211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT314' AND p.code = 'IT211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT315' AND p.code = 'IT211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT316' AND p.code = 'IT311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT317' AND p.code = 'IT311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT318' AND p.code = 'IT315'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT319' AND p.code = 'IT311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT411' AND p.code = 'IT314'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT413' AND p.code = 'IT314'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT414' AND p.code = 'IT313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'IT415' AND p.code = 'IT317'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE211' AND p.code = 'CS112'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE311' AND p.code = 'SE211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE312' AND p.code = 'SE211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE313' AND p.code = 'SE211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE314' AND p.code = 'SE311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE315' AND p.code = 'SE313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE316' AND p.code = 'SE211'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE411' AND p.code = 'SE311'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE412' AND p.code = 'SE314'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE413' AND p.code = 'SE316'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE415' AND p.code = 'SE411'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE416' AND p.code = 'SE412'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = 'SE417' AND p.code = 'SE313'
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_004_CALENDAR', 'academic_calendar', 'Academic Calendar and Study Year Structure', NULL, 'bylaw', '{"rule_id":"ART_004_CALENDAR","article_number":4,"title":"Academic Calendar and Study Year Structure","semesters":[{"name":"Fall Semester","duration_weeks":"16-17","excluding":"Final Exams","is_mandatory":true,"frequency":"Once per year","start_date_determined_by":"University Council"},{"name":"Spring Semester","duration_weeks":"16-17","excluding":"Final Exams","is_mandatory":true,"frequency":"Once per year","start_date_determined_by":"University Council"},{"name":"Summer Semester","duration_weeks":"7-8","excluding":"Exams","is_mandatory":false,"is_optional":true,"frequency":"Once per year","approval_required":true,"requires_approval_from":["Faculty Council","Student Preference"],"start_date_determined_by":"Faculty Council"}],"credit_hour_definition":{"lecture_hour":{"duration_hours":1,"credit_value":1},"tutorial_hour":{"duration_hours":2,"credit_value":1},"lab_hour":{"duration_hours":3,"credit_value":1}}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_005_LANGUAGE', 'study_language', 'Language of Instruction', NULL, 'bylaw', '{"rule_id":"ART_005_LANGUAGE","article_number":5,"title":"Language of Instruction","primary_language":"English","alternative_language":"Arabic","alternative_conditions":"Subject to university requirements","exam_language_rule":"Exams conducted in the same language as instruction"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_006_ADVISORS', 'academic_advising', 'Academic Advisors', NULL, 'bylaw', '{"rule_id":"ART_006_ADVISORS","article_number":6,"title":"Academic Advisors","advisor_assignment":"One faculty member per student group","advisor_responsibilities":["Assist students in course selection","Provide guidance on registration","Provide overall academic guidance"],"advisor_consultation_mandatory":false,"student_responsibility":"Student responsible for course selection compliance with bylaws","course_selection_constraint":"Must not conflict with faculty bylaws"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_001_ADMISSION', 'admission_requirements', 'General Admission Requirements', NULL, 'bylaw', '{"rule_id":"ART_001_ADMISSION","article_number":1,"title":"General Admission Requirements","eligibility_certificates":["High School - Scientific Math","High School - Scientific Science","Equivalent Certificates"],"approval_authority":["Supreme Council of Universities","Coordination Office"],"exceptional_students":{"allowed":true,"per_registration":1,"to":2},"international_students":{"admission_criteria":"Per Supreme Council and Coordination Office rules"},"special_remedial_requirement":{"target":"Science Track Students (علمي علوم)","course_name":"Math (2) Equivalent / Remedial Math","course_credits":0,"included_in_gpa":false,"required_completion":"Before graduation","prerequisite":"Pass Math (1) or equivalent","note":"Does not award credit hours, does not impact cumulative GPA"}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'DEGREE_STRUCTURE', 'degree_structure', 'Bachelor''s Degree Program Structure', NULL, 'bylaw', '{"rule_id":"DEGREE_STRUCTURE","title":"Bachelor''s Degree Program Structure","specializations":[{"code":"CS","name":"Computer Science","total_credits":132,"general_credits":12,"science_math_credits":15,"basic_computer_credits":15,"applied_science_credits":38,"specialization_electives":10,"project_credits":6,"training_credits":3},{"code":"IS","name":"Information Systems","total_credits":132,"general_credits":12,"science_math_credits":15,"basic_computer_credits":15,"applied_science_credits":38,"specialization_electives":10,"project_credits":6,"training_credits":3},{"code":"IT","name":"Information Technology","total_credits":132,"general_credits":12,"science_math_credits":15,"basic_computer_credits":15,"applied_science_credits":38,"specialization_electives":10,"project_credits":6,"training_credits":3},{"code":"SE","name":"Software Engineering","total_credits":132,"general_credits":12,"science_math_credits":15,"basic_computer_credits":15,"applied_science_credits":38,"specialization_electives":12,"project_credits":6,"training_credits":3}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_004_GRADUATION', 'graduation_requirements', 'Bachelor''s Degree Graduation Requirements', NULL, 'bylaw', '{"rule_id":"ART_004_GRADUATION","article_number":4,"title":"Bachelor''s Degree Graduation Requirements","total_credit_hours_required":132,"minimum_cgpa":2,"minimum_study_years":3,"maximum_study_years_regular":4,"maximum_study_years_with_warnings":6,"minimum_regular_semesters":6,"maximum_regular_semesters":8,"specialization_start_level":3,"specialization_prerequisite_credits":63,"completion_rule":"Successfully passing all 132 credit hours with minimum GPA of 2.0"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_011_REGISTRATION_LIMITS', 'system_logic > registration_constraints', 'Credit Hour Load and Registration Limits', NULL, 'bylaw', '{"rule_id":"ART_011_REGISTRATION_LIMITS","article_number":11,"title":"Credit Hour Load and Registration Limits","min_credit_hours_regular_semester":2,"credit_hour_load_by_level":[{"level":"Freshman (Level 1)","min_credits":0,"max_credits":32,"registration_max":27,"new_student_exception":true,"new_student_max":20},{"level":"Sophomore (Level 2)","min_credits":33,"max_credits":65,"registration_max":30},{"level":"Junior (Level 3)","min_credits":66,"max_credits":101,"registration_max":22},{"level":"Senior (Level 4)","min_credits":102,"max_credits":138,"registration_max":132}],"max_credit_hours_by_cgpa":[{"cgpa_min":3,"cgpa_max":4,"max_credits":70,"tag":"EXCELLENT_LOAD"},{"cgpa_min":2.5,"cgpa_max":2.99,"max_credits":20,"tag":"STANDARD_LOAD_UPPER"},{"cgpa_min":2,"cgpa_max":2.49,"max_credits":40,"tag":"STANDARD_LOAD"},{"cgpa_min":0,"cgpa_max":1.99,"max_credits":70,"tag":"WARNING_LOAD"}],"summer_semester_limits":{"min_credits":2,"max_credits_standard":7,"max_credits_graduating":7,"graduation_semester_exception":true},"advisor_approval_required":true,"add_drop_deadline_weeks":2,"withdrawal_deadline_weeks":7,"summer_withdrawal_weeks":2,"minimum_credits_to_graduate":132}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_025_ACADEMIC_WARNING', 'system_logic > academic_standing_logic', 'Academic Standing and Probation', NULL, 'bylaw', '{"rule_id":"ART_025_ACADEMIC_WARNING","article_number":25,"title":"Academic Standing and Probation","warning_threshold_cgpa":2,"warning_applies_from_semester":"Second semester onwards","first_semester_excluded":true,"warning_status":"Student placed under academic observation","dismissal_consecutive_warnings":4,"dismissal_total_warnings":6,"probation_exclusion":"First Semester","graduation_min_cgpa":2,"honors_min_cgpa":3,"honors_constraint":"No failed courses (F) ever recorded, must complete within 4 years"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_010_LEVEL_TRANSITION', 'system_logic > level_promotion_thresholds', 'Academic Level Definition and Transition', NULL, 'bylaw', '{"rule_id":"ART_010_LEVEL_TRANSITION","article_number":10,"title":"Academic Level Definition and Transition","transition_timing":"Beginning of each semester","transition_rule":"Based on passed credit hours","level_definitions":[{"level":"Freshman","level_code":1,"min_credits_completed":0,"max_credits_completed":32},{"level":"Sophomore","level_code":2,"min_credits_completed":33,"max_credits_completed":65},{"level":"Junior","level_code":3,"min_credits_completed":66,"max_credits_completed":101},{"level":"Senior","level_code":4,"min_credits_completed":102,"max_credits_completed":138}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_014_ATTENDANCE', 'system_logic > attendance_logic', 'Attendance and Exam Entry Requirements', NULL, 'bylaw', '{"rule_id":"ART_014_ATTENDANCE","article_number":14,"title":"Attendance and Exam Entry Requirements","study_type":"Regular system with mandatory attendance monitoring","mandatory_attendance_pct":0.42,"minimum_attendance_percentage":42,"absence_penalty_threshold":0.25,"absence_penalty_threshold_percent":25,"penalty_action":"May prevent exam entry after warning","penalty_grade_without_excuse":"Withdrawn","penalty_grade_with_excuse":"Pass by Excuse","complete_absence_action":"Withdrawal recorded","complete_absence_with_excuse_option":"May take exam within 2 days","exam_entry_requirement":"At least 42% attendance in lectures AND exercises","minimum_coursework_for_exam":"42% of course components"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_026_DISMISSAL', 'system_logic > dismissal_logic', 'Dismissal Rules and Conditions', NULL, 'bylaw', '{"rule_id":"ART_026_DISMISSAL","article_number":26,"title":"Dismissal Rules and Conditions","dismissal_conditions":[{"condition_id":1,"description":"Academic warning for 4 consecutive regular semesters","consecutive_warnings_max":4,"action":"Dismissal from faculty"},{"condition_id":2,"description":"Academic warning for 6 non-consecutive regular semesters","total_warnings_max":6,"action":"Dismissal from faculty"},{"condition_id":3,"description":"Exceeding maximum study duration (8 regular semesters)","max_regular_semesters":8,"action":"Dismissal from faculty"}],"dismissal_exceptions":{"additional_opportunity_allowed":true,"additional_registration":"2 consecutive regular semesters + 1 optional summer","minimum_completion_requirement":"Must pass minimum 12% of total graduation hours","requires_approval":["Faculty Council","University Council"]},"minimum_progress_requirement":0.12,"minimum_progress_credit_hours":16}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_020_PROJECT', 'curriculum_logic > graduation_project', 'Graduation Project Requirements', NULL, 'bylaw', '{"rule_id":"ART_020_PROJECT","article_number":20,"title":"Graduation Project Requirements","project_part_names":[{"part":1,"code":"PR411","name":"Graduation Project (1)","credits":3,"duration_weeks":7,"component":"Analysis and Problem Formulation"},{"part":2,"code":"PR412","name":"Graduation Project (2)","credits":3,"duration_weeks":7,"component":"Design and Implementation"}],"total_credits":6,"min_completed_credits_to_start_pr411":85,"min_completed_credits_to_start_pr412":85,"prerequisite_for_pr412":"Completion of PR411","grading_policy":"IP (In Progress) until completion of Part 2","min_passing_grade":0.4,"min_final_defense_grade":0.15,"project_appears_in_semester":"Consecutive semesters"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'SUMMER_TRAINING', 'curriculum_logic > summer_training', 'Summer Training Requirements', NULL, 'bylaw', '{"rule_id":"SUMMER_TRAINING","title":"Summer Training Requirements","training_sessions":[{"training_number":1,"trigger":"After completing 66 credits","timing":"Summer or designated period"},{"training_number":2,"trigger":"After completing 102 credits","timing":"Summer or designated period"}],"duration_weeks":6,"grade_type":"Pass/Fail","credit_hours":3,"credit_hours_type":"Non-credit-bearing","requirement_for_graduation":true}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_020_DISTRIBUTION', 'curriculum_logic > course_distribution', 'Course Distribution by Category', NULL, 'bylaw', '{"rule_id":"ART_020_DISTRIBUTION","article_number":20,"title":"Course Distribution by Category","distribution":[{"category":"A - Humanities, Ethical and Social Sciences (University Requirements)","percent_min":8,"percent_max":10,"credit_hours":12},{"category":"B - Mathematics and Basic Sciences","percent_min":16,"percent_max":18,"credit_hours":70},{"category":"C - Basic Computing Sciences (Institution Requirements)","percent_min":26,"percent_max":28,"credit_hours":23},{"category":"D - Applied Computing Sciences (Specialization)","percent_min":28,"percent_max":30,"credit_hours":60},{"category":"E - Training","percent_min":3,"percent_max":5,"credit_hours":3},{"category":"F - Projects","percent_min":3,"percent_max":5,"credit_hours":6},{"category":"G - Optional (Institution Character-Identifying Subjects)","percent_min":4,"percent_max":16}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_013_WITHDRAWAL', 'course_withdrawal_rules > regular_semester_withdrawal', 'Course Withdrawal Policy', NULL, 'bylaw', '{"rule_id":"ART_013_WITHDRAWAL","article_number":13,"title":"Course Withdrawal Policy","withdrawal_deadline_weeks":7,"withdrawal_deadline_description":"End of 7th week from registration start","minimum_remaining_credits_after_withdrawal":2,"withdrawal_impact_on_gpa":"Does not count as failing","withdrawal_grade":"W (Withdrawn)","credit_hours_counted":true,"credit_hours_counted_for_gpa":false,"excused_withdrawal":{"condition":"Faculty Council excuse before exam","grade":"Excused Pass"},"non_excused_withdrawal":{"condition":"No faculty excuse","grade":"Withdrawn"}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_013_WITHDRAWAL_SUMMER', 'course_withdrawal_rules > summer_semester_withdrawal', 'Summer Semester Withdrawal Rules', NULL, 'bylaw', '{"rule_id":"ART_013_WITHDRAWAL_SUMMER","article_number":13,"title":"Summer Semester Withdrawal Rules","withdrawal_deadline_weeks":2,"withdrawal_deadline_description":"After 2nd week from registration start","minimum_remaining_credits":2,"maximum_possible_credits":7,"maximum_credit_exception_for_graduation":true,"withdrawal_grade":"W (Withdrawn)","credit_hours_counted":false,"withdrawal_procedures":"Standard Faculty Council procedures apply"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_015_LEAVE', 'course_withdrawal_rules > leave_of_absence', 'Leave of Absence Policy', NULL, 'bylaw', '{"rule_id":"ART_015_LEAVE","article_number":15,"title":"Leave of Absence Policy","non_registration_considered_as":"Withdrawn from study","leave_approval_maximum_consecutive":4,"leave_approval_maximum_nonconsecutive":6,"requires_faculty_council_approval":true,"deferred_status_request_deadline":"Week 7 of semester start","exceeding_leave_without_excuse":"Dismissal from faculty","exceeding_leave_with_excuse":"May continue with conditional status"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_017_GRADING', 'grading_engine', 'Grading Scale and Grade Points', NULL, 'bylaw', '{"rule_id":"ART_017_GRADING","article_number":17,"title":"Grading Scale and Grade Points","total_course_mark":100,"grade_scale":[{"grade":"A+","grade_ar":"ممتاز جداً","min_percentage":96,"max_percentage":100,"points":4,"interpretation":"Excellent"},{"grade":"A","grade_ar":"ممتاز","min_percentage":92,"max_percentage":95,"points":3.7,"interpretation":"Excellent"},{"grade":"A-","grade_ar":"جيد جداً+","min_percentage":88,"max_percentage":91,"points":3.4,"interpretation":"Very Good Plus"},{"grade":"B+","grade_ar":"جيد جداً","min_percentage":84,"max_percentage":87,"points":3.2,"interpretation":"Very Good"},{"grade":"B","grade_ar":"جيد","min_percentage":80,"max_percentage":83,"points":3,"interpretation":"Good"},{"grade":"B-","grade_ar":"جيد-","min_percentage":76,"max_percentage":79,"points":2.8,"interpretation":"Good Minus"},{"grade":"C+","grade_ar":"مقبول+","min_percentage":72,"max_percentage":75,"points":2.6,"interpretation":"Satisfactory Plus"},{"grade":"C","grade_ar":"مقبول","min_percentage":68,"max_percentage":71,"points":2.4,"interpretation":"Satisfactory"},{"grade":"C-","grade_ar":"مقبول-","min_percentage":64,"max_percentage":67,"points":2.2,"interpretation":"Satisfactory Minus"},{"grade":"D+","grade_ar":"مقبول بالحد الأدنى+","min_percentage":60,"max_percentage":63,"points":2,"interpretation":"Minimum Plus"},{"grade":"D","grade_ar":"مقبول بالحد الأدنى","min_percentage":55,"max_percentage":59,"points":1.5,"interpretation":"Minimum"},{"grade":"D-","grade_ar":"مقبول بالحد الأدنى-","min_percentage":50,"max_percentage":54,"points":1,"interpretation":"Minimum Minus"},{"grade":"F","grade_ar":"راسب","min_percentage":0,"max_percentage":49,"points":0,"interpretation":"Fail"}],"special_grades":[{"code":"P","name_en":"Pass","name_ar":"نجح","used_for":"Pass/Fail courses without credit hours"},{"code":"F","name_en":"Fail","name_ar":"راسب","used_for":"Failed course"},{"code":"W","name_en":"Withdrawn","name_ar":"منسحب","used_for":"Course withdrawal"},{"code":"Abs","name_en":"Absent","name_ar":"غياب","used_for":"Absence from final exam without excuse"},{"code":"I","name_en":"Incomplete","name_ar":"غير مكتمل","used_for":"Year-long course or incomplete work"},{"code":"Con","name_en":"Continuing","name_ar":"مستمر","used_for":"Course continuing into next semester"}],"passing_criteria":{"rule_id":"ART_016_MINIMUM_PASS","article_number":16,"title":"Minimum Passing Requirements","minimum_total_course_percentage":40,"minimum_final_exam_percentage":30,"minimum_grade_point_for_pass":1,"minimum_grade_letter_for_pass":"D-"},"grade_distribution":{"rule_id":"ART_017_DISTRIBUTION","article_number":17,"title":"Grade Component Distribution","seasonal_work_percent_min":30,"seasonal_work_percent_max":50,"final_exam_percent":"50% of grade","components":[{"component":"Mid-semester exam","percent_of_seasonal":"Up to 47% of course grade"},{"component":"Course work and tests","percent_of_seasonal":"10%"},{"component":"Other exams","percent_of_seasonal":"10%"},{"component":"Practical applications","percent_of_seasonal":"40%"},{"component":"Final exam","percent_total":"14-50% of total"}]}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_016_MINIMUM_PASS', 'grading_engine > passing_criteria', 'Minimum Passing Requirements', NULL, 'bylaw', '{"rule_id":"ART_016_MINIMUM_PASS","article_number":16,"title":"Minimum Passing Requirements","minimum_total_course_percentage":40,"minimum_final_exam_percentage":30,"minimum_grade_point_for_pass":1,"minimum_grade_letter_for_pass":"D-"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_017_DISTRIBUTION', 'grading_engine > grade_distribution', 'Grade Component Distribution', NULL, 'bylaw', '{"rule_id":"ART_017_DISTRIBUTION","article_number":17,"title":"Grade Component Distribution","seasonal_work_percent_min":30,"seasonal_work_percent_max":50,"final_exam_percent":"50% of grade","components":[{"component":"Mid-semester exam","percent_of_seasonal":"Up to 47% of course grade"},{"component":"Course work and tests","percent_of_seasonal":"10%"},{"component":"Other exams","percent_of_seasonal":"10%"},{"component":"Practical applications","percent_of_seasonal":"40%"},{"component":"Final exam","percent_total":"14-50% of total"}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_018_GPA', 'gpa_system > gpa_calculation', 'GPA and Cumulative GPA Calculation', NULL, 'bylaw', '{"rule_id":"ART_018_GPA","article_number":18,"title":"GPA and Cumulative GPA Calculation","scale_min":0,"scale_max":4,"decimal_places":3,"gpa_type":"Semester Grade Point Average","gpa_calculation_method":"Average of grade points in single semester","gpa_formula":"Sum(Credit Hours × Grade Points) / Total Credit Hours","gpa_transcript_shows":["Earned grade points","Percentage of earned points","Overall GPA by semester"]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_018_CGPA', 'gpa_system > cgpa_classification', 'Cumulative GPA (CGPA)', NULL, 'bylaw', '{"rule_id":"ART_018_CGPA","article_number":18,"title":"Cumulative GPA (CGPA)","cgpa_definition":"Average grade points across all study semesters","cgpa_scale_min":0,"cgpa_scale_max":4,"cgpa_decimal_places":3,"cgpa_calculation_method":"Average of grade points across all completed semesters","cgpa_uses":["Determines academic standing","Determines honors qualification","Determines warning status","Determines dismissal eligibility"],"classifications":[{"min_cgpa":0,"max_cgpa":1,"rating":"Poor","rating_ar":"ضعيف جداً"},{"min_cgpa":1,"max_cgpa":2,"rating":"Weak","rating_ar":"ضعيف"},{"min_cgpa":2,"max_cgpa":2.5,"rating":"Satisfactory (Minimum Pass)","rating_ar":"مقبول"},{"min_cgpa":2.5,"max_cgpa":3,"rating":"Good","rating_ar":"جيد"},{"min_cgpa":3,"max_cgpa":3.5,"rating":"Very Good","rating_ar":"جيد جداً"},{"min_cgpa":3.5,"max_cgpa":4,"rating":"Excellent","rating_ar":"ممتاز"}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_022_REPETITION', 'course_repetition_rules > failed_course_repetition', 'Course Repetition After Failure', NULL, 'bylaw', '{"rule_id":"ART_022_REPETITION","article_number":22,"title":"Course Repetition After Failure","failed_course_requirement":"Must retake and pass","max_grade_for_repeat":2.3,"max_grade_letter_for_repeat":"B","credit_hours_counted":"Once only","gpa_calculation":"Based on new attempt","transcript_shows":"All attempts appear on official record","grade_recorded_for_gpa":"Highest earned attempt"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_023_IMPROVEMENT', 'course_repetition_rules > voluntary_repetition_for_improvement', 'Voluntary Course Repetition for GPA Improvement', NULL, 'bylaw', '{"rule_id":"ART_023_IMPROVEMENT","article_number":23,"title":"Voluntary Course Repetition for GPA Improvement","condition":"Previously passed course with grade < B","max_retakes_allowed":3,"max_grade_achievable":2.3,"max_grade_letter":"B","credit_hours_counted":"Once only (minimum retained)","cgpa_requirement":"Must be below 2.0","course_requirement":"Same or lower level than current enrollment","gpa_impact":"Only highest grade counts for CGPA","transcript_impact":"Highest grade shown on official record"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_027_HONORS', 'honors_degree', 'Honors Degree Qualification', NULL, 'bylaw', '{"rule_id":"ART_027_HONORS","article_number":27,"title":"Honors Degree Qualification","minimum_cgpa":3,"no_failed_courses":true,"no_failed_courses_note":"No F grades ever recorded","no_dismissals":true,"maximum_study_duration_years":4,"maximum_study_duration_semesters":8,"minimum_grade_requirement":3,"minimum_grade_letter":"Very Good","all_grades_must_be":"≥ Very Good (B+ or higher)","qualification_requirements":["Cumulative GPA ≥ 3.0","All grades ≥ Very Good (3.0)","Completion within 4 academic years","No failed courses in entire program","Perfect academic standing"]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_028_RANKING', 'student_ranking', 'Student Class Ranking', NULL, 'bylaw', '{"rule_id":"ART_028_RANKING","article_number":28,"title":"Student Class Ranking","primary_ranking_basis":"Cumulative GPA (Highest to Lowest)","tiebreaker_method":"Sum of all grades earned","ranking_determines":"Class standing and honors within program"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_029_PROGRAM_CHANGE', 'program_changes > specialization_change', 'Specialization Change/Transfer', NULL, 'bylaw', '{"rule_id":"ART_029_PROGRAM_CHANGE","article_number":29,"title":"Specialization Change/Transfer","eligible_level":"Junior (3rd year) minimum","maximum_changes_allowed":1,"meeting_entry_conditions_required":true,"approvals_required":["Academic advisor approval","Department chair recommendation","Specialization faculty council","Education Affairs Committee","University Council"],"credit_transfer_policy":"Credits evaluated and matched to new specialization","new_study_plan":"Required per new specialization curriculum","new_level_determination":"Based on credit equivalency matching"}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_030_COURSE_CODES', 'course_code_system', 'Course Code Structure and System', NULL, 'bylaw', '{"rule_id":"ART_030_COURSE_CODES","article_number":30,"title":"Course Code Structure and System","code_format":"XXX (Three digits)","first_digit_meaning":"Academic Level","first_digit_mapping":{"0":"Freshman Level","1":"Freshman/Sophomore","2":"Junior","3":"Senior","4":"Electives across levels"},"second_position_meaning":"Discipline within specialty","third_position_meaning":"Distinguishes courses within same level and discipline","department_codes":{"CS":"Computer Science","IS":"Information Systems","IT":"Information Technology","SE":"Software Engineering","UNV":"University Requirements","BS":"Basic Sciences","TR":"Training","PR":"Projects"}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_004D_HYBRID', 'hybrid_learning', 'Hybrid and Online Course Delivery', NULL, 'bylaw', '{"rule_id":"ART_004D_HYBRID","article_number":"4-d","title":"Hybrid and Online Course Delivery","approval_required":true,"approving_bodies":["Faculty Council","Education Affairs Committee","University Council"],"face_to_face_percentage_range":{"min":10,"max":14,"unit":"percent"},"online_percentage_range":{"min":13,"max":15,"unit":"percent"},"course_type_considerations":[{"type":"Practical/Laboratory courses","face_to_face_min":10,"face_to_face_max":12,"online_min":13,"online_max":15},{"type":"Theoretical courses","face_to_face_min":14,"face_to_face_max":15,"online_min":0,"online_max":0}]}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_004E_EEXAMS', 'electronic_examinations', 'Electronic Examination Policy', NULL, 'bylaw', '{"rule_id":"ART_004E_EEXAMS","article_number":"4-e","title":"Electronic Examination Policy","approval_required":true,"approving_path":["Department Council recommendation","Faculty Council approval","Teaching Quality Council final approval"],"exam_location_options":["Within campus in secure environment","Outside campus in secure environment"],"grading_options":["Partial electronic grading","Complete electronic grading"],"grading_approval_required":true}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'TRANSFER_CREDITS', 'transfer_students', 'Transfer Student Credit Evaluation', NULL, 'bylaw', '{"rule_id":"TRANSFER_CREDITS","title":"Transfer Student Credit Evaluation","credit_transfer_eligibility":"Passed courses from other institutions","credit_transfer_condition":"At level equivalent to or lower than current level","gpa_transferred":false,"prerequisites_requirement":"Must meet for higher level courses","matching_authority":"Faculty Council","level_advancement_rule":"Student advances from level to equivalent or lower level courses","credit_hours_respected":true}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, 'ART_002_COURSE_VARIATIONS', 'course_variations', 'Course Variation and Deactivation', NULL, 'bylaw', '{"rule_id":"ART_002_COURSE_VARIATIONS","article_number":2,"title":"Course Variation and Deactivation","other_specializations_allowed":true,"creation_authority":"Faculty Council","course_deactivation":{"allowed":true,"reason":"If necessary infrastructure/requirements missing","approval_required":true,"approving_body":"Faculty Council"}}'::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (rule_code) DO NOTHING;

COMMIT;
