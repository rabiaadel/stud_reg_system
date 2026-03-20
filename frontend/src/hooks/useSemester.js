// ============================================================================
// useSemester Hook — Track current semester and registration windows
// Usage: const { currentSemester, isRegistrationOpen, daysRemaining } = useSemester()
// ============================================================================

import { useState, useCallback, useEffect } from 'react';

export const useSemester = () => {
  const [semester, setSemester] = useState(null);
  const [windows, setWindows] = useState({
    registrationOpen: false,
    addDropOpen: false,
    withdrawalOpen: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch current semester info from API
   */
  const fetchCurrentSemester = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/semesters/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch semester');

      const data = await response.json();
      if (data.success) {
        setSemester(data.data);
        updateWindows(data.data);
      }
    } catch (err) {
      console.error('Error fetching semester:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update window status based on semester dates
   */
  const updateWindows = useCallback((semesterData) => {
    if (!semesterData) return;

    const now = new Date();
    const registrationDeadline = new Date(semesterData.add_drop_deadline);
    const withdrawalDeadline = new Date(semesterData.withdrawal_deadline);

    setWindows({
      registrationOpen: now <= registrationDeadline,
      addDropOpen: now <= registrationDeadline,
      withdrawalOpen: now <= withdrawalDeadline
    });
  }, []);

  /**
   * Check if within a specific window
   */
  const isWithinWindow = useCallback((windowType) => {
    return windows[`${windowType}Open`] || false;
  }, [windows]);

  /**
   * Get days remaining for a deadline
   */
  const getDaysRemaining = useCallback((deadline) => {
    if (!deadline) return 0;
    const now = new Date();
    const dead = new Date(deadline);
    const daysMs = dead - now;
    return Math.ceil(daysMs / (1000 * 60 * 60 * 24));
  }, []);

  /**
   * Check if can register for courses
   */
  const canRegister = useCallback(() => {
    return windows.registrationOpen && semester?.status === 'active';
  }, [windows, semester]);

  /**
   * Check if can add/drop courses  
   */
  const canAddDrop = useCallback(() => {
    return windows.addDropOpen && semester?.status === 'active';
  }, [windows, semester]);

  /**
   * Check if can withdraw from courses
   */
  const canWithdraw = useCallback(() => {
    return windows.withdrawalOpen && semester?.status === 'active';
  }, [windows, semester]);

  /**
   * Get human-readable window status
   */
  const getWindowStatus = useCallback(() => {
    if (!semester) return 'No active semester';
    
    if (windows.withdrawalOpen && !windows.addDropOpen) {
      return `Withdrawal period (${getDaysRemaining(semester.withdrawal_deadline)} days left)`;
    }
    if (windows.addDropOpen) {
      return `Add/Drop period (${getDaysRemaining(semester.add_drop_deadline)} days left)`;
    }
    return 'Registration closed';
  }, [semester, windows, getDaysRemaining]);

  // Fetch on mount
  useEffect(() => {
    fetchCurrentSemester();
  }, [fetchCurrentSemester]);

  return {
    // State
    semester,
    windows,
    loading,
    error,

    // Shortcuts
    currentSemesterId: semester?.id,
    semesterName: semester?.name,
    semesterCode: semester?.code,
    semesterStatus: semester?.status,

    // Window checks
    isRegistrationOpen: windows.registrationOpen,
    isAddDropOpen: windows.addDropOpen,
    isWithdrawalOpen: windows.withdrawalOpen,
    isWithinWindow,

    // Deadline info
    getDaysRemaining,
    registrationDeadline: semester?.add_drop_deadline,
    withdrawalDeadline: semester?.withdrawal_deadline,

    // Permission checks
    canRegister,
    canAddDrop,
    canWithdraw,
    getWindowStatus,

    // Refresh
    refetch: fetchCurrentSemester
  };
};

export default useSemester;
