// ============================================================================
// Student Service — API calls for student functionality
// Courses, registration, grades, transcript, GPA
// ============================================================================

import { apiClient } from './api';

class StudentService {
  /**
   * Get student profile
   */
  async getProfile() {
    try {
      const { data } = await apiClient.get('/students/profile');
      return data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Get student current semester courses
   */
  async getEnrolledCourses(semesterId) {
    try {
      const { data } = await apiClient.get(`/students/courses/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  }

  /**
   * Get all available courses for current semester
   */
  async getAvailableCourses(semesterId) {
    try {
      const { data } = await apiClient.get(`/courses/semester/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching available courses:', error);
      throw error;
    }
  }

  /**
   * Register for a course
   */
  async registerCourse(courseId, semesterId) {
    try {
      const { data } = await apiClient.post('/registrations/register', {
        courseId,
        semesterId
      });
      return data.data;
    } catch (error) {
      console.error('Error registering course:', error);
      throw error;
    }
  }

  /**
   * Drop a course
   */
  async dropCourse(courseId, semesterId) {
    try {
      const { data } = await apiClient.post('/registrations/drop', {
        courseId,
        semesterId
      });
      return data.data;
    } catch (error) {
      console.error('Error dropping course:', error);
      throw error;
    }
  }

  /**
   * Withdraw from a course
   */
  async withdrawCourse(courseId, semesterId, reason) {
    try {
      const { data } = await apiClient.post('/registrations/withdraw', {
        courseId,
        semesterId,
        reason
      });
      return data.data;
    } catch (error) {
      console.error('Error withdrawing from course:', error);
      throw error;
    }
  }

  /**
   * Get student transcript (all semesters)
   */
  async getTranscript() {
    try {
      const { data } = await apiClient.get('/students/transcript');
      return data.data;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  }

  /**
   * Get student GPA info (CGPA, standing, etc.)
   */
  async getGpaInfo() {
    try {
      const { data } = await apiClient.get('/students/gpa');
      return data.data;
    } catch (error) {
      console.error('Error fetching GPA info:', error);
      throw error;
    }
  }

  /**
   * Check if can register for a course
   */
  async validateCourseRegistration(courseId, semesterId) {
    try {
      const { data } = await apiClient.post('/registrations/validate', {
        courseId,
        semesterId
      });
      return data.data;
    } catch (error) {
      console.error('Error validating registration:', error);
      throw error;
    }
  }

  /**
   * Get course schedule for current semester
   */
  async getSchedule(semesterId) {
    try {
      const { data } = await apiClient.get(`/students/schedule/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  }

  /**
   * Get course prerequisites
   */
  async getCoursePrerequisites(courseId) {
    try {
      const { data } = await apiClient.get(`/courses/${courseId}/prerequisites`);
      return data.data;
    } catch (error) {
      console.error('Error fetching prerequisites:', error);
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateProfile(updates) {
    try {
      const { data } = await apiClient.put('/students/profile', updates);
      return data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
}

export default new StudentService();
