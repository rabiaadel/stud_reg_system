import axios from 'axios';
import jwtDecode from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const unwrap = (response) => response?.data?.data ?? response?.data;

// Authentication Service
export const authService = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

  register: (data) =>
    apiClient.post('/auth/register', data),

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  setToken: (token) => {
    localStorage.setItem('authToken', token);
  },

  getToken: () => localStorage.getItem('authToken'),

  isAuthenticated: () => !!localStorage.getItem('authToken'),

  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        return jwtDecode(token);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
    return null;
  },
};

const getActiveUser = () => authService.getCurrentUser();
const getActiveStudentId = () => getActiveUser()?.profile_id || null;
const getActiveFacultyId = () => getActiveUser()?.faculty_id || null;

const requireStudentId = (studentId) => {
  const resolvedId = studentId || getActiveStudentId();
  if (!resolvedId) {
    throw new Error('Student profile not available');
  }
  return resolvedId;
};

// Student Service
export const studentService = {
  getProfile: (studentId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}`).then(unwrap);
  },

  updateProfile: (studentId, data) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.put(`/students/${resolvedId}`, data).then(unwrap);
  },

  checkEligibility: (studentId, semesterId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/eligibility`, {
      params: { semester_id: semesterId },
    }).then(unwrap);
  },

  getPlannedSchedule: (studentId, semesterId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/planned-schedule`, {
      params: { semester_id: semesterId },
    }).then(unwrap);
  },

  registerCourses: (studentIdOrData, data) => {
    let studentId = studentIdOrData;
    let payload = data;
    if (payload === undefined && typeof studentIdOrData === 'object') {
      payload = studentIdOrData;
      studentId = null;
    }
    const resolvedId = requireStudentId(studentId);
    return apiClient.post(`/students/${resolvedId}/register`, payload).then(unwrap);
  },

  withdrawCourse: (studentIdOrData, data) => {
    let studentId = studentIdOrData;
    let payload = data;
    if (payload === undefined && typeof studentIdOrData === 'object') {
      payload = studentIdOrData;
      studentId = null;
    }
    const resolvedId = requireStudentId(studentId);
    return apiClient.post(`/students/${resolvedId}/withdraw`, payload).then(unwrap);
  },

  getGrades: (studentId, params) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/grades`, { params })
      .then(unwrap)
      .then((data) => {
        const grades = data?.grades ?? data;
        if (!Array.isArray(grades)) return grades;
        return grades.map((grade) => ({
          ...grade,
          credits: grade.credit_hours,
          final_score: grade.total_score ?? grade.final_exam_score,
          grade_point: grade.grade_points,
        }));
      });
  },

  getStudentGrades: (studentId, params) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/grades`, { params })
      .then(unwrap)
      .then((data) => {
        const grades = data?.grades ?? data;
        if (!Array.isArray(grades)) return grades;
        return grades.map((grade) => ({
          ...grade,
          credits: grade.credit_hours,
          final_score: grade.total_score ?? grade.final_exam_score,
          grade_point: grade.grade_points,
        }));
      });
  },

  getAcademicStanding: (studentId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/academic-standing`).then(unwrap);
  },

  getStandingHistory: (studentId, params) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/standing-history`, { params })
      .then(unwrap)
      .then((data) => data?.standing_history ?? data);
  },

  getGraduationEligibility: (studentId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/graduation-eligibility`).then(unwrap);
  },

  getProgress: (studentId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/progress`).then(unwrap);
  },

  getProgressTracking: (studentId) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.get(`/students/${resolvedId}/progress`).then(unwrap);
  },

  issueWarning: (studentId, data) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.post(`/students/${resolvedId}/issue-warning`, data).then(unwrap);
  },

  dismissStudent: (studentId, data) => {
    const resolvedId = requireStudentId(studentId);
    return apiClient.post(`/students/${resolvedId}/dismiss`, data).then(unwrap);
  },
};

// Course Service
export const courseService = {
  getCourses: (facultyId, params) => {
    const resolvedFacultyId = facultyId || getActiveFacultyId();
    return apiClient.get('/courses', {
      params: { faculty_id: resolvedFacultyId, ...params },
    }).then(unwrap).then((data) => {
      if (!Array.isArray(data)) return data;
      return data.map((course) => ({
        ...course,
        course_id: course.id,
        course_code: course.code,
        course_name: course.name,
        credits: course.credit_hours,
      }));
    });
  },

  getCourseDetails: (courseId) =>
    apiClient.get(`/courses/${courseId}`).then(unwrap).then((course) => {
      if (!course) return course;
      return {
        ...course,
        course_id: course.id,
        course_code: course.code,
        course_name: course.name_en || course.name,
        credits: course.credit_hours,
        category: course.category?.name_en || course.category?.name_ar || course.category,
      };
    }),

  checkPrerequisites: (courseId, studentId) =>
    apiClient.get(`/courses/${courseId}/prerequisites`, {
      params: { student_id: studentId },
    }).then(unwrap),
};

// Semester Service
export const semesterService = {
  getSemesters: (facultyId, page = 1) =>
    apiClient.get('/semesters', {
      params: { faculty_id: facultyId, page },
    }).then(unwrap),

  getActiveSemester: (facultyId) =>
    apiClient.get('/semesters/active', {
      params: { faculty_id: facultyId },
    }).then(unwrap),

  getSemesterDetails: (semesterId) =>
    apiClient.get(`/semesters/${semesterId}`).then(unwrap),

  getSemesterDeadlines: (semesterId) =>
    apiClient.get(`/semesters/${semesterId}/deadlines`).then(unwrap),
};

// Academic Rules Service
export const academicRulesService = {
  getRules: (facultyId, params) =>
    apiClient.get('/academic-rules', {
      params: { faculty_id: facultyId, ...params },
    }).then(unwrap),

  getRuleDetails: (ruleId) =>
    apiClient.get(`/academic-rules/${ruleId}`).then(unwrap),

  createRule: (data) =>
    apiClient.post('/academic-rules', data).then(unwrap),

  updateRule: (ruleId, data) =>
    apiClient.put(`/academic-rules/${ruleId}`, data).then(unwrap),
};

// Admin Service
export const adminService = {
  getDashboardStatistics: () =>
    apiClient.get('/admin/statistics/dashboard').then(unwrap),

  getAuditLogs: (params) =>
    apiClient.get('/admin/audit-logs', { params }).then(unwrap),

  recalculateAllGPA: () =>
    apiClient.post('/admin/recalculate-all-gpa').then(unwrap),

  recalculateStudent: (studentId) =>
    apiClient.post(`/admin/recalculate-student/${studentId}`).then(unwrap),

  sendNotifications: (data) =>
    apiClient.post('/admin/send-notifications', data).then(unwrap),

  getAccountRequests: (params) =>
    apiClient.get('/admin/account-requests', { params }).then(unwrap),

  approveAccountRequest: (requestId, data) =>
    apiClient.post(`/admin/account-requests/${requestId}/approve`, data).then(unwrap),

  rejectAccountRequest: (requestId, data) =>
    apiClient.post(`/admin/account-requests/${requestId}/reject`, data).then(unwrap),

  getAllRegistrations: (params) =>
    apiClient.get('/registrations', { params }).then(unwrap),

  getRegistrationStatistics: () =>
    apiClient.get('/registrations/statistics/summary').then(unwrap),
};

// Grade Service
export const gradeService = {
  getStudentGrades: (studentId, params) =>
    apiClient.get(`/grades/student/${studentId}`, { params }).then(unwrap),

  postGrade: (data) =>
    apiClient.post('/grades', data).then(unwrap),

  updateGrade: (gradeId, data) =>
    apiClient.put(`/grades/${gradeId}`, data).then(unwrap),
};

// Instructor/Doctor Service
export const instructorService = {
  getProfile: (instructorId) =>
    apiClient.get(`/instructors/${instructorId}`).then(unwrap),

  getAssignments: (instructorId, params) =>
    apiClient.get(`/instructors/${instructorId}/assignments`, { params }).then(unwrap),
};

// Public lookup service
export const publicService = {
  getFaculties: () =>
    apiClient.get('/public/faculties').then(unwrap),

  getDepartments: (facultyId) =>
    apiClient.get('/public/departments', { params: { faculty_id: facultyId } }).then(unwrap),

  getSpecializations: (departmentId) =>
    apiClient.get('/public/specializations', { params: { department_id: departmentId } }).then(unwrap),
};
