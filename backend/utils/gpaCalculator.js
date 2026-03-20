// ============================================================================
// GPA Calculation Engine — Pure math functions
// No database calls, just formulas: Sum(CH × GP) / TotalCH
// Used by services, validated by tests
// ============================================================================

/**
 * Calculate semester GPA
 * GPA = Sum(Credit Hours × Grade Points) / Total Credit Hours
 * 
 * @param {Array<Object>} grades - [{ creditHours, gradePoint }, ...]
 * @returns {number} Semester GPA (0.0 - 4.0)
 */
function calculateSemesterGPA(grades) {
  if (!grades || grades.length === 0) return 0.0;

  // Filter out non-passing grades or incomplete ('I', 'W')
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
  return Math.round(gpa * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate cumulative GPA (all semesters)
 * CGPA = Sum(All Credits × All Grade Points) / Total Credits Taken
 * 
 * @param {Array<Object>} allGrades - All grades from all semesters
 * @returns {number} Cumulative GPA (0.0 - 4.0)
 */
function calculateCGPA(allGrades) {
  if (!allGrades || allGrades.length === 0) return 0.0;

  // Only count grades that contribute to CGPA
  // Exclude: incomplete (I), withdrawn (W), null grades
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
  return Math.round(cgpa * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate grade distribution (for statistics)
 * @param {Array<Object>} grades
 * @returns {Object} { A_count, B_count, C_count, D_count, F_count }
 */
function calculateGradeDistribution(grades) {
  const distribution = {
    A_plus: 0, A: 0, A_minus: 0,
    B_plus: 0, B: 0, B_minus: 0,
    C_plus: 0, C: 0, C_minus: 0,
    D_plus: 0, D: 0,
    F: 0,
    I: 0, W: 0
  };

  grades.forEach(g => {
    const letter = g.letter?.replace('+', '_plus')?.replace('-', '_minus') || g.letter;
    if (distribution.hasOwnProperty(letter)) {
      distribution[letter]++;
    }
  });

  return distribution;
}

/**
 * Calculate credits towards degree completion
 * Counts only passed courses (D or better)
 * 
 * @param {Array<Object>} grades - All grades
 * @returns {number} Total passing credit hours
 */
function calculatePassingCredits(grades) {
  return grades.reduce((total, g) => {
    const isPassing = g.gradePoint !== null && g.gradePoint > 0;
    return isPassing ? total + g.creditHours : total;
  }, 0);
}

/**
 * Check if GPA meets requirement for next level/graduation
 * @param {number} gpa
 * @param {number} requiredGPA
 * @returns {boolean}
 */
function meetsGPARequirement(gpa, requiredGPA = 2.0) {
  return gpa >= requiredGPA;
}

/**
 * Calculate weighted average for coursework
 * (Assignments + Midterm + Final) weighted by bylaw percentages
 * 
 * @param {number} coursework - 0-40
 * @param {number} midterm - 0-20
 * @param {number} final - 0-40
 * @returns {number} 0-100 percentage
 */
function calculateCourseWorkAverage(coursework, midterm, final) {
  // Normalize to 0-100
  const cw = (coursework / 40) * 100;
  const mt = (midterm / 20) * 100;
  const fn = (final / 40) * 100;
  
  // Apply bylaw weights: 40/40, 20/60, 40/100
  const weighted = (cw * 0.4) + (mt * 0.2) + (fn * 0.4);
  return Math.round(weighted * 100) / 100;
}

/**
 * Calculate impact of repeating a course
 * If method is 'replace': new grade replaces old
 * If method is 'average': both grades factor into CGPA
 * 
 * @param {number} oldGradePoint
 * @param {number} newGradePoint
 * @param {string} method - 'replace' or 'average'
 * @returns {number} Grade point to use in CGPA
 */
function calculateRepeatedCourseGrade(oldGradePoint, newGradePoint, method = 'replace') {
  if (method === 'replace') {
    return newGradePoint; // Only new grade counts
  } else if (method === 'average') {
    return (oldGradePoint + newGradePoint) / 2; // Both count
  }
  return newGradePoint;
}

module.exports = {
  calculateSemesterGPA,
  calculateCGPA,
  calculateGradeDistribution,
  calculatePassingCredits,
  meetsGPARequirement,
  calculateCourseWorkAverage,
  calculateRepeatedCourseGrade
};
