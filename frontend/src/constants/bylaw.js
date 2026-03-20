// ============================================================================
// Frontend Constants — Mirror backend bylaws
// Keep synchronized with backend/constants/bylaw.js
// ============================================================================

export const BYLAWS = {
  // Program structure
  TOTAL_CREDIT_HOURS_REQUIRED: 132,
  
  // GPA thresholds
  CGPA_EXCELLENT: 3.5,
  CGPA_VERY_GOOD: 3.0,
  CGPA_GOOD: 2.5,
  CGPA_MINIMUM_PASSING: 2.0,
  CGPA_WARNING_THRESHOLD: 2.0,

  // Course registration
  MIN_CREDIT_HOURS_PER_SEMESTER: 12,
  MAX_CREDIT_HOURS_PER_SEMESTER: 18,

  // Attendance
  ATTENDANCE_MINIMUM_PERCENTAGE: 42,
  
  // Academic levels
  ACADEMIC_LEVELS: {
    FRESHMAN: { min: 0, max: 29, year: 1 },
    SOPHOMORE: { min: 30, max: 59, year: 2 },
    JUNIOR: { min: 60, max: 89, year: 3 },
    SENIOR: { min: 90, max: 132, year: 4 }
  },

  // Passing criteria
  PASSING_GRADE: 'D',
  PASSING_GRADE_POINT: 1.0,
  MINIMUM_PERCENTAGE_TO_PASS: 60,

  // Honors
  HONOR_ROLL_CGPA: 3.5,
  DISTINCTION_CGPA: 3.5,
  GRADUATION_CGPA_MINIMUM: 2.0
};

export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  STUDENT: 'student'
};

export const MESSAGES = {
  // Success
  REGISTRATION_SUCCESS: 'Successfully registered for course',
  DROP_SUCCESS: 'Course dropped successfully',
  WITHDRAWAL_SUCCESS: 'Course withdrawal submitted',
  
  // Errors
  REGISTRATION_FAILED: 'Failed to register for course',
  PREREQUISITES_NOT_MET: 'Prerequisites not satisfied',
  GPA_TOO_LOW: 'Your GPA is below the requirement',
  CREDIT_LIMIT_EXCEEDED: 'Registration would exceed credit hour limit',
  OUTSIDE_WINDOW: 'Registration period is closed',
  SCHEDULE_CONFLICT: 'Course conflicts with your schedule',
  
  // Info
  REGISTRATON_WINDOW_CLOSED: 'Registration window is closed',
  ADD_DROP_WINDOW_CLOSED: 'Add/drop period has ended',
  WITHDRAWAL_WINDOW_CLOSED: 'Withdraw deadline has passed'
};

export const UI_CONFIG = {
  // Pagination
  ITEMS_PER_PAGE: 10,
  
  // Timeouts
  API_TIMEOUT: 30000,
  NOTIFICATION_DURATION: 3000,
  
  // Colors
  COLORS: {
    EXCELLENT: '#27ae60',    // Green
    VERY_GOOD: '#3498db',    // Blue
    GOOD: '#3498db',         // Blue
    WARNING: '#f39c12',       // Orange
    DISMISSAL: '#e74c3c',     // Red
    NEUTRAL: '#95a5a6'       // Gray
  }
};

export default {
  BYLAWS,
  ROLES,
  MESSAGES,
  UI_CONFIG
};
