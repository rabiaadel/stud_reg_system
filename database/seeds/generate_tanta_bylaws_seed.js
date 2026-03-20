const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const extractedDir = path.join(rootDir, 'db-extracted');
const coursesPath = path.join(extractedDir, 'specialization_courses_complete.json');
const bylawsPath = path.join(extractedDir, 'bylaws_complete.json');
const outputPath = path.join(__dirname, '002_tanta_bylaws_seed.sql');

const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
const bylawsData = JSON.parse(fs.readFileSync(bylawsPath, 'utf8'));

const sql = [];
const facultyCode = 'FCI';
const universityCode = 'TANTA';

const escapeSql = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
};

const slugToCode = (value) => String(value)
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '_')
  .replace(/^_+|_+$/g, '')
  .slice(0, 50);

const addStatement = (statement) => {
  sql.push(statement.trim());
};

const addCourse = (course, overrides = {}) => {
  if (!course || !course.code) return;
  const existing = courseMap.get(course.code);
  if (!existing) {
    courseMap.set(course.code, {
      code: course.code,
      name: course.name || course.name_en || course.code,
      credits: Number(course.credits || course.credit_hours || 0),
      level: course.level || null,
      category: course.category || overrides.category || 'Specialization',
      mandatory: overrides.mandatory ?? course.mandatory ?? true,
      specialization: overrides.specialization || null,
      prerequisites: [],
    });
  }

  const record = courseMap.get(course.code);
  record.category = record.category || overrides.category || course.category || 'Specialization';
  record.mandatory = overrides.mandatory ?? record.mandatory;
  record.specialization = overrides.specialization || record.specialization;

  const prereqList = course.prerequisites || course.prerequisite || [];
  const normalizedPrereqs = Array.isArray(prereqList) ? prereqList : [prereqList];
  normalizedPrereqs.filter(Boolean).forEach((prereq) => {
    prereqPairs.add(`${course.code}::${prereq}`);
  });
};

const addRequirement = (specCode, courseCode, requirementType, isMandatory) => {
  if (!specCode || !courseCode) return;
  requirementPairs.add(`${specCode}::${courseCode}::${requirementType}::${isMandatory ? '1' : '0'}`);
};

const courseMap = new Map();
const prereqPairs = new Set();
const requirementPairs = new Set();
const categorySet = new Set();

const allSpecializationCodes = [];
const specializationSpecs = Object.keys(coursesData)
  .filter((key) => key.endsWith('_specialization'))
  .map((key) => coursesData[key])
  .filter((spec) => spec && spec.code);

specializationSpecs.forEach((spec) => {
  allSpecializationCodes.push(spec.code);
});

const pushCommonCourses = (courses, category, requirementType) => {
  if (!Array.isArray(courses)) return;
  courses.forEach((course) => {
    addCourse(course, { category, mandatory: course.mandatory ?? true });
  });

  allSpecializationCodes.forEach((specCode) => {
    courses.forEach((course) => {
      addRequirement(specCode, course.code, requirementType, course.mandatory ?? true);
    });
  });
};

pushCommonCourses(coursesData.general_courses?.university_requirements || [], 'General University Requirements', 'university');
pushCommonCourses(coursesData.basic_sciences_mathematics?.courses || [], 'Basic علوم ورياضيات', 'basic');
pushCommonCourses(coursesData.basic_computing_sciences || [], 'Basic Computing', 'basic');

specializationSpecs.forEach((spec) => {
  const specCode = spec.code;
  const mandatoryCourses = spec.mandatory_courses || [];
  const electiveCourses = spec.elective_courses || [];

  mandatoryCourses.forEach((course) => {
    addCourse(course, { category: course.category || `${spec.name} Core`, mandatory: true, specialization: specCode });
    addRequirement(specCode, course.code, 'core', true);
  });

  electiveCourses.forEach((course) => {
    addCourse(course, { category: course.category || `${spec.name} Elective`, mandatory: false, specialization: specCode });
    addRequirement(specCode, course.code, 'elective', false);
  });
});

courseMap.forEach((course) => {
  if (course.category) categorySet.add(course.category);
});

addStatement('-- ============================================================================');
addStatement('-- Auto-generated seed: Tanta University bylaws + course catalog');
addStatement('-- Source: db-extracted/bylaws_complete.json, specialization_courses_complete.json');
addStatement('-- ============================================================================');
addStatement('BEGIN;');

addStatement(`
INSERT INTO universities (code, name_en, name_ar, country, city, is_active)
VALUES ('${universityCode}', 'Tanta University', 'جامعة طنطا', 'Egypt', 'Tanta', TRUE)
ON CONFLICT (code) DO NOTHING;
`);

addStatement(`
INSERT INTO faculties (university_id, code, name_en, name_ar, description, is_active)
SELECT u.id, '${facultyCode}', 'Faculty of Computers and Informatics', 'كلية الحاسبات والمعلومات', 'Official faculty for computing programs', TRUE
FROM universities u
WHERE u.code = '${universityCode}'
ON CONFLICT (code) DO NOTHING;
`);

const departments = [
  { code: 'CS', name_en: 'Computer Science', name_ar: 'قسم علوم الحاسب' },
  { code: 'IS', name_en: 'Information Systems', name_ar: 'قسم نظم المعلومات' },
  { code: 'IT', name_en: 'Information Technology', name_ar: 'قسم تكنولوجيا المعلومات' },
  { code: 'SE', name_en: 'Software Engineering', name_ar: 'قسم هندسة البرمجيات' },
];

