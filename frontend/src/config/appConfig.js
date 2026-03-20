// App Configuration and Metadata
export const APP_CONFIG = {
  APP_NAME_EN: 'Faculty of Computers and Informatics',
  APP_NAME_AR: 'كلية الحاسبات والمعلومات',
  UNIVERSITY_EN: 'Tanta University',
  UNIVERSITY_AR: 'جامعة طنطا',
  
  FULL_NAME_EN: 'Faculty of Computers and Informatics - Tanta University',
  FULL_NAME_AR: 'كلية الحاسبات والمعلومات - جامعة طنطا',
  
  COLORS: {
    primary: '#1890ff',
    secondary: '#722ed1',
    success: '#52c41a',
    danger: '#f5222d',
    warning: '#faad14',
    info: '#1890ff',
    light: '#f5f5f5',
    dark: '#1f1f1f',
  },

  USER_ROLES: {
    STUDENT: 'student',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
  },

  SPECIALIZATIONS: {
    CS: {
      code: 'CS',
      name_en: 'Computer Science',
      name_ar: 'علوم الحاسبات',
    },
    IS: {
      code: 'IS',
      name_en: 'Information Systems',
      name_ar: 'نظم المعلومات',
    },
    IT: {
      code: 'IT',
      name_en: 'Information Technology',
      name_ar: 'تكنولوجيا المعلومات',
    },
    SE: {
      code: 'SE',
      name_en: 'Software Engineering',
      name_ar: 'هندسة البرمجيات',
    },
  },

  ACADEMIC_LEVELS: {
    1: { name_en: 'Freshman', name_ar: 'الفرقة الأولى' },
    2: { name_en: 'Sophomore', name_ar: 'الفرقة الثانية' },
    3: { name_en: 'Junior', name_ar: 'الفرقة الثالثة' },
    4: { name_en: 'Senior', name_ar: 'الفرقة الرابعة' },
  },

  GRADE_CLASSIFICATION: {
    poor: { min: 0, max: 1.0, label_en: 'Poor', label_ar: 'ضعيف جداً' },
    weak: { min: 1.0, max: 2.0, label_en: 'Weak', label_ar: 'ضعيف' },
    satisfactory: { min: 2.0, max: 2.5, label_en: 'Satisfactory', label_ar: 'مقبول' },
    good: { min: 2.5, max: 3.0, label_en: 'Good', label_ar: 'جيد' },
    very_good: { min: 3.0, max: 3.5, label_en: 'Very Good', label_ar: 'جيد جداً' },
    excellent: { min: 3.5, max: 4.0, label_en: 'Excellent', label_ar: 'ممتاز' },
  },

  BYLAWS_THRESHOLDS: {
    MIN_CGPA: 2.0,
    MIN_CGPA_HONORS: 3.0,
    MIN_ATTENDANCE: 42,
    MIN_COURSE_PASSING: 40,
    MIN_EXAM_PASSING: 30,
    MAX_STUDY_YEARS: 4,
    MAX_SEMESTERS: 8,
    MAX_CONSECUTIVE_WARNINGS: 4,
    MAX_TOTAL_WARNINGS: 6,
    MAX_IMPROVEMENT_RETAKES: 3,
    TOTAL_CREDITS_REQUIRED: 132,
    PROJECT_CREDITS_REQUIRED: 85,
  },

  BOARDS: {
    ANNOUNCEMENTS: 'announcements',
    ACADEMIC_NEWS: 'academic_news',
    COURSE_DISCUSSIONS: 'course_discussions',
    STUDENT_LIFE: 'student_life',
    CAREER: 'career',
    ACADEMIC_STANDING: 'academic_standing',
    GRADUATION: 'graduation',
  },

  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    PASSWORD_RESET_REQUEST: '/auth/request-password-reset',
    PASSWORD_RESET: '/auth/reset-password',
  },

  STUDENTS: {
    PROFILE: '/students/profile',
    ELIGIBILITY: '/students/eligibility',
    COURSES: '/students/courses',
    GRADES: '/students/grades',
    ACADEMIC_STANDING: '/students/academic-standing',
    GRADUATION: '/students/graduation',
    PROGRESS: '/students/progress',
  },

  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ACCOUNT_REQUESTS: '/admin/account-requests',
    APPROVE_REQUEST: '/admin/account-requests/:requestId/approve',
    REJECT_REQUEST: '/admin/account-requests/:requestId/reject',
    AUDIT_LOGS: '/admin/audit-logs',
  },

  DOCTOR: {
    DASHBOARD: '/instructors/dashboard',
    COURSES: '/instructors/courses',
    STUDENTS: '/instructors/students',
    GRADES: '/instructors/grades',
  },

  BOARDS: {
    LIST: '/boards',
    POSTS: '/boards/:boardId/posts',
    CREATE_POST: '/boards/:boardId/posts',
  },
};

export default APP_CONFIG;
