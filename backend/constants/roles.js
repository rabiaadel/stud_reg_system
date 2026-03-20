// ============================================================================
// User Roles — Base authorization levels across the system
// ============================================================================

const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',     // Instructor/Faculty
  STUDENT: 'student'
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    // User Management
    VIEW_ALL_USERS: true,
    CREATE_USER: true,
    UPDATE_USER: true,
    DELETE_USER: true,
    APPROVE_REGISTRATION: true,
    
    // Course Management
    CREATE_COURSE: true,
    UPDATE_COURSE: true,
    DELETE_COURSE: true,
    ASSIGN_COURSE_TO_SEMESTER: true,
    ASSIGN_DOCTOR_TO_COURSE: true,
    
    // Semester Management
    CREATE_SEMESTER: true,
    OPEN_SEMESTER: true,
    CLOSE_SEMESTER: true,
    SET_REGISTRATION_WINDOW: true,
    SET_ADD_DROP_WINDOW: true,
    SET_WITHDRAWAL_WINDOW: true,
    
    // System Settings
    VIEW_BYLAWS: true,
    UPDATE_BYLAWS: true,
    VIEW_LOGS: true,
    TRIGGER_ACADEMIC_STANDING: true
  },

  [ROLES.DOCTOR]: {
    // Student Management
    VIEW_ROSTER: true,
    VIEW_STUDENT_PROFILE: true,
    
    // Grade Management
    ENTER_GRADES: true,
    UPDATE_GRADES: true,
    VIEW_STUDENT_TRANSCRIPT: true,
    
    // Attendance
    RECORD_ATTENDANCE: true,
    VIEW_ATTENDANCE_REPORT: true,
    
    // My Account
    VIEW_OWN_PROFILE: true,
    UPDATE_OWN_PROFILE: true
  },

  [ROLES.STUDENT]: {
    // Registration
    REGISTER_COURSES: true,
    DROP_COURSES: true,
    VIEW_COURSE_OFFERINGS: true,
    
    // Grades & Transcript
    VIEW_OWN_GRADES: true,
    VIEW_OWN_TRANSCRIPT: true,
    VIEW_GPA: true,
    VIEW_ACADEMIC_STANDING: true,
    
    // Account
    VIEW_OWN_PROFILE: true,
    UPDATE_OWN_PROFILE: true,
    RESET_PASSWORD: true
  }
};

module.exports = {
  ROLES,
  ROLE_PERMISSIONS
};
