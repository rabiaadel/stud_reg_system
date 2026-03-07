# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints (except `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Authentication Routes
Base: `/api/v1/auth`

### POST /login
Login with credentials and get JWT token

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "user_id": 1,
      "email": "student@university.edu",
      "role": "student"
    }
  }
}
```

---

## Student Routes
Base: `/api/v1/students`

### GET /profile
Get current student's profile

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student_id": "STU001",
    "full_name": "John Doe",
    "email": "john@university.edu",
    "department": "Computer Science",
    "specialization": "Software Engineering",
    "academic_level": "Junior",
    "enrollment_status": "active",
    "date_of_birth": "2000-01-01",
    "phone": "+1234567890"
  }
}
```

### PUT /profile
Update student profile information

**Request:**
```json
{
  "full_name": "John Updated",
  "phone": "+9876543210"
}
```

**Response (200):** Updated profile object

### GET /eligibility
Check course registration eligibility

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_eligible": true,
    "reason": "Student is eligible to register",
    "current_gpa": 3.2,
    "credits_completed": 45,
    "max_credits_available": 18,
    "total_warnings": 0,
    "is_dismissed": false,
    "status": "Good Standing"
  }
}
```

### GET /schedule
Get student's planned course schedule

**Query Parameters:**
- `semester_id`: Optional - Filter by semester

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "course_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "schedule": "MWF 9:00-10:15",
      "instructor": "Dr. Smith",
      "classroom": "Room 101"
    }
  ]
}
```

### POST /register
Register for multiple courses

**Request:**
```json
{
  "course_ids": [1, 2, 3],
  "semester_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "registered_courses": 3,
    "total_credits": 12,
    "registrations": [...]
  }
}
```

**Errors:**
- 400: Not eligible for registration
- 409: Course already registered
- 400: Credit limit exceeded 
- 400: Prerequisites not met

### POST /withdraw/:courseId
Withdraw from a course

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully withdrawn from course",
    "remaining_credits": 9
  }
}
```

### GET /grades
Get all student grades

**Query Parameters:**
- `semester_id`: Optional
- `page`: Default 1
- `limit`: Default 20

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "student_grade_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "coursework_score": 85,
      "final_exam_score": 90,
      "final_score": 88.5,
      "grade_letter": "A",
      "grade_point": 4.0,
      "credits": 3,
      "semester": "Fall 2023"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### GET /standing
Get current academic standing

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student_id": "STU001",
    "cgpa": 3.45,
    "total_credits_earned": 45,
    "courses_passed": 15,
    "academic_level": "Junior",
    "enrollment_status": "active",
    "warning_issued": false,
    "is_dismissed": false,
    "last_updated": "2024-01-15T10:30:00Z"
  }
}
```

### GET /standing/history
Get academic standing history

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "semester": "Fall 2023",
      "cgpa": 3.4,
      "status": "Good Standing",
      "warnings": 0
    },
    {
      "semester": "Spring 2023",
      "cgpa": 3.2,
      "status": "Good Standing",
      "warnings": 0
    }
  ]
}
```

### GET /graduation
Get graduation eligibility status

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_eligible": true,
    "credits_required": 120,
    "credits_earned": 115,
    "current_gpa": 3.45,
    "min_gpa_required": 2.0,
    "missing_requirements": [],
    "missing_core_courses": [],
    "estimated_graduation": "Spring 2024"
  }
}
```

### GET /progress
Get student progress tracking

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_credits_earned": 45,
    "courses_passed": 15,
    "courses_failed": 1,
    "completion_percentage": 37.5,
    "progress_snapshots": [...]
  }
}
```

### POST /warning (Admin)
Issue academic warning to student

**Request:**
```json
{
  "reason": "GPA below 2.0"
}
```

**Response (201):** Warning record

**Auth:** Admin role required

### POST /dismiss (Admin)
Dismiss student from university

**Request:**
```json
{
  "reason": "Multiple academic warnings"
}
```

**Response (201):** Dismissal record

**Auth:** Admin role required

---

## Course Routes
Base: `/api/v1/courses`

### GET /
List all available courses

**Query Parameters:**
- `page`: Default 1
- `limit`: Default 20
- `category`: Filter by category
- `search`: Search by code or name

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "course_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "credits": 3,
      "category": "Core",
      "instructor": "Dr. Smith",
      "description": "Fundamentals of programming...",
      "capacity": 30,
      "enrolled": 28
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

### GET /:courseId
Get detailed course information

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Programming",
    "credits": 3,
    "category": "Core",
    "instructor": "Dr. Smith",
    "description": "Fundamentals of programming with Python",
    "capacity": 30,
    "enrolled": 28,
    "schedule": "MWF 9:00-10:15",
    "prerequisites": [
      {
        "prerequisite_id": 1,
        "prerequisite_code": "MATH101",
        "prerequisite_name": "Calculus I"
      }
    ]
  }
}
```

