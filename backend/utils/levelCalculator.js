// ============================================================================
// Level Calculator — Map Credit Hours → Academic Level
// Freshman (0-29) → Sophomore (30-59) → Junior (60-89) → Senior (90+)
// ============================================================================

const { BYLAWS, getAcademicLevel } = require('../constants/bylaw');

/**
 * Get academic level info based on completed credits
 * @param {number} completedCredits - Total credits passed
 * @returns {Object} { level, year, name, min, max, nextLevel, creditsToNext }
 */
function getLevelInfo(completedCredits) {
  const levels = BYLAWS.ACADEMIC_LEVELS;
  
  let currentLevel = 'SENIOR';
  let levelData = levels.SENIOR;

  // Find which level student is in
  for (const [level, bounds] of Object.entries(levels)) {
    if (completedCredits >= bounds.min && completedCredits <= bounds.max) {
      currentLevel = level;
      levelData = bounds;
      break;
    }
  }

  // Calculate credits to next level
  const levelOrder = ['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const nextLevelName = currentIndex < levelOrder.length - 1 
    ? levelOrder[currentIndex + 1] 
    : null;
  
  const nextLevelBounds = nextLevelName ? levels[nextLevelName] : null;
  const creditsToNext = nextLevelBounds 
    ? Math.max(0, nextLevelBounds.min - completedCredits)
    : 0;

  return {
    level: currentLevel.toLowerCase(),
    year: levelData.year,
    name: currentLevel.charAt(0) + currentLevel.slice(1).toLowerCase(),
    minCredits: levelData.min,
    maxCredits: levelData.max,
    currentCredits: completedCredits,
    nextLevel: nextLevelName?.toLowerCase() || null,
    creditsToNext,
    percentageComplete: Math.round((completedCredits / BYLAWS.TOTAL_CREDIT_HOURS_REQUIRED) * 100),
    isLastLevel: currentIndex === levelOrder.length - 1
  };
}

/**
 * Check if student can graduate
 * @param {number} completedCredits
 * @param {number} cgpa
 * @returns {Object} { canGraduate, reason }
 */
function canGraduate(completedCredits, cgpa) {
  if (completedCredits < BYLAWS.TOTAL_CREDIT_HOURS_REQUIRED) {
    return {
      canGraduate: false,
      reason: `Need ${BYLAWS.TOTAL_CREDIT_HOURS_REQUIRED - completedCredits} more credit hours`
    };
  }

  if (cgpa < BYLAWS.GRADUATION_CGPA_MINIMUM) {
    return {
      canGraduate: false,
      reason: `CGPA ${cgpa.toFixed(2)} below minimum ${BYLAWS.GRADUATION_CGPA_MINIMUM} required`
    };
  }

  return {
    canGraduate: true,
    reason: 'Eligible for graduation'
  };
}

/**
 * Check if student should be promoted to next level
 * Used during semester transition
 * 
 * @param {number} currentLevelCredits - Credits when level started
 * @param {number} newCompletedCredits - After this semester
 * @returns {boolean}
 */
function shouldPromoteLevel(currentLevelCredits, newCompletedCredits) {
  const currentLevel = getLevelInfo(currentLevelCredits);
  const newLevel = getLevelInfo(newCompletedCredits);
  
  return newLevel.level !== currentLevel.level;
}

/**
 * Get all levels with progress
 * Useful for progress tracking UI
 * 
 * @param {number} completedCredits
 * @returns {Array<Object>} All levels with completion status
 */
function getAllLevelsProgress(completedCredits) {
  const levels = BYLAWS.ACADEMIC_LEVELS;
  const levelOrder = ['FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR'];

  return levelOrder.map(levelName => {
    const bounds = levels[levelName];
    const isCompleted = completedCredits > bounds.max;
    const isCurrent = completedCredits >= bounds.min && completedCredits <= bounds.max;
    const progressInLevel = isCurrent 
      ? Math.round(((completedCredits - bounds.min) / (bounds.max - bounds.min + 1)) * 100)
      : isCompleted ? 100 : 0;

    return {
      level: levelName.toLowerCase(),
      year: bounds.year,
      name: levelName.charAt(0) + levelName.slice(1).toLowerCase(),
      minCredits: bounds.min,
      maxCredits: bounds.max,
      progress: progressInLevel,
      isCompleted,
      isCurrent
    };
  });
}

/**
 * Estimate semester enrollment based on credit threshold
 * Cannot register < 12 or > 18 credits
 * 
 * @param {number} completedCredits
 * @param {number} semesterCreditTarget - e.g., 15
 * @returns {Object} { isFreshman, recommended, min, max, reason }
 */
function getEnrollmentRecommendation(completedCredits, semesterCreditTarget = 15) {
  const levelInfo = getLevelInfo(completedCredits);
  const isFreshman = levelInfo.level === 'freshman';

  let recommendation = {
    isFreshman,
    minCredits: BYLAWS.MIN_CREDIT_HOURS_PER_SEMESTER,
    maxCredits: BYLAWS.MAX_CREDIT_HOURS_PER_SEMESTER,
    recommended: semesterCreditTarget,
    reason: ''
  };

  if (isFreshman) {
    recommendation.reason = 'Freshman: balance course load carefully';
  } else if (levelInfo.creditsToNext <= 6) {
    recommendation.recommended = Math.min(semesterCreditTarget, levelInfo.creditsToNext + 3);
    recommendation.reason = `Close to ${levelInfo.nextLevel} level`;
  } else {
    recommendation.reason = 'Standard enrollment';
  }

  return recommendation;
}

module.exports = {
  getLevelInfo,
  canGraduate,
  shouldPromoteLevel,
  getAllLevelsProgress,
  getEnrollmentRecommendation
};
