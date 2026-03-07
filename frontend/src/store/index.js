import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: authService.isAuthenticated(),

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const { token, user } = response.data.data;

      authService.setToken(token);
      set({ user, isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));

export const useStudentStore = create((set) => ({
  student: null,
  grades: [],
  academicStanding: null,
  isLoading: false,
  error: null,

  setStudent: (student) => set({ student }),
  setGrades: (grades) => set({ grades }),
  setAcademicStanding: (standing) => set({ academicStanding: standing }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export const useCourseStore = create((set) => ({
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,

  setCourses: (courses) => set({ courses }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

export const useSemesterStore = create((set) => ({
  currentSemester: null,
  semesters: [],
  deadlines: [],
  isLoading: false,
  error: null,

  setCurrentSemester: (semester) => set({ currentSemester: semester }),
  setSemesters: (semesters) => set({ semesters }),
  setDeadlines: (deadlines) => set({ deadlines }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
});