-- Demo users with strong passwords:
-- admin password:  Uni@2026!Admin
-- doctor password: Uni@2026!Doctor
-- student password:Uni@2026!Student

INSERT INTO users (email, password_hash, first_name, last_name, role, faculty_id, is_active)
SELECT 'admin@university.edu', '$2a$10$FNogMcL09L2XqfaCsEPxA.zvWtac4ma7z6vg60EYGccfQg2E3nUfa', 'Super', 'Admin', 'admin', f.id, TRUE
FROM faculties f
WHERE f.code = 'FCI'
UNION ALL
SELECT 'doctor@university.edu', '$2a$10$MNB1PHMlFfvxcw8IZfdHN.FgK.xgYyr/NFCaSe0FOlrq6iNO/RkQW', 'Lead', 'Doctor', 'doctor', f.id, TRUE
FROM faculties f
WHERE f.code = 'FCI'
UNION ALL
SELECT 'student@university.edu', '$2a$10$fSA/tvE75foMp6Nzh44er.o5DXuqEfBmxbAOS3pSBSYqj622.Dw46', 'Test', 'Student', 'student', f.id, TRUE
FROM faculties f
WHERE f.code = 'FCI'
ON CONFLICT (email) DO NOTHING;

-- Demo student profile
INSERT INTO students (
  user_id, faculty_id, specialization_id, student_id,
  first_name_en, last_name_en, email, phone, national_id,
  admission_date, admission_type, is_active
)
SELECT
  u.id,
  f.id,
  sp.id,
  '20240001',
  'Test',
  'Student',
  u.email,
  '+20000000000',
  '29901010101010',
  CURRENT_DATE,
  'Regular',
  TRUE
FROM users u
JOIN faculties f ON f.code = 'FCI'
LEFT JOIN specializations sp ON sp.code = 'CS'
WHERE u.email = 'student@university.edu'
ON CONFLICT DO NOTHING;

-- Demo doctor profile
INSERT INTO instructors (
  user_id, faculty_id, first_name_en, last_name_en, email, phone,
  employee_id, title, department_id, is_active
)
SELECT
  u.id,
  f.id,
  'Lead',
  'Doctor',
  u.email,
  '+20000000000',
  'EMP-0001',
  'Assistant Professor',
  d.id,
  TRUE
FROM users u
JOIN faculties f ON f.code = 'FCI'
LEFT JOIN departments d ON d.code = 'CS' AND d.faculty_id = f.id
WHERE u.email = 'doctor@university.edu'
ON CONFLICT DO NOTHING;
