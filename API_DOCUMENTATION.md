# Student Registration System - API Documentation

**Base URL:** `http://localhost:3000/api/v1`

## Authentication

All endpoints (except public endpoints) require JWT Bearer token in `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Registration Endpoints

### 1. Check Registration Eligibility

Check if a student is eligible to register for courses in a given semester.

**Endpoint:** `GET /registrations/check-eligibility`

**Query Parameters:**
- `studentId` (required): Student ID
- `semesterId` (required): Semester ID

**Response (Success):**
```json
{
  "success": true,
  "eligibility": {
    "eligible": true,
    "blockers": [],
    "warnings": [
      {
        "code": "ACADEMIC_WARNING",
        "message": "Student on academic warning",
        "severity": "HIGH"
      }
    ]
  }
}
```

**Response (Blocked):**
```json
{
  "success": true,
  "eligibility": {
    "eligible": false,
    "blockers": [
      {
        "code": "DISMISSAL_STATUS",
        "message": "Student has been dismissed from faculty (Article 8)",
        "severity": "CRITICAL"
      }
    ]
  }
}
```

**Blockers (Critical - Prevents Registration):**
- `DISMISSAL_STATUS` - Student dismissed
- `MAX_DURATION_EXCEEDED` - Exceeded 4-year study period
- `LOW_CGPA` - GPA below 2.0 minimum
- `ACADEMIC_DISMISSAL` - Academic dismissal after probation
- `CREDITS_COMPLETE` - All 132 credits completed; student eligible for graduation

---

### 2. Get Available Courses

Get list of courses available for student to register based on prerequisites and eligibility.

**Endpoint:** `GET /registrations/available-courses`

**Query Parameters:**
- `studentId` (required): Student ID
- `semesterId` (required): Semester ID

**Response:**
```json
{
  "success": true,
  "message": "Found 15 available courses",
  "availableCount": 15,
  "courses": [
    {
      "id": "c-001",
      "code": "CS211",
      "name_en": "Object Oriented Programming",
      "credit_hours": 3,
      "level": 2,
      "eligible": true,
      "prerequisites_met": true,
      "blockers": [],
      "warnings": []
    }
  ]
}
```

---

### 3. Register for Courses

Register student for multiple courses with full bylaw validation.

**Endpoint:** `POST /registrations/register`

**Request Body:**
```json
{
  "studentId": "s-001",
  "courseIds": ["c-001", "c-002", "c-003"],
  "semesterId": "sem-001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully registered for 3 courses",
  "registrations": [
    {
      "id": "reg-001",
      "course_id": "c-001",
      "status": "REGISTERED"
    }
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

**Response (Credit Violation):**
```json
{
  "success": false,
  "message": "Credit hour constraints violated",
  "totalCredits": 21,
  "minCredits": 12,
  "maxCredits": 20,
  "violations": ["Maximum 20 credits allowed per semester"],
  "courseValidations": [
    {
      "courseId": "c-001",
      "eligible": false,
      "blockers": [
        {
          "code": "PREREQUISITE_NOT_MET",
          "message": "Missing prerequisite: CS112",
          "severity": "CRITICAL"
        }
      ]
    }
  ]
}
```

**Validation Rules:**
- Min credits: 12, Max credits: 20 per semester
- All prerequisites must be met with passing grade
- Cannot register if on dismissal status
- Cannot exceed max study duration (8 semesters / 4 years)
- Cannot drop below minimum GPA (2.0)

---

### 4. Get Student's Current Registrations

Get all courses currently registered for a semester.

**Endpoint:** `GET /registrations/my-courses`

**Query Parameters:**
- `studentId` (required): Student ID
- `semesterId` (required): Semester ID

**Response:**
```json
{
  "success": true,
  "courseCount": 4,
  "totalCredits": 12,
  "registrations": [
    {
      "id": "reg-001",
      "status": "REGISTERED",
      "code": "CS211",
      "name_en": "Object Oriented Programming",
      "credit_hours": 3,
      "grade": null,
      "grade_points": null
    }
  ]
}
```

---

### 5. Drop a Course

Withdraw from a registered course.

**Endpoint:** `POST /registrations/drop-course`

**Request Body:**
```json
{
  "registrationId": "reg-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course dropped successfully",
  "registrationId": "reg-001"
}
```

**Note:** Dropping courses after add/drop deadline may result in 'W' (Withdrawn) grade.

---

## Graduation Endpoints

### 6. Check Graduation Eligibility

Comprehensive graduation eligibility check with detailed missing requirements breakdown.

**Endpoint:** `GET /registrations/graduation-eligibility`

**Query Parameters:**
- `studentId` (required): Student ID

**Response (Eligible):**
```json
{
  "success": true,
  "eligible_for_graduation": true,
  "eligibility_details": {
    "eligible": true,
    "academicStanding": {
      "status": "GOOD",
      "message": "No academic dismissals",
      "missing": []
    },
    "creditsStatus": {
      "completed_credits": 132,
      "required_credits": 132,
      "gpa": "3.5",
      "min_gpa": 2.0,
      "status": "PASSED",
      "missing": []
    },
    "projectsStatus": {
      "pr411_completed": true,
      "pr412_completed": true,
      "status": "PASSED"
    },
    "trainingStatus": {
      "training_completed": true,
      "status": "PASSED"
    },
    "missing_requirements": []
  },
  "graduation_estimate": {
    "completed_credits": 132,
    "required_credits": 132,
    "remaining_credits": 0,
    "semesters_needed": 0,
    "estimated_graduation": "This semester"
  }
}
```

**Response (Not Eligible):**
```json
{
  "success": true,
  "eligible_for_graduation": false,
  "missing_requirements_count": 3,
  "eligibility_details": {
    "missing_requirements": [
      {
        "requirement": "Total Credits (132 required)",
        "current": 120,
        "required": 132,
        "status": "INCOMPLETE",
        "message": "Need 12 more credit hours",
        "severity": "CRITICAL"
      },
      {
        "requirement": "Graduation Project 1 (PR411)",
        "status": "NOT_COMPLETED",
        "message": "PR411 (Graduation Project 1) must be completed",
        "severity": "CRITICAL"
      },
      {
        "requirement": "Training/Internship",
        "status": "NOT_COMPLETED",
        "message": "Must complete training/internship course (3 credits)",
        "severity": "CRITICAL"
      }
    ]
  }
}
```

**Graduation Requirements Checked:**
1. **Academic Standing** - No dismissals (Article 8)
2. **Total Credits** - 132 credits with GPA ≥ 2.0 (Article 4)
3. **Graduation Projects** - PR411 & PR412 completed (6 credits) (Article 12)
4. **Training/Internship** - Completion required (3 credits) (Article 12)
5. **Required Courses** - All specialization-required courses (Article 20)
6. **Course Distribution** - Credits by category met (Article 20)

---

## Bylaw and Academic Rules Endpoints

### 7. Get Bylaw Article

Retrieve specific bylaw article text and details.

**Endpoint:** `GET /registrations/bylaw-article`

**Query Parameters:**
- `articleCode` (required): Article code (e.g., 'ART_001_ADMISSION', 'ART_004_CREDITS')

**Response:**
```json
{
  "success": true,
  "article": {
    "title": "Total Credits Requirement",
    "description": "Students must complete 132 credit hours with GPA >= 2.0 to receive Bachelor degree.",
    "rule_data": {
      "total_credits_required": 132,
      "min_cgpa": 2.0,
      "source": "Article 4: Credit Hour System"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields: studentId, courseIds, semesterId"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Student not eligible for registration",
  "blockers": [
    {
      "code": "DISMISSAL_STATUS",
      "message": "Student has been dismissed",
      "severity": "CRITICAL"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Student not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error processing request: [error details]"
}
```

---

## Key Bylaw Enforcements

### Article 4: Credit Hour System
- **132 total credit hours required** for Bachelor degree
- **Minimum 2.0 GPA** required for graduation
- **Maximum 4 years (8 semesters)** study duration
- **Semester credit limits:** 12-20 credits per semester by level

### Article 20: Course Distribution and Progression
- **30+ credits required** before starting specialization courses
- **Prerequisite enforcement** - must complete prerequisites with minimum grades
- **Course sequencing** - mandatory course ordering (e.g., Calculus I before II)
- **Specialization requirements** - all mandatory courses in specialization
- **Course categories** - minimum credits in each category (General, Basic Sciences, Applied)

### Article 12: Graduation Projects and Training
- **PR411** - Graduation Project 1 (3 credits) after 85+ completed credits
- **PR412** - Graduation Project 2 (3 credits) after PR411 completion
- **Training/Internship** - 3 credits required

### Article 8: Academic Standing and Dismissal
- **GPA < 2.0** triggers academic warning/probation
- **Consecutive warnings** (4+) lead to dismissal
- **Total warnings** (6+) lead to dismissal
- **Dismissed students** cannot register for courses

---

## Integration with Frontend

### React Components
- `RegistrationPage.jsx` - Course registration interface
- `GraduationPage.jsx` - Graduation status tracking
- Uses Axiosfor API calls with JWT interceptor
- React Query for data fetching and caching

### Key Hooks
- `useQuery` - Fetch registration eligibility, available courses, graduation status
- `useState` - Manage selected courses, registration state

### Routes
```javascript
// In frontend routing
<Route path="/student/register" component={RegistrationPage} />
<Route path="/student/graduation" component={GraduationPage} />
```

---

## Testing Examples

### cURL Example - Check Eligibility
```bash
curl -X GET "http://localhost:3000/api/v1/registrations/check-eligibility?studentId=s-001&semesterId=sem-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### cURL Example - Register Courses
```bash
curl -X POST "http://localhost:3000/api/v1/registrations/register" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "s-001",
    "courseIds": ["c-001", "c-002"],
    "semesterId": "sem-001"
  }'
```

### cURL Example - Check Graduation
```bash
curl -X GET "http://localhost:3000/api/v1/registrations/graduation-eligibility?studentId=s-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Database Schema References

### Key Tables
- `students` - Student records with academic_status
- `student_registrations` - Course enrollments per semester
- `student_grades` - Final grades and GPA calculations
- `courses` - Course catalog with prerequisites
- `course_prerequisites` - Prerequisite requirements
- `academic_standing` - Probation/dismissal tracking
- `academic_rules` - Bylaw rules engine
- `registration_constraints` - Min/max credits by level
- `specializations` - Degree specialization requirements
- `semesters` - Semester definitions and deadlines

---

## Flow Diagrams

### Registration Flow
```
1. Check Overall Eligibility
   ↓ (if blocked → return error)
2. Validate Each Course (Prerequisites, Level, Etc.)
   ↓  
3. Validate Credit Hours (Min 12, Max 20)
   ↓ (if invalid → return partial registration)
4. Register Eligible Courses
   ↓
5. Return Success with Summary
```

### Graduation Flow
```
1. Check Academic Standing (No Dismissal)
2. Check Total Credits (132 with GPA ≥ 2.0)
3. Check Projects (PR411 + PR412)
4. Check Training (3 credits)
5. Check Required Courses (All completed)
6. Check Distribution (Credits by category)
   ↓
7. If all passed → Eligible for Graduation
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request successful | Successfully fetched available courses |
| 201 | Created - Course registered | Successfully registered for courses |
| 400 | Bad Request - Missing fields | Missing studentId parameter |
| 403 | Forbidden - Not eligible | Student on dismissal status |
| 404 | Not Found - Resource doesn't exist | Student not found |
| 500 | Server Error | Database connection failed |

