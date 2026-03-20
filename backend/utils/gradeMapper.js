// ============================================================================
// Grade Mapper — Conversion Layer
// Percentage ↔ Letter Grade ↔ Grade Points
// ============================================================================

const { GRADE_SCALE, percentageToGrade, gradeToPoint, isPassing } = require('../constants/gradeScale');
const { BYLAWS } = require('../constants/bylaw');

/**
 * Map percentage score to complete grade info
 * @param {number} percentage - 0-100
 * @returns {Object|null} { letter, gp, description, color } or null if invalid
 */
function mapPercentageToGrade(percentage) {
  if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
    return null;
  }
  
  const letter = percentageToGrade(percentage);
  if (!letter) return null;
  
  return {
    letter,
    gradePoint: gradeToPoint(letter),
    percentage,
    ...GRADE_SCALE[letter]
  };
}

/**
 * Map raw marks to percentage based on bylaw composition
 * (Coursework: 0-40, Midterm: 0-20, Final: 0-40)
 * 
 * @param {Object} marks - { coursework, midterm, final }
 * @returns {number} 0-100 percentage
 */
function mapMarksToPercentage(marks) {
  const { coursework = 0, midterm = 0, final = 0 } = marks;
  
  // Validate ranges
  if (coursework < 0 || coursework > 40) throw new Error('Coursework must be 0-40');
  if (midterm < 0 || midterm > 20) throw new Error('Midterm must be 0-20');
  if (final < 0 || final > 40) throw new Error('Final must be 0-40');
  
  // Sum out of 100
  const total = coursework + midterm + final;
  return total; // Already 0-100 due to max limits
}

/**
 * Check if student has passed the course
 * @param {number} percentage - 0-100
 * @returns {boolean}
 */
function isPassingPercentage(percentage) {
  const grade = percentageToGrade(percentage);
  return grade ? isPassing(grade) : false;
}

/**
 * Get grade range for a letter
 * @param {string} letter - 'A+', 'B', 'F', etc.
 * @returns {Object|null} { min, max } or null
 */
function getGradeRange(letter) {
  const gradeInfo = GRADE_SCALE[letter];
  if (!gradeInfo) return null;
  return {
    min: gradeInfo.min,
    max: gradeInfo.max,
    letter: gradeInfo.letter
  };
}

/**
 * Validate and get complete grade object
 * @param {string} letter - e.g., 'A+', 'B-', 'F'
 * @returns {Object|null} Complete grade info or null
 */
function getGradeInfo(letter) {
  return GRADE_SCALE[letter] || null;
}

/**
 * Suggest next action based on grades
 * @param {number} percentage
 * @returns {string} Suggestion message
 */
function suggestGradeAction(percentage) {
  if (percentage >= 95) return 'Excellent performance!';
  if (percentage >= 90) return 'Great work!';
  if (percentage >= 80) return 'Good performance';
  if (percentage >= 70) return 'Satisfactory';
  if (percentage >= 60) return 'Passing grade';
  return 'Below passing, please seek help';
}

/**
 * Get color indicator for grade
 * @param {number} percentage
 * @returns {string} Hex color code
 */
function getGradeColor(percentage) {
  const gradeInfo = mapPercentageToGrade(percentage);
  return gradeInfo?.color || '#95a5a6';
}

/**
 * Calculate GPA from percentage
 * Shortcut: percentage → letter → grade point
 * @param {number} percentage
 * @returns {number} Grade point (0-4.0)
 */
function percentageToGradePoint(percentage) {
  const letter = percentageToGrade(percentage);
  return letter ? gradeToPoint(letter) : 0.0;
}

module.exports = {
  mapPercentageToGrade,
  mapMarksToPercentage,
  isPassingPercentage,
  getGradeRange,
  getGradeInfo,
  suggestGradeAction,
  getGradeColor,
  percentageToGradePoint,
  // Re-export from constants for convenience
  isPassing,
  GRADE_SCALE
};
