// ============================================================================
// Academic Bylaws — All numeric thresholds for business logic
// Located in ONE place so changes propagate instantly
// ============================================================================

const BYLAWS = {
  // ──────────────────────────────────────────────────────────────────────
  // PROGRAM STRUCTURE
  // ──────────────────────────────────────────────────────────────────────
  TOTAL_CREDIT_HOURS_REQUIRED: 132,
  SPECIALIZATIONS: {
    CS: { name: 'Computer Science', credits: 132, minCGPA: 2.0 },
    IS: { name: 'Information Systems', credits: 132, minCGPA: 2.0 },
    IT: { name: 'Information Technology', credits: 132, minCGPA: 2.0 },
    SE: { name: 'Software Engineering', credits: 132, minCGPA: 2.0 }
  },

  // ──────────────────────────────────────────────────────────────────────
  // GPA THRESHOLDS & ACADEMIC STANDING
  // ──────────────────────────────────────────────────────────────────────
  CGPA_EXCELLENT: 3.5,      // Distinction → Excellent
  CGPA_VERY_GOOD: 3.0,      // Very Good standing
  CGPA_GOOD: 2.5,           // Good standing
  CGPA_MINIMUM_PASSING: 2.0, // Minimum to continue (Good Standing)
  CGPA_WARNING_THRESHOLD: 2.0, // At risk if < this
  CGPA_DISMISSAL_THRESHOLD: 1.75, // Dismissed if twice below this

  GPA_PASSING_SEMESTRAL: 1.75, // Semester GPA must be ≥ this to avoid warning
  GPA_WARNING: { min: 1.75, max: 2.0 }, // Semester GPA in warning band
  GPA_DISMISSAL_RISK: 1.75, // Below this triggers academic standing review

  // ──────────────────────────────────────────────────────────────────────
  // COURSE REGISTRATION RULES
  // ──────────────────────────────────────────────────────────────────────
  MIN_CREDIT_HOURS_PER_SEMESTER: 12, // Cannot register < 12 CH
  MAX_CREDIT_HOURS_PER_SEMESTER: 18, // Cannot register > 18 CH
  MAX_CREDIT_HOURS_FULL_LOAD: 21,    // With special permission

  // Prerequisite GPA requirement to register for course
  PREREQUISITE_GPA_REQUIREMENT: 1.75,

  // ──────────────────────────────────────────────────────────────────────
  // ATTENDANCE RULES
  // ──────────────────────────────────────────────────────────────────────
  ATTENDANCE_MINIMUM_PERCENTAGE: 42, // Must attend ≥42% of sessions
  ATTENDANCE_WARNING_PERCENTAGE: 50, // Alert if < 50%

  // ──────────────────────────────────────────────────────────────────────
  // GRADE COMPOSITION (Coursework split)
  // ──────────────────────────────────────────────────────────────────────
  GRADE_COMPOSITION: {
    COURSEWORK_PERCENTAGE: 40,  // Assignments, projects, quizzes (0-40)
    MIDTERM_PERCENTAGE: 20,     // Midterm exam
    FINAL_PERCENTAGE: 40        // Final exam
  },

  COURSEWORK_MAX_MARKS: 40,
  MIDTERM_MAX_MARKS: 20,
  FINAL_MAX_MARKS: 40,

  // ──────────────────────────────────────────────────────────────────────
  // SEMESTER DURATION & WINDOWS (in weeks)
  // ──────────────────────────────────────────────────────────────────────
  SEMESTER_DURATION_WEEKS: 16,       // Standard semester length
  SEMESTER_SESSION_WEEKS: 14,        // Weeks of actual teaching

  REGISTRATION_WINDOW_DURATION_WEEKS: 2,  // Add/drop window
  ADD_DROP_WINDOW_DURATION_WEEKS: 3,      // 3 weeks into semester
  WITHDRAWAL_WINDOW_DEADLINE_WEEK: 12,    // Can withdraw until week 12

  // ──────────────────────────────────────────────────────────────────────
  // ACADEMIC LEVELS (by credit hours completed)
  // ──────────────────────────────────────────────────────────────────────
  ACADEMIC_LEVELS: {
    FRESHMAN: { min: 0, max: 29, year: 1 },
    SOPHOMORE: { min: 30, max: 59, year: 2 },
    JUNIOR: { min: 60, max: 89, year: 3 },
    SENIOR: { min: 90, max: 132, year: 4 }
  },

  // ──────────────────────────────────────────────────────────────────────
  // GRADING & PASSING
  // ──────────────────────────────────────────────────────────────────────
  PASSING_GRADE: 'D',         // Minimum letter grade to pass
  PASSING_GRADE_POINT: 1.0,   // Minimum points to pass

  // Minimum percentage to pass (complementary to grade point)
  MINIMUM_PERCENTAGE_TO_PASS: 60,

  // ──────────────────────────────────────────────────────────────────────
  // REPEATED COURSES
  // ──────────────────────────────────────────────────────────────────────
  ALLOW_COURSE_REPEAT: true,
  // Grade replacement: 'replace' (new grade only) | 'average' (both grades affect GPA)
  GRADE_REPLACEMENT_METHOD: 'replace',

  // ──────────────────────────────────────────────────────────────────────
  // ACADEMIC DISMISSAL & RE-ADMISSION
  // ──────────────────────────────────────────────────────────────────────
  DISMISSAL_TRIGGER_COUNT: 2, // Dismissed if warning triggered 2+ times
  DISMISSAL_CGPA_THRESHOLD: 1.75,
  REAPPLICATION_POSSIBLE: true,
  REAPPLICATION_WAITING_SEMESTERS: 1,

  // ──────────────────────────────────────────────────────────────────────
  // TRANSCRIPT & HONORS
  // ──────────────────────────────────────────────────────────────────────
  HONOR_ROLL_CGPA: 3.5,       // Dean's list / honor roll
  DISTINCTION_CGPA: 3.5,
  GRADUATION_CGPA_MINIMUM: 2.0, // Must maintain 2.0 CGPA
  
  // ──────────────────────────────────────────────────────────────────────
  // LATE SUBMISSION & PENALTIES
  // ──────────────────────────────────────────────────────────────────────
  LATE_SUBMISSION_PENALTY_PERCENT: 10, // Per day late
  MAX_LATE_SUBMISSION_DAYS: 5, // Beyond 5 days = 0 marks

  // ──────────────────────────────────────────────────────────────────────
  // SYSTEM DEFAULTS
  // ──────────────────────────────────────────────────────────────────────
  ACADEMIC_YEAR_START_MONTH: 9, // September (index 1-12)
  SEMESTER_START_MONTH: { fall: 9, spring: 2, summer: 6 },

  // Default notification settings
  NOTIFICATIONS: {
    NOTIFY_ON_ACADEMIC_WARNING: true,
    NOTIFY_ON_DISMISSAL: true,
    NOTIFY_ON_GRADE_POSTED: true,
    NOTIFY_ON_REGISTRATION_WINDOW: true
  }
};

/**
 * Validate a CGPA against bylaw thresholds
 * @param {number} cgpa
 * @returns {string} 'excellent' | 'very_good' | 'good' | 'warning' | 'dismissal'
 */
function getAcademicStandingStatus(cgpa) {
  if (cgpa >= BYLAWS.CGPA_EXCELLENT) return 'excellent';
  if (cgpa >= BYLAWS.CGPA_VERY_GOOD) return 'very_good';
  if (cgpa >= BYLAWS.CGPA_GOOD) return 'good';
  if (cgpa >= BYLAWS.CGPA_WARNING_THRESHOLD) return 'warning';
  return 'dismissal';
}

/**
 * Calculate academic level based on completed credit hours
 * @param {number} completedCredits
 * @returns {string} 'freshman' | 'sophomore' | 'junior' | 'senior'
 */
function getAcademicLevel(completedCredits) {
  const levels = BYLAWS.ACADEMIC_LEVELS;
  for (const [level, bounds] of Object.entries(levels)) {
    if (completedCredits >= bounds.min && completedCredits <= bounds.max) {
      return level.toLowerCase();
    }
  }
  return 'senior';
}

module.exports = {
  BYLAWS,
  getAcademicStandingStatus,
  getAcademicLevel
};
