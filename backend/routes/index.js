const express = require('express');
const router = express.Router();

// Import route modules
const studentRoutes = require('./studentRoutes');
const courseRoutes = require('./courseRoutes');
const registrationRoutes = require('./registrationRoutes');
const gradeRoutes = require('./gradeRoutes');
const academicRulesRoutes = require('./academicRulesRoutes');
const semesterRoutes = require('./semesterRoutes');
const adminRoutes = require('./adminRoutes');
const instructorRoutes = require('./instructorRoutes');
const adminManagementRoutes = require('./adminManagementRoutes');
const authRoutes = require('./authRoutes');
const publicRoutes = require('./publicRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/students', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/registrations', registrationRoutes);
router.use('/grades', gradeRoutes);
router.use('/academic-rules', academicRulesRoutes);
router.use('/semesters', semesterRoutes);
router.use('/admin', adminRoutes);
router.use('/instructors', instructorRoutes);
router.use('/admin/manage', adminManagementRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Student Registration System API',
    version: '1.0.0',
    endpoints: {
      students: '/api/v1/students',
      courses: '/api/v1/courses',
      registrations: '/api/v1/registrations',
      grades: '/api/v1/grades',
      academicRules: '/api/v1/academic-rules',
      semesters: '/api/v1/semesters',
      admin: '/api/v1/admin',
      instructors: '/api/v1/instructors',
      adminManagement: '/api/v1/admin/manage',
    },
    documentation: '/api/docs',
  });
});

module.exports = router;
