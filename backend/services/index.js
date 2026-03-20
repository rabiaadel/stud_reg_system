// ============================================================================
// Service Initialization File
// Ensures all backend services are imported and ready
// This prevents "service not found" errors at runtime
// ============================================================================

const { logger } = require('../config/logger');

/**
 * Initialize all backend services
 * Call this in server.js AFTER database connection
 */
function initializeServices() {
  try {
    logger.info('🔌 Initializing backend services...');

    // Core services (these interact with database)
    const gpaCalculationService = require('./gpaCalculationService');
    const semesterService = require('./semesterService');
    const prerequisiteCheckService = require('./prerequisiteCheckService');
    const notificationService = require('./notificationService');
    const attendanceService = require('./attendanceService');
    const transcriptService = require('./transcriptService');

    // Verify each service has required methods
    const requiredMethods = {
      gpaCalculationService: ['calculateStudentCGPA', 'calculateStudentSemesterGPA', 'getAcademicStanding'],
      semesterService: ['getCurrentSemester', 'openSemester', 'closeSemester', 'isWithinAddDropWindow'],
      prerequisiteCheckService: ['canRegisterForCourse', 'checkPrerequisites', 'validateRegistration'],
      notificationService: ['sendAcademicWarning', 'sendRegistrationAlert'],
      attendanceService: ['recordAttendance', 'getAttendanceReport'],
      transcriptService: ['generateTranscript', 'exportTranscriptPDF']
    };

    for (const [serviceName, methods] of Object.entries(requiredMethods)) {
      const service = eval(serviceName);
      for (const method of methods) {
        if (typeof service[method] !== 'function') {
          logger.warn(`⚠️  Service ${serviceName} missing method: ${method}`);
        }
      }
      logger.info(`✓ ${serviceName} initialized`);
    }

    logger.info('✅ All services initialized successfully');
    return true;
  } catch (err) {
    logger.error('❌ Service initialization failed:', err);
    return false;
  }
}

// Health check for services
function healthCheckServices() {
  try {
    // Verify services are accessible
    const gpaService = require('./gpaCalculationService');
    const semesterService = require('./semesterService');
    
    if (!gpaService || !semesterService) {
      throw new Error('Core services not initialized');
    }

    return true;
  } catch (err) {
    logger.error('❌ Service health check failed:', err);
    return false;
  }
}

module.exports = {
  initializeServices,
  healthCheckServices
};
