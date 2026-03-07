import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Authentication Service
export const authService = {
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),

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

// Student Service
export const studentService = {
  getProfile: (studentId) =>
    apiClient.get(`/students/${studentId}`),

  updateProfile: (studentId, data) =>
    apiClient.put(`/students/${studentId}`, data),

  checkEligibility: (studentId, semesterId) =>
    apiClient.get(`/students/${studentId}/eligibility`, {
      params: { semester_id: semesterId },
    }),

  getPlannedSchedule: (studentId, semesterId) =>
    apiClient.get(`/students/${studentId}/planned-schedule`, {
      params: { semester_id: semesterId },
    }),

  registerCourses: (studentId, data) =>
    apiClient.post(`/students/${studentId}/register`, data),

  withdrawCourse: (studentId, data) =>
    apiClient.post(`/students/${studentId}/withdraw`, data),

  getGrades: (studentId, params) =>
    apiClient.get(`/students/${studentId}/grades`, { params }),

  getAcademicStanding: (studentId) =>
    apiClient.get(`/students/${studentId}/academic-standing`),

  getStandingHistory: (studentId, params) =>
    apiClient.get(`/students/${studentId}/standing-history`, { params }),

  getGraduationEligibility: (studentId) =>
    apiClient.get(`/students/${studentId}/graduation-eligibility`),

  getProgress: (studentId) =>
    apiClient.get(`/students/${studentId}/progress`),

  issueWarning: (studentId, data) =>
    apiClient.post(`/students/${studentId}/issue-warning`, data),

  dismissStudent: (studentId, data) =>
    apiClient.post(`/students/${studentId}/dismiss`, data),
};

// Course Service
export const courseService = {
  getCourses: (facultyId, params) =>
    apiClient.get('/courses', {
      params: { faculty_id: facultyId, ...params },
    }),

  getCourseDetails: (courseId) =>
    apiClient.get(`/courses/${courseId}`),

  checkPrerequisites: (courseId, studentId) =>
    apiClient.get(`/courses/${courseId}/prerequisites`, {
      params: { student_id: studentId },
    }),
};

// Semester Service
export const semesterService = {
  getSemesters: (facultyId, page = 1) =>
    apiClient.get('/semesters', {
      params: { faculty_id: facultyId, page },
    }),

  getActiveSemester: (facultyId) =>
    apiClient.get('/semesters/active', {
      params: { faculty_id: facultyId },
    }),

  getSemesterDetails: (semesterId) =>
    apiClient.get(`/semesters/${semesterId}`),

  getSemesterDeadlines: (semesterId) =>
    apiClient.get(`/semesters/${semesterId}/deadlines`),
};

// Academic Rules Service
export const academicRulesService = {
  getRules: (facultyId, params) =>
    apiClient.get('/academic-rules', {
      params: { faculty_id: facultyId, ...params },
    }),

  getRuleDetails: (ruleId) =>
    apiClient.get(`/academic-rules/${ruleId}`),

  createRule: (data) =>
    apiClient.post('/academic-rules', data),

  updateRule: (ruleId, data) =>
    apiClient.put(`/academic-rules/${ruleId}`, data),
};

// Admin Service
export const adminService = {
  getDashboardStatistics: () =>
    apiClient.get('/admin/statistics/dashboard'),

  getAuditLogs: (params) =>
    apiClient.get('/admin/audit-logs', { params }),

  recalculateAllGPA: () =>
    apiClient.post('/admin/recalculate-all-gpa'),

  sendNotifications: (data) =>
    apiClient.post('/admin/send-notifications', data),

  getAllRegistrations: (params) =>
    apiClient.get('/registrations', { params }),

  getRegistrationStatistics: () =>
    apiClient.get('/registrations/statistics/summary'),
};

// Grade Service
export const gradeService = {
  getStudentGrades: (studentId, params) =>
    apiClient.get(`/grades/student/${studentId}`, { params }),

  postGrade: (data) =>
    apiClient.post('/grades', data),

  updateGrade: (gradeId, data) =>
    apiClient.put(`/grades/${gradeId}`, data),
};