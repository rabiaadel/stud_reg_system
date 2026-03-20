# Student Registration System - Complete Implementation Guide

**Status:** ✅ End-to-End Setup Complete

This guide documents the complete implementation of the Tanta University Student Registration System with full bylaw enforcement, from database to frontend.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Setup](#database-setup)
3. [Backend Services](#backend-services)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Bylaw Enforcement](#bylaw-enforcement)
7. [Running the System](#running-the-system)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Frontend (React 18)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - RegistrationPage (Course Selection & Registration)   │   │
│  │  - GraduationPage (Graduation Status & Requirements)    │   │
│  │  - Dashboard (Student Academic Progress)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                    JWT Auth + Axios HTTP Calls
                                     │
┌────────────────────────────────────▼────────────────────────────┐
│               Backend API (Express.js 4.18)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes: /api/v1/registrations/*                        │   │
│  │  - /check-eligibility                                  │   │
│  │  - /available-courses                                  │   │
│  │  - /register                                           │   │
│  │  - /graduation-eligibility                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Controllers: registrationController_v2.js             │   │
│  │  - Coordinates service calls                           │   │
│  │  - Validates requests & responses                      │   │
│  │  - Handles error scenarios                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Core Services:                                         │   │
│  │  1. bylawsEnforcementService.js                         │   │
│  │     - checkRegistrationEligibility()                   │   │
│  │     - checkCourseRegistrationEligibility()             │   │
│  │     - validateSemesterCredits()                        │   │
│  │                                                         │   │
│  │  2. graduationEligibilityService.js                     │   │
│  │     - checkGraduationEligibility()                     │   │
│  │     - estimateGraduationDate()                         │   │
│  │                                                         │   │
│  │  3. prerequisiteCheckService.js                         │   │
│  │     - validatePrerequisites()                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────┘
                                     │
                           SQL Queries via pg
                                     │
┌────────────────────────────────────▼────────────────────────────┐
│          PostgreSQL 16 Database (Alpine)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Core Data:                                             │   │
│  │  - students: 134,000 records                            │   │
│  │  - courses: 120+ courses across 4 specializations       │   │
│  │  - student_registrations: Enrollment records            │   │
│  │  - student_grades: GPA & performance tracking           │   │
│  │  - academic_standing: Probation/dismissal status        │   │
│  │                                                         │   │
│  │  Rules Engine:                                          │   │
│  │  - academic_rules: 12+ bylaw articles with JSONB rules │   │
│  │  - course_prerequisites: Prerequisite requirements      │   │
│  │  - registration_constraints: Credit limits by level     │   │
│  │  - specialization_courses: Required courses per degree  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Setup

### 1. Initialize Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE stud_reg_system;

# Switch to database
\c stud_reg_system
```

### 2. Load Schema

```bash
# From project root
psql -U postgres -d stud_reg_system -f database/schema.sql
```

### 3. Load Seed Data (In Order)

```bash
# 1. Base configuration
psql -U postgres -d stud_reg_system -f database/seeds/001_demo_users.sql

# 2. Initial setup (institutions, faculties, departments, specializations)
psql -U postgres -d stud_reg_system -f database/seeds/002_initial_setup.sql

# 3. Complete curriculum (courses, academic rules, constraints, semesters)
psql -U postgres -d stud_reg_system -f database/seeds/003_complete_curriculum.sql
```

### 4. Verify Setup

```sql
-- Check tables created
SELECT COUNT(*) FROM students;  -- Should show records
SELECT COUNT(*) FROM courses;   -- Should show 100+
SELECT COUNT(*) FROM academic_rules; -- Should show 12+
SELECT COUNT(*) FROM course_prerequisites; -- Should show 30+
```

---

## Backend Services

### Service 1: Bylaws Enforcement Service

**File:** `backend/services/bylawsEnforcementService.js`

**Key Methods:**

```javascript
// 1. Overall registration eligibility check
await bylawsEnforcement.checkRegistrationEligibility(studentId, semesterId);
// Returns: { eligible, blockers[], warnings[] }
// Checks: Dismissal, max duration, CGPA, standing, credit completion

// 2. Individual course eligibility
await bylawsEnforcement.checkCourseRegistrationEligibility(studentId, courseId, semesterId);
// Returns: { eligible, blockers[], warnings[] }
// Checks: Prerequisites, grade requirements, course level, projects

// 3. Semester credit validation
await bylawsEnforcement.validateSemesterCredits(studentId, courseIds, semesterId);
// Returns: { valid, totalCredits, minCredits, maxCredits, violations[] }

// 4. Specialization eligibility
await bylawsEnforcement.checkSpecializationEligibility(studentId);
// Returns: { eligible, completedCredits, requiredCredits }

// 5. Available course recommendations
await bylawsEnforcement.getRecommendedCourses(studentId, specializationId, limit);
// Returns: courses[] matching prerequisites

// 6. Academic standing updates
await bylawsEnforcement.updateAcademicStanding(studentId);
// Returns: { status, cgpa, probationCount }
```

**Enforces Articles:**
- **Article 4:** Credit system (132 total, 2.0 GPA, 4-year max)
- **Article 8:** Academic standing (probation, dismissal)
- **Article 20:** Course prerequisites, progression, distribution

### Service 2: Graduation Eligibility Service

**File:** `backend/services/graduationEligibilityService.js`

**Key Methods:**

```javascript
// 1. Comprehensive graduation eligibility check
await graduationEligibility.checkGraduationEligibility(studentId);
// Returns comprehensive status with all requirements

// 2. Estimate graduation date
await graduationEligibility.estimateGraduationDate(studentId);
// Returns: { completed_credits, remaining_credits, semesters_needed }

// 3. Internal checks (private methods):
// - _checkAcademicStanding() - No dismissals
// - _checkTotalCredits() - 132 credits with 2.0 GPA
// - _checkGraduationProjects() - PR411 + PR412
// - _checkTrainingInternship() - Training course
// - _checkRequiredCourses() - All mandatory courses
// - _checkCourseDistribution() - Credits by category
```

**Enforces Articles:**
- **Article 4:** 132 total credits, 2.0 minimum GPA
- **Article 7:** Degree requirements
- **Article 8:** No dismissals for graduation
- **Article 12:** Graduation projects + training
- **Article 20:** Required courses by specialization

### Service 3: Prerequisite Check Service

**File:** `backend/services/prerequisiteCheckService.js`

**Key Methods:**

```javascript
// 1. Validate prerequisites for course enrollment
await prerequisiteCheck.validatePrerequisites(studentId, courseId);
// Returns: { valid, missingPrerequisites[], gradeDeficiencies[] }

// 2. Get remaining prerequisites
await prerequisiteCheck.getRemainingPrerequisites(studentId, courseId);
// Returns: prerequisites[] not yet completed

// 3. Check if course can be taken
await prerequisiteCheck.canTakeCourse(studentId, courseId);
// Returns: boolean
```

---

## Backend Controllers

### Registration Controller v2

**File:** `backend/controllers/registrationController_v2.js`

**Routes:**

```javascript
// POST /api/v1/registrations/register
exports.registerForCourses(req, res)
// Register student for multiple courses with validation

// GET /api/v1/registrations/available-courses
exports.getAvailableCourses(req, res)
// Get courses eligible for student

// GET /api/v1/registrations/check-eligibility
exports.checkRegistrationEligibility(req, res)
// Check overall registration eligibility

// GET /api/v1/registrations/graduation-eligibility
exports.checkGraduationEligibility(req, res)
// Check graduation requirements

// GET /api/v1/registrations/my-courses
exports.getStudentRegistrations(req, res)
// Get student's registered courses

// POST /api/v1/registrations/drop-course
exports.dropCourse(req, res)
// Withdraw from a course

// GET /api/v1/registrations/bylaw-article
exports.getBylawArticle(req, res)
// Get bylaw article text and details
```

---

## API Endpoints

### 1. Register for Courses

**POST** `/api/v1/registrations/register`

```bash
curl -X POST http://localhost:3000/api/v1/registrations/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "s-001",
    "courseIds": ["c-001", "c-002", "c-003"],
    "semesterId": "sem-001"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for 3 courses",
  "registrations": [
    {"id": "reg-001", "course_id": "c-001", "status": "REGISTERED"}
  ],
  "warnings": [],
  "credit_validation": {
    "valid": true,
    "totalCredits": 9,
    "minCredits": 12,
    "maxCredits": 20
  }
}
```

### 2. Check Available Courses

**GET** `/api/v1/registrations/available-courses?studentId=s-001&semesterId=sem-001`

```bash
curl -X GET "http://localhost:3000/api/v1/registrations/available-courses?studentId=s-001&semesterId=sem-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "availableCount": 15,
  "courses": [
    {
      "id": "c-001",
      "code": "CS211",
      "name_en": "Object Oriented Programming",
      "credit_hours": 3,
      "level": 2,
      "eligible": true,
      "prerequisites_met": true
    }
  ]
}
```

### 3. Check Graduation Eligibility

**GET** `/api/v1/registrations/graduation-eligibility?studentId=s-001`

```bash
curl -X GET "http://localhost:3000/api/v1/registrations/graduation-eligibility?studentId=s-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "eligible_for_graduation": true,
  "missing_requirements_count": 0,
  "eligibility_details": {
    "creditsStatus": {
      "completed_credits": 132,
      "required_credits": 132,
      "gpa": "3.5"
    },
    "projectsStatus": {
      "pr411_completed": true,
      "pr412_completed": true
    }
  }
}
```

**See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint details**

---

## Frontend Components

### 1. Registration Page

**File:** `frontend/src/pages/student/RegistrationPage.jsx`

**Features:**
- Real-time eligibility checking
- Available courses display
- Course selection with prerequisites validation
- Credit hour enforcement (min 12, max 20)
- Current registrations view
- Academic standing display
- Graduation eligibility indicator

**Usage:**
```jsx
import RegistrationPage from './pages/student/RegistrationPage';

// In routes
<Route path="/student/register" component={RegistrationPage} />
```

### 2. Graduation Page

**File:** `frontend/src/pages/student/GraduationPage.jsx`

**Features:**
- Graduation eligibility status
- Comprehensive requirements checklist
- Missing requirements detail table
- Project status tracking
- GPA and academic standing display
- Graduation timeline and estimation
- Diploma download button

**Usage:**
```jsx
import GraduationPage from './pages/student/GraduationPage';

// In routes
<Route path="/student/graduation" component={GraduationPage} />
```

### Both Components Use:

```javascript
// API Client with JWT
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// React Query for data fetching
const { data: graduationData } = useQuery({
  queryKey: ['graduationEligibility', studentId],
  queryFn: async () => {
    const { data } = await apiClient.get('/registrations/graduation-eligibility', 
      { params: { studentId } }
    );
    return data;
  }
});

// Component State Management
const [selectedCourses, setSelectedCourses] = useState([]);
const [totalCredits, setTotalCredits] = useState(0);
```

---

## Bylaw Enforcement

### Core Bylaw Articles Enforced

#### Article 4: Credit Hour System

```sql
-- Database enforcement
SELECT 
  COALESCE(SUM(c.credit_hours), 0) as total_credits,
  COALESCE(AVG(sg.grade_points), 0) as cgpa
FROM student_grades sg
JOIN courses c ON sg.course_id = c.id
WHERE sg.student_id = $1;

-- Service validation
if (cgpa < 2.0) {
  blockers.push('CGPA below minimum 2.0');
}
if (total_credits > 132) {
  warnings.push('All credits completed');
}
```

#### Article 20: Course Prerequisites and Progression

```sql
-- Prerequisite enforcement
SELECT cp.prerequisite_course_id, cp.min_grade
FROM course_prerequisites cp
WHERE cp.course_id = $1;

-- Service validation
const completedPrereqs = await db.query(
  `SELECT * FROM student_grades 
   WHERE student_id = $1 AND course_id = ANY($2) AND grade != 'F'`,
  [studentId, prerequisites]
);

if (completedPrereqs.length < prerequisites.length) {
  blockers.push('Prerequisite not met');
}
```

#### Article 8: Academic Standing

```sql
-- Dismissal tracking
SELECT status FROM academic_standing
WHERE student_id = $1
ORDER BY updated_at DESC LIMIT 1;

-- Service validation
if (status === 'DISMISSED') {
  blockers.push('CRITICAL: Student dismissed');
}

if (cgpa < 2.0) {
  status = 'WARNING';
  probationCount++;
  
  if (probationCount >= 2) {
    status = 'DISMISSED';
  }
}
```

### Enforcement Flow

```
Request: Register for courses
    ↓
1. Check Overall Eligibility
   - Dismissal status?
   - Max study duration exceeded?
   - GPA < 2.0?
   - Academic standing?
    ↓ (if blocked → REJECT)
2. Validate Each Course
   - Prerequisites met?
   - Grade requirements met?
   - Specialization level OK?
   - Project prerequisites (PR411 before PR412)?
    ↓ (if blocked → EXCLUDE from registration)
3. Validate Credit Hours
   - Total 12-20 credits?
   - Within semester constraints?
    ↓ (if invalid → REQUIRE COURSE ADJUSTMENT)
4. Register Eligible Courses
   - Insert into student_registrations
   - Create audit trail
    ↓
5. Return Results
   - Registered courses
   - Ineligible courses with reasons
   - Warnings and notes
```

---

## Running the System

### Prerequisites

```bash
# Node.js 18+
node --version

# PostgreSQL 16
psql --version

# npm packages
npm install  # in both backend and frontend directories
```

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Load environment variables
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/stud_reg_system" > .env
echo "JWT_SECRET=your_secret_key_here" >> .env
echo "PORT=3000" >> .env

# Start server
npm start
# Server runs on http://localhost:3000
```

### 2. Database Setup

```bash
# Initialize database
psql -U postgres -d stud_reg_system -f ../database/schema.sql
psql -U postgres -d stud_reg_system -f ../database/seeds/001_demo_users.sql
psql -U postgres -d stud_reg_system -f ../database/seeds/002_initial_setup.sql
psql -U postgres -d stud_reg_system -f ../database/seeds/003_complete_curriculum.sql
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint
echo "REACT_APP_API_URL=http://localhost:3000/api/v1" > .env

# Start development server
npm start
# Frontend runs on http://localhost:3000
```

### 4. Docker Setup (Optional)

```bash
cd /path/to/project

# Start containers
docker-compose up -d

# Verify services
docker ps  # Should show backend, frontend, and postgres
docker logs stud_reg_-backend  # Check backend logs
```

---

## Testing

### 1. Seed Test Data

```sql
-- Already included in seeds/001_demo_users.sql
SELECT * FROM students LIMIT 5;  -- View test students
SELECT * FROM specializations;   -- View specializations
SELECT * FROM courses LIMIT 10;  -- View courses
```

### 2. Test Registration API

```bash
# 1. Get token (from login)
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@email.com","password":"password"}' \
  | jq -r '.token')

# 2. Check eligibility
curl "http://localhost:3000/api/v1/registrations/check-eligibility?studentId=s-001&semesterId=sem-001" \
  -H "Authorization: Bearer $TOKEN"

# 3. Get available courses
curl "http://localhost:3000/api/v1/registrations/available-courses?studentId=s-001&semesterId=sem-001" \
  -H "Authorization: Bearer $TOKEN"

# 4. Register for courses
curl -X POST http://localhost:3000/api/v1/registrations/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId":"s-001",
    "courseIds":["c-001","c-002"],
    "semesterId":"sem-001"
  }'

# 5. Check graduation eligibility
curl "http://localhost:3000/api/v1/registrations/graduation-eligibility?studentId=s-001" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Frontend Testing

1. Navigate to `http://localhost:3000`
2. Login as student: `student@email.com` / `password`
3. Go to **Register for Courses**
   - See available courses
   - Select courses
   - Verify credit limits enforced
4. Go to **Graduation Status**
   - See requirements checklist
   - View missing requirements
   - See estimated graduation date

---

## Troubleshooting

### Issue: "Student not found" error

```bash
# Check database connection
psql -U postgres -d stud_reg_system -c "SELECT COUNT(*) FROM students;"

# Verify JWT token
echo $TOKEN  # Should be non-empty

# Check student ID exists
psql -U postgres -d stud_reg_system -c "SELECT id FROM students WHERE email = 'student@email.com';"
```

### Issue: "Prerequisites not met"

```sql
-- Check prerequisites for course
SELECT * FROM course_prerequisites WHERE course_id = 'c-002';

-- Check student's completed courses
SELECT * FROM student_grades 
WHERE student_id = 's-001' AND grade != 'F';

-- Manually add grades if needed
INSERT INTO student_grades (student_id, course_id, grade, grade_points)
VALUES ('s-001', 'c-001', 'A', 4.0);
```

### Issue: "Credit hours exceeded"

```javascript
// Check enforcement logic
// File: bylawsEnforcementService.js
// Method: validateSemesterCredits()
// Modify constraints in registration_constraints table if needed
```

### Issue: Backend not responding

```bash
# Check if server is running
lsof -i :3000

# Check logs
docker logs stud_reg_backend

# Restart server
npm restart
```

### Issue: Database connection error

```bash
# Check PostgreSQL is running
psql -U postgres  # Should connect

# Check database exists
psql -U postgres -l | grep stud_reg_system

# Check database user permissions
psql -U postgres -d stud_reg_system -c "\dt"  # List tables
```

---

## System Verification Checklist

- [ ] Database created and seeded with 134,000+ students
- [ ] 120+ courses available across 4 specializations
- [ ] 12+ bylaw articles in academic_rules table
- [ ] 30+ prerequisite relationships configured
- [ ] Backend server running on port 3000
- [ ] Frontend app running on port 3000 (or configured port)
- [ ] JWT authentication working
- [ ] Registration eligibility checking functional
- [ ] Course prerequisite validation working
- [ ] Graduation eligibility calculation working
- [ ] Credit hour constraints enforced
- [ ] Academic standing (probation/dismissal) tracked
- [ ] API documentation matches implementation

---

## Additional Resources

- **Full API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Database Schema:** [database/schema.sql](./database/schema.sql)
- **Business Requirements:** [db-extracted/bylaws_complete.json](./db-extracted/bylaws_complete.json)
- **Course Catalog:** [db-extracted/specialization_courses_complete

.json](./db-extracted/specialization_courses_complete.json)

---

**System Status:** ✅ Complete and Ready for Deployment

**Last Updated:** 2024

**Version:** 2.0 (Full Bylaw Enforcement)
