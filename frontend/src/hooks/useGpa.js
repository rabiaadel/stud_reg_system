// ============================================================================
// useGpa Hook — Calculate and track student GPA
// Usage: const { cgpa, semesterGPA, passingCredits } = useGpa()
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { gpaCalculator } from '../utils/gpaCalculator';

export const useGpa = (grades = []) => {
  const [gpa, setGpa] = useState({
    semesterGPA: 0,
    cgpa: 0,
    passingCredits: 0,
    distribution: null,
    trend: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Recalculate GPA whenever grades change
   */
  useEffect(() => {
    if (grades && grades.length > 0) {
      try {
        setLoading(true);
        
        // Calculate semester GPA
        const semesterGrades = grades.filter(g => g.status === 'graded');
        const semesterGPA = gpaCalculator.calculateSemesterGPA(semesterGrades);
        
        // Calculate CGPA (all semesters)
        const cgpa = gpaCalculator.calculateCGPA(grades);
        
        // Calculate passing credits
        const passingCredits = gpaCalculator.calculatePassingCredits(grades);
        
        // Calculate grade distribution
        const distribution = gpaCalculator.calculateGradeDistribution(grades);

        setGpa({
          semesterGPA: Math.round(semesterGPA * 100) / 100,
          cgpa: Math.round(cgpa * 100) / 100,
          passingCredits,
          distribution,
          trend: calculateTrend(grades)
        });

        setError(null);
      } catch (err) {
        console.error('Error calculating GPA:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [grades]);

  /**
   * Calculate GPA trend across semesters
   */
  const calculateTrend = (allGrades) => {
    const bysemester = {};
    
    allGrades.forEach(grade => {
      const sem = grade.semesterId;
      if (!bysemester[sem]) {
        bysemester[sem] = [];
      }
      bysemester[sem].push(grade);
    });

    return Object.entries(bysemester).map(([semId, semGrades]) => ({
      semesterId: semId,
      semesterName: semGrades[0]?.semesterName,
      gpa: gpaCalculator.calculateSemesterGPA(semGrades)
    }));
  };

  /**
   * Check if GPA meets a threshold
   */
  const meetsRequirement = useCallback((required = 2.0) => {
    return gpa.cgpa >= required;
  }, [gpa.cgpa]);

  /**
   * Get academic standing status
   */
  const getStandingStatus = useCallback(() => {
    const cgpa = gpa.cgpa;
    if (cgpa >= 3.5) return 'excellent';
    if (cgpa >= 3.0) return 'very_good';
    if (cgpa >= 2.5) return 'good';
    if (cgpa >= 2.0) return 'warning';
    return 'dismissal';
  }, [gpa.cgpa]);

  /**
   * Get GPA color indicator
   */
  const getGpaColor = useCallback(() => {
    const cgpa = gpa.cgpa;
    if (cgpa >= 3.5) return '#27ae60'; // Green
    if (cgpa >= 2.5) return '#3498db'; // Blue
    if (cgpa >= 2.0) return '#f39c12'; // Orange
    if (cgpa >= 1.0) return '#e74c3c'; // Red
    return '#c0392b'; // Dark red
  }, [gpa.cgpa]);

  return {
    ...gpa,
    loading,
    error,
    meetsRequirement,
    getStandingStatus,
    getGpaColor
  };
};

export default useGpa;
