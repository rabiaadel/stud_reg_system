// ============================================================================
// Grade Scale — Complete mapping across all grading systems
// A+ (4.0) → F (0.0) with percentage bands and descriptors
// ============================================================================

const GRADE_SCALE = {
  // Format: { letter, gp (grade point), percentage_min, percentage_max, description }
  
  'A+': { letter: 'A+', gp: 4.0, min: 95, max: 100, description: 'Excellent', color: '#27ae60' },
  'A':  { letter: 'A',  gp: 4.0, min: 90, max: 94,  description: 'Excellent', color: '#27ae60' },
  'A-': { letter: 'A-', gp: 3.7, min: 87, max: 89,  description: 'Excellent', color: '#27ae60' },
  
  'B+': { letter: 'B+', gp: 3.3, min: 84, max: 86,  description: 'Very Good', color: '#3498db' },
  'B':  { letter: 'B',  gp: 3.0, min: 80, max: 83,  description: 'Very Good', color: '#3498db' },
  'B-': { letter: 'B-', gp: 2.7, min: 77, max: 79,  description: 'Good', color: '#3498db' },
  
  'C+': { letter: 'C+', gp: 2.3, min: 74, max: 76,  description: 'Good', color: '#f39c12' },
  'C':  { letter: 'C',  gp: 2.0, min: 70, max: 73,  description: 'Satisfactory', color: '#f39c12' },
  'C-': { letter: 'C-', gp: 1.7, min: 67, max: 69,  description: 'Satisfactory', color: '#f39c12' },
  
  'D+': { letter: 'D+', gp: 1.3, min: 64, max: 66,  description: 'Passing', color: '#e74c3c' },
  'D':  { letter: 'D',  gp: 1.0, min: 60, max: 63,  description: 'Passing', color: '#e74c3c' },
  
  'F':  { letter: 'F',  gp: 0.0, min: 0,  max: 59,  description: 'Failing', color: '#c0392b' },
  
  'I':  { letter: 'I',  gp: 0.0, min: null, max: null, description: 'Incomplete', color: '#95a5a6' },
  'W':  { letter: 'W',  gp: null, min: null, max: null, description: 'Withdrawn', color: '#95a5a6' }
};

/**
 * Array of grades sorted by grade point (descending)
 * Useful for ranking, filtering
 */
const GRADES_ORDERED = [
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D+', 'D', 'F'
];

/**
 * Map percentage → letter grade
 * @param {number} percentage - 0-100
 * @returns {string} letter grade or null
 */
function percentageToGrade(percentage) {
  for (const [letter, info] of Object.entries(GRADE_SCALE)) {
    if (info.min !== null && info.max !== null) {
      if (percentage >= info.min && percentage <= info.max) {
        return letter;
      }
    }
  }
  return null;
}

/**
 * Map letter grade → grade point
 * @param {string} letter - 'A+', 'B', 'F', etc.
 * @returns {number} grade point
 */
function gradeToPoint(letter) {
  return GRADE_SCALE[letter]?.gp ?? 0;
}

/**
 * Check if grade is passing (gp >= 1.0)
 * @param {string} letter
 * @returns {boolean}
 */
function isPassing(letter) {
  const gp = gradeToPoint(letter);
  return gp > 0 && gp >= 1.0;
}

module.exports = {
  GRADE_SCALE,
  GRADES_ORDERED,
  percentageToGrade,
  gradeToPoint,
  isPassing
};