departments.forEach((dept) => {
  addStatement(`
INSERT INTO departments (faculty_id, code, name_en, name_ar, is_active)
SELECT f.id, ${escapeSql(dept.code)}, ${escapeSql(dept.name_en)}, ${escapeSql(dept.name_ar)}, TRUE
FROM faculties f
WHERE f.code = '${facultyCode}'
ON CONFLICT (code) DO NOTHING;
  `);
});

specializationSpecs.forEach((spec) => {
  addStatement(`
INSERT INTO specializations (department_id, faculty_id, code, name_en, name_ar, description, total_credits, min_cgpa, min_study_years, max_study_years, specialization_start_credits, is_active)
SELECT d.id, f.id, ${escapeSql(spec.code)}, ${escapeSql(spec.name)}, ${escapeSql(spec.name)}, ${escapeSql(spec.name + ' specialization')}, 132, 2.0, 3, 4, 66, TRUE
FROM departments d
JOIN faculties f ON f.id = d.faculty_id
WHERE d.code = ${escapeSql(spec.code)} AND f.code = '${facultyCode}'
ON CONFLICT (code) DO NOTHING;
  `);
});

categorySet.forEach((categoryName) => {
  addStatement(`
INSERT INTO course_categories (faculty_id, code, name_en, description, is_mandatory)
SELECT f.id, ${escapeSql(slugToCode(categoryName))}, ${escapeSql(categoryName)}, ${escapeSql(`Imported category: ${categoryName}`)}, FALSE
FROM faculties f
WHERE f.code = '${facultyCode}'
ON CONFLICT (code) DO NOTHING;
  `);
});

courseMap.forEach((course) => {
  const specializationClause = course.specialization
    ? `(SELECT id FROM specializations WHERE code = ${escapeSql(course.specialization)})`
    : 'NULL';

  addStatement(`
INSERT INTO courses (faculty_id, specialization_id, code, name_en, credit_hours, level, category_id, is_mandatory, is_active)
SELECT f.id, ${specializationClause}, ${escapeSql(course.code)}, ${escapeSql(course.name)}, ${course.credits || 0}, ${course.level || 'NULL'},
  (SELECT id FROM course_categories WHERE code = ${escapeSql(slugToCode(course.category || 'Specialization'))}),
  ${course.mandatory ? 'TRUE' : 'FALSE'}, TRUE
FROM faculties f
WHERE f.code = '${facultyCode}'
ON CONFLICT (code) DO NOTHING;
  `);
});

requirementPairs.forEach((pair) => {
  const [specCode, courseCode, requirementType, isMandatoryFlag] = pair.split('::');
  addStatement(`
INSERT INTO specialization_course_requirements (specialization_id, course_id, requirement_type, is_mandatory)
SELECT s.id, c.id, ${escapeSql(requirementType)}, ${isMandatoryFlag === '1' ? 'TRUE' : 'FALSE'}
FROM specializations s, courses c
WHERE s.code = ${escapeSql(specCode)} AND c.code = ${escapeSql(courseCode)}
ON CONFLICT (specialization_id, course_id, requirement_type) DO NOTHING;
  `);
});

prereqPairs.forEach((pair) => {
  const [courseCode, prereqCode] = pair.split('::');
  addStatement(`
INSERT INTO course_prerequisites (course_id, prerequisite_course_id, is_strict, created_at)
SELECT c.id, p.id, TRUE, CURRENT_TIMESTAMP
FROM courses c, courses p
WHERE c.code = ${escapeSql(courseCode)} AND p.code = ${escapeSql(prereqCode)}
ON CONFLICT (course_id, prerequisite_course_id) DO NOTHING;
  `);
});

const ruleEntries = [];
const collectedRuleCodes = new Set();

const collectRules = (value, path = []) => {
  if (!value || typeof value !== 'object') return;

  if (value.rule_id && value.title && !collectedRuleCodes.has(value.rule_id)) {
    collectedRuleCodes.add(value.rule_id);
    ruleEntries.push({
      rule_id: value.rule_id,
      title: value.title,
      category: path.join(' > ') || 'bylaws',
      payload: value,
    });
  }

  Object.entries(value).forEach(([key, child]) => {
    if (key === 'rule_id' || key === 'title') return;
    if (Array.isArray(child)) {
      child.forEach((item, index) => collectRules(item, [...path, key, String(index + 1)]));
    } else if (child && typeof child === 'object') {
      collectRules(child, [...path, key]);
    }
  });
};

collectRules(bylawsData);

ruleEntries.forEach((rule) => {
  const ruleData = JSON.stringify(rule.payload);
  addStatement(`
INSERT INTO academic_rules (faculty_id, rule_code, category, title, description, rule_type, rule_data, is_active, effective_from)
SELECT f.id, ${escapeSql(rule.rule_id)}, ${escapeSql(rule.category)}, ${escapeSql(rule.title)}, NULL, 'bylaw', ${escapeSql(ruleData)}::jsonb, TRUE, DATE '2024-01-01'
FROM faculties f
WHERE f.code = '${facultyCode}'
ON CONFLICT (rule_code) DO NOTHING;
  `);
});

addStatement('COMMIT;');

fs.writeFileSync(outputPath, sql.join('\n\n').trim() + '\n', 'utf8');
console.log(`Seed file generated at ${outputPath}`);
