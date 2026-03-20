// ============================================================================
// Grade Service — API calls for grade/transcript operations
// View grades, GPA, academic standing
// ============================================================================

import { apiClient } from './api';

class GradeService {
  /**
   * Get student's grades for a semester
   */
  async getSemesterGrades(semesterId) {
    try {
      const { data } = await apiClient.get(`/grades/semester/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching semester grades:', error);
      throw error;
    }
  }

  /**
   * Get student's current semester GPA
   */
  async getSemesterGPA(semesterId) {
    try {
      const { data } = await apiClient.get(`/grades/semester/${semesterId}/gpa`);
      return data.data;
    } catch (error) {
      console.error('Error fetching semester GPA:', error);
      throw error;
    }
  }

  /**
   * Get student's cumulative GPA (CGPA)
   */
  async getCGPA() {
    try {
      const { data } = await apiClient.get('/grades/cgpa');
      return data.data;
    } catch (error) {
      console.error('Error fetching CGPA:', error);
      throw error;
    }
  }

  /**
   * Get student's academic standing status
   */
  async getAcademicStanding() {
    try {
      const { data } = await apiClient.get('/grades/academic-standing');
      return data.data;
    } catch (error) {
      console.error('Error fetching academic standing:', error);
      throw error;
    }
  }

  /**
   * Get full transcript (all semesters, all grades)
   */
  async getFullTranscript() {
    try {
      const { data } = await apiClient.get('/grades/transcript');
      return data.data;
    } catch (error) {
      console.error('Error fetching transcript:', error);
      throw error;
    }
  }

  /**
   * Get grade distribution (how many A's, B's, etc.)
   */
  async getGradeDistribution() {
    try {
      const { data } = await apiClient.get('/grades/distribution');
      return data.data;
    } catch (error) {
      console.error('Error fetching grade distribution:', error);
      throw error;
    }
  }

  /**
   * Get GPA trend (GPA per semester)
   */
  async getGPATrend() {
    try {
      const { data } = await apiClient.get('/grades/trend');
      return data.data;
    } catch (error) {
      console.error('Error fetching GPA trend:', error);
      throw error;
    }
  }

  /**
   * Get grade for a specific course
   */
  async getCourseGrade(courseId, semesterId) {
    try {
      const { data } = await apiClient.get(`/grades/course/${courseId}/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching course grade:', error);
      throw error;
    }
  }

  /**
   * Download transcript as PDF
   */
  async downloadTranscript() {
    try {
      window.location.href = `${apiClient.defaults.baseURL}/grades/transcript/pdf`;
    } catch (error) {
      console.error('Error downloading transcript:', error);
      throw error;
    }
  }

  /**
   * Get credit hours progress (X/132 completed)
   */
  async getCreditProgress() {
    try {
      const { data } = await apiClient.get('/grades/credit-progress');
      return data.data;
    } catch (error) {
      console.error('Error fetching credit progress:', error);
      throw error;
    }
  }

  /**
   * Request grade appeal (for disputed grades)
   */
  async requestGradeAppeal(courseId, semesterId, reason) {
    try {
      const { data } = await apiClient.post('/grades/appeal', {
        courseId,
        semesterId,
        reason
      });
      return data.data;
    } catch (error) {
      console.error('Error submitting grade appeal:', error);
      throw error;
    }
  }
}

export default new GradeService();
