// ============================================================================
// Registration Service — API calls for course registration
// Register, drop, withdraw, validate prerequisites
// ============================================================================

import { apiClient } from './api';

class RegistrationService {
  /**
   * Get current semester registration status
   */
  async getRegistrationStatus(semesterId) {
    try {
      const { data } = await apiClient.get(`/registrations/status/${semesterId}`);
      return data.data;
    } catch (error) {
      console.error('Error fetching registration status:', error);
      throw error;
    }
  }

  /**
   * Register student for a course
   */
  async register(courseId, semesterId) {
    try {
      const { data } = await apiClient.post('/registrations/register', {
        courseId,
        semesterId
      });
      return data.data;
    } catch (error) {
      console.error('Error registering for course:', error);
      throw error;
    }
  }

  /**
   * Drop a course (add/drop period)
   */
  async drop(courseId, semesterId) {
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
   * Withdraw from a course (after add/drop period)
   */
  async withdraw(courseId, semesterId, reason = '') {
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
   * Validate registration before submitting
   * Checks: prerequisites, GPA, credit limits, schedule conflicts
   */
  async validateRegistration(courseId, semesterId) {
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
   * Check registration window status
   */
  async checkWindow(semesterId, windowType = 'registration') {
    try {
      const { data } = await apiClient.get(
        `/registrations/window/${semesterId}/${windowType}`
      );
      return data.data;
    } catch (error) {
      console.error('Error checking window status:', error);
      throw error;
    }
  }

  /**
   * Get current semester registration info
   */
  async getRegistrationInfo(semesterId) {
    try {
      const { data } = await apiClient.get(`/registrations/${semesterId}/info`);
      return data.data;
    } catch (error) {
      console.error('Error fetching registration info:', error);
      throw error;
    }
  }

  /**
   * Get credit hours currently registered
   */
  async getRegisteredCredits(semesterId) {
    try {
      const { data } = await apiClient.get(
        `/registrations/${semesterId}/credits`
      );
      return data.data;
    } catch (error) {
      console.error('Error fetching registered credits:', error);
      throw error;
    }
  }

  /**
   * Check if course is available for registration
   */
  async isAvailable(courseId, semesterId) {
    try {
      const { data } = await apiClient.get(
        `/courses/${courseId}/available/${semesterId}`
      );
      return data.data?.available || false;
    } catch (error) {
      console.error('Error checking course availability:', error);
      return false;
    }
  }

  /**
   * Check for schedule conflicts
   */
  async getScheduleConflicts(courseId, semesterId) {
    try {
      const { data } = await apiClient.get(
        `/registrations/${semesterId}/conflicts/${courseId}`
      );
      return data.data?.conflicts || [];
    } catch (error) {
      console.error('Error checking schedule conflicts:', error);
      return [];
    }
  }

  /**
   * Get registration history (past semesters)
   */
  async getHistory() {
    try {
      const { data } = await apiClient.get('/registrations/history');
      return data.data;
    } catch (error) {
      console.error('Error fetching registration history:', error);
      throw error;
    }
  }

  /**
   * Bulk register for multiple courses
   */
  async bulkRegister(courseIds, semesterId) {
    try {
      const { data } = await apiClient.post('/registrations/bulk-register', {
        courseIds,
        semesterId
      });
      return data.data;
    } catch (error) {
      console.error('Error bulk registering:', error);
      throw error;
    }
  }
}

export default new RegistrationService();
