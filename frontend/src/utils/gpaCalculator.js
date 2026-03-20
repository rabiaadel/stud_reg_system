// ============================================================================
// GPA Calculator Utility — Client-side GPA preview
// Same formulas as backend for instant feedback
// ============================================================================

/**
 * Calculate semester GPA on client
 * @param {Array} grades - [{ creditHours, gradePoint }, ...]
 * @returns {number} GPA 0.0 - 4.0
 */
export function calculateSemesterGPA(grades) {
  if (!grades || grades.length === 0) return 0.0;

  const gradedCourses = grades.filter(g => 
    g.gradePoint !== null && 
    g.gradePoint !== undefined && 
    g.creditHours > 0
  );

  if (gradedCourses.length === 0) return 0.0;

  const totalQualityPoints = gradedCourses.reduce((sum, g) => {
    return sum + (g.creditHours * g.gradePoint);
  }, 0);

  const totalCredits = gradedCourses.reduce((sum, g) => {
    return sum + g.creditHours;
  }, 0);

  const gpa = totalQualityPoints / totalCredits;
  return Math.round(gpa * 100) / 100;
}

/**
 * Calculate cumulative GPA (all semesters)
 */
export function calculateCGPA(allGrades) {
  if (!allGrades || allGrades.length === 0) return 0.0;

  const validGrades = allGrades.filter(g => 
    g.gradePoint !== null && 
    g.gradePoint !== undefined && 
    g.creditHours > 0
  );

  if (validGrades.length === 0) return 0.0;

  const totalQualityPoints = validGrades.reduce((sum, g) => {
    return sum + (g.creditHours * g.gradePoint);
  }, 0);

  const totalCredits = validGrades.reduce((sum, g) => {
    return sum + g.creditHours;
  }, 0);

  const cgpa = totalQualityPoints / totalCredits;
  return Math.round(cgpa * 100) / 100;
}

/**
 * Calculate grade distribution
 */
export function calculateGradeDistribution(grades) {
  const dist = {
    A_plus: 0, A: 0, A_minus: 0,
    B_plus: 0, B: 0, B_minus: 0,
    C_plus: 0, C: 0, C_minus: 0,
    D_plus: 0, D: 0,
    F: 0, I: 0, W: 0
  };

  grades.forEach(g => {
    const letter = g.letter?.replace('+', '_plus')?.replace('-', '_minus');
    if (dist.hasOwnProperty(letter)) dist[letter]++;
  });

  return dist;
}

/**
 * Calculate passing credits (D or better)
 */
export function calculatePassingCredits(grades) {
  return grades.reduce((total, g) => {
    const isPassing = g.gradePoint !== null && g.gradePoint >= 1.0;
    return isPassing ? total + g.creditHours : total;
  }, 0);
}

/**
 * Check academic standing
 */
export function getAcademicStanding(cgpa) {
  if (cgpa >= 3.5) return { status: 'excellent', color: '#27ae60', message: 'Excellent' };
  if (cgpa >= 3.0) return { status: 'very_good', color: '#3498db', message: 'Very Good' };
  if (cgpa >= 2.5) return { status: 'good', color: '#3498db', message: 'Good' };
  if (cgpa >= 2.0) return { status: 'warning', color: '#f39c12', message: 'Warning' };
  return { status: 'dismissal', color: '#e74c3c', message: 'At Risk' };
}

export const gpaCalculator = {
  calculateSemesterGPA,
  calculateCGPA,
  calculateGradeDistribution,
  calculatePassingCredits,
  getAcademicStanding
};

export default gpaCalculator;