### GET /:courseId/prerequisites
Check if student meets prerequisites

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_code": "CS101",
    "meets_prerequisites": true,
    "prerequisites": [
      {
        "code": "MATH101",
        "name": "Calculus I",
        "met": true,
        "score": 85
      }
    ]
  }
}
```

---

## Grade Routes
Base: `/api/v1/grades`

### GET /
Get grades for a student

**Query Parameters:**
- `student_id`: Required
- `semester_id`: Optional

**Response (200):** Array of grade objects

### POST /
Post/Record a grade for a student

**Request:**
```json
{
  "student_id": 1,
  "course_id": 1,
  "coursework_score": 85,
  "final_exam_score": 90,
  "semester_id": 1
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "student_grade_id": 1,
    "student_id": 1,
    "course_id": 1,
    "coursework_score": 85,
    "final_exam_score": 90,
    "final_score": 88.5,
    "grade_letter": "A",
    "grade_point": 4.0
  }
}
```

**Auth:** Faculty/Admin role required

### PUT /:gradeId
Update a grade record

**Request:**
```json
{
  "coursework_score": 87,
  "final_exam_score": 92
}
```

**Response (200):** Updated grade object

**Auth:** Faculty/Admin role required

---

## Semester Routes
Base: `/api/v1/semesters`

### GET /
Get all semesters

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "semester_id": 1,
      "semester_name": "Fall 2023",
      "start_date": "2023-09-01",
      "end_date": "2023-12-15",
      "is_active": true
    }
  ]
}
```

### GET /active
Get currently active semester

**Response (200):**
```json
{
  "success": true,
  "data": {
    "semester_id": 1,
    "semester_name": "Fall 2023",
    "start_date": "2023-09-01",
    "end_date": "2023-12-15",
    "is_active": true
  }
}
```

### GET /:semesterId
Get specific semester details

**Response (200):** Semester object

### GET /:semesterId/deadlines
Get semester deadlines

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "deadline_id": 1,
      "deadline_name": "Add/Drop Deadline",
      "deadline_date": "2023-09-15",
      "days_until": 5,
      "description": "Last day to add or drop courses"
    }
  ]
}
```

---

## Academic Rules Routes
Base: `/api/v1/rules`

### GET /
Get all academic rules

**Query Parameters:**
- `category`: Filter by category

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rule_id": 1,
      "rule_name": "Minimum GPA",
      "category": "Academic Standards",
      "description": "Minimum GPA requirement for good standing",
      "rule_value": 2.0
    }
  ]
}
```

### GET /:ruleId
Get specific rule details

**Response (200):** Rule object

### POST / (Admin)
Create new academic rule

**Request:**
```json
{
  "rule_name": "New Rule",
  "category": "Academic Standards",
  "description": "Rule description",
  "rule_data": {}
}
```

**Response (201):** Created rule object

**Auth:** Admin role required

### PUT /:ruleId (Admin)
Update academic rule

**Request:**
```json
{
  "rule_value": 2.5,
  "description": "Updated description"
}
```

**Response (200):** Updated rule object

**Auth:** Admin role required

---

## Registration Routes
Base: `/api/v1/registrations`

### GET / (Admin)
Get all registrations

**Query Parameters:**
- `student_id`: Optional
- `status`: Optional
- `page`: Default 1
- `limit`: Default 20

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "registration_id": 1,
      "student_id": 1,
      "course_id": 1,
      "status": "registered",
      "registration_date": "2023-08-15",
      "grade": "A"
    }
  ],
  "pagination": { ... }
}
```

**Auth:** Admin role required

### GET /statistics (Admin)
Get registration statistics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_registrations": 450,
    "active_registrations": 380,
    "withdrawn": 70,
    "average_courses_per_student": 4.2
  }
}
```

**Auth:** Admin role required

---

## Admin Routes
Base: `/api/v1/admin`

### GET /dashboard
Get admin dashboard statistics

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_students": 500,
    "active_semesters": 1,
    "total_courses": 45,
    "academic_warnings": 15,
    "dismissed_students": 5,
    "average_gpa": 3.2,
    "active_registrations": 380,
    "graduation_eligible": 25
  }
}
```

**Auth:** Admin role required

### GET /audit-logs
Get system audit logs

**Query Parameters:**
- `action`: Filter by action
- `entity_type`: Filter by entity type
- `days`: Last N days (default 30)
- `page`: Default 1
- `limit`: Default 50

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "audit_log_id": 1,
      "user_id": 1,
      "user_email": "admin@university.edu",
      "action": "UPDATE",
      "entity_type": "student",
      "entity_id": 1,
      "changes": "Full JSON of changes",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

**Auth:** Admin role required

### POST /recalculate-gpa
Recalculate GPA for all students

**Request:** (optional)
```json
{
  "semester_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "GPA recalculation completed",
    "students_updated": 500,
    "average_gpa": 3.24
  }
}
```

**Auth:** Admin role required

### POST /send-notifications
Send bulk notifications to students

**Request:**
```json
{
  "recipient_type": "all_students",
  "subject": "Important Announcement",
  "message": "Your message here",
  "filters": {
    "academic_level": "Junior",
    "department_id": 1
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications_sent": 250,
    "message": "Notifications sent successfully"
  }
}
```

**Auth:** Admin role required

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "INVALID_REQUEST",
  "message": "Invalid request parameters",
  "details": { ... }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "CONFLICT",
  "message": "Course already registered"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## Rate Limiting

- **Limit**: 1000 requests per 15 minutes per IP
- **Reset**: After 15-minute window

Response headers indicate rate limit:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705315200
```

---

## Testing

Use Postman or curl for testing:

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@university.edu","password":"password123"}'

# Get Profile (using token)
curl -X GET http://localhost:3000/api/v1/students/profile \
  -H "Authorization: Bearer <token>"
```

See [Backend Documentation](./README.md) for more details.