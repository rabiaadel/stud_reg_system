# Complete API Documentation - University Registration System

## API Overview

### Base URL
```
https://api.university-system.com/v1
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {access_token}
```

### Response Format

#### Success Response (200, 201)
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { /* response data */ },
    "meta": {
        "timestamp": "2024-02-25T10:30:00Z",
        "request_id": "req_abc123def456"
    }
}
```

#### Error Response (400, 404, 500)
```json
{
    "success": false,
    "message": "Error description",
    "errors": {
        "field_name": ["Error message"]
    },
    "meta": {
        "timestamp": "2024-02-25T10:30:00Z",
        "request_id": "req_abc123def456"
    }
}
```

---

## 1. STUDENT REGISTRATION ENDPOINTS

### 1.1 Register for Courses
```
POST /students/{student_id}/register
```

**Description**: Register a student for multiple courses in the current semester

**Request Body**:
```json
{
    "course_ids": [1, 5, 12, 8],
    "semester_id": 15,
    "notes": "Regular registration"
}
```

**Success Response (201)**:
```json
{
    "success": true,
    "message": "Registration successful",
    "data": {
        "student_id": "STU-2024-001",
        "semester": "Fall 2024",
        "registered_courses": 4,
        "total_credits": 12,
        "cgpa": 3.45,
        "registrations": [
            {
                "id": 101,
                "course_code": "CS311",
                "course_name": "Data Structures",
                "credit_hours": 3,
                "status": "Registered"
            }
        ]
    }
}
```

**Error Responses**:
- `400 Bad Request` - Student dismissed / Prerequisites not met / Credit limit exceeded
- `404 Not Found` - Student or course not found
- `409 Conflict` - Student already registered for this course

**Validation**:
- ✓ Student is active (not dismissed)
- ✓ All courses exist and are active
- ✓ Student meets course prerequisites
- ✓ Credit load is within limits (based on CGPA and level)
- ✓ Registration deadline has not passed
- ✓ No duplicate registrations for same course in semester

---

### 1.2 Check Registration Eligibility
```
GET /students/{student_id}/eligibility
```

**Description**: Check if student can register and get constraints

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "name": "Ahmed Ali Mohamed",
        "email": "ahmed.ali@university.edu",
        "specialization": "Computer Science",
        "current_level": 3,
        "cgpa": 3.45,
        "total_credits_passed": 75,
        "status": "Active",
        "is_on_warning": false,
        "is_dismissed": false,
        "can_register": true,
        "registration_constraints": {
            "min_credits": 0,
            "max_credits": 22,
            "min_cgpa_required": 2.0,
            "current_cgpa": 3.45
        },
        "semester": {
            "id": 15,
            "name": "Fall 2024",
            "registration_deadline": "2024-09-10",
            "days_until_deadline": 5
        },
        "available_courses": 45,
        "graduation_eligible": true,
        "credits_remaining": 57
    }
}
```

---

### 1.3 Get Planned Schedule
```
GET /students/{student_id}/planned-schedule
```

**Description**: Get proposed course schedule for current semester

**Query Parameters**:
- `semester_id` (optional): Specific semester (defaults to current active)

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "semester": "Fall 2024",
        "total_courses": 4,
        "total_credits": 12,
        "courses": [
            {
                "course_id": 5,
                "course_code": "CS311",
                "course_name": "Data Structures",
                "credit_hours": 3,
                "level": 3,
                "instructor": "Dr. Amira Hassan",
                "schedules": [
                    {
                        "section": "A",
                        "day": "Sunday",
                        "time": "10:00-11:30",
                        "location": "Building A, Room 304"
                    }
                ]
            }
        ]
    }
}
```

---

### 1.4 Withdraw from Course
```
POST /students/{student_id}/withdraw
```

**Description**: Withdraw from a course with optional excuse

**Request Body**:
```json
{
    "course_id": 5,
    "semester_id": 15,
    "reason": "Personal reasons",
    "is_excused": false,
    "excuse_document": "base64_encoded_file" // Optional
}
```

**Response (200)**:
```json
{
    "success": true,
    "message": "Withdrawal successful",
    "data": {
        "student_id": "STU-2024-001",
        "course_code": "CS311",
        "course_name": "Data Structures",
        "withdrawal_date": "2024-10-05T14:30:00Z",
        "grade_status": "W (Withdrawn)"
    }
}
```

**Error Responses**:
- `400 Bad Request` - Withdrawal deadline passed / Course not registered
- `404 Not Found` - Student or registration not found

**Validation**:
- ✓ Withdrawal deadline not passed (week 7 for regular, week 2 for summer)
- ✓ Student is enrolled in the course
- ✓ Course is in progress

---

## 2. COURSE ENDPOINTS

### 2.1 List Available Courses
```
GET /courses
```

**Query Parameters**:
- `faculty_id` (required)
- `specialization_id` (optional): Filter by specialization
- `level` (optional): 1, 2, 3, or 4
- `is_mandatory` (optional): true/false
- `page` (optional): Default 1
- `per_page` (optional): Default 20

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "id": 5,
            "code": "CS311",
            "name": "Data Structures",
            "credit_hours": 3,
            "level": 3,
            "is_mandatory": true,
            "category": "Specialization",
            "description": "Advanced data structures and algorithms",
            "prerequisites": [
                {
                    "id": 3,
                    "code": "CS212",
                    "name": "Object Oriented Programming",
                    "min_grade": 0.0,
                    "is_strict": true
                }
            ],
            "is_active": true
        }
    ],
    "meta": {
        "total": 120,
        "per_page": 20,
        "current_page": 1,
        "last_page": 6
    }
}
```

---

### 2.2 Get Course Details
```
GET /courses/{course_id}
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "id": 5,
        "code": "CS311",
        "name": "Data Structures",
        "name_ar": "هياكل البيانات",
        "description": "Comprehensive study of data structures...",
        "credit_hours": 3,
        "level": 3,
        "is_mandatory": true,
        "min_passing_grade": 1.0,
        "prerequisites": [
            {
                "id": 3,
                "code": "CS212",
                "name": "OOP",
                "min_grade": 0.0
            }
        ],
        "dependent_courses": [
            {
                "id": 10,
                "code": "CS312",
                "name": "Algorithms"
            }
        ],
        "schedules": [
            {
                "section": "A",
                "day": "Sunday",
                "time": "10:00-11:30",
                "location": "Building A, Room 304",
                "instructor": "Dr. Amira Hassan",
                "capacity": 40,
                "enrolled": 38
            }
        ]
    }
}
```

---

### 2.3 Check Prerequisites
```
GET /courses/{course_id}/prerequisites
```

**Query Parameters**:
- `student_id`: Check prerequisites for specific student

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "course_id": 5,
        "course_code": "CS311",
        "student_id": "STU-2024-001",
        "can_register": true,
        "prerequisites": [
            {
                "id": 3,
                "code": "CS212",
                "name": "Object Oriented Programming",
                "min_grade": 0.0,
                "student_grade": "A",
                "student_grade_points": 3.7,
                "is_met": true
            }
        ],
        "unmet_prerequisites": []
    }
}
```

---

## 3. GRADES & ACADEMIC STANDING

### 3.1 Get Student Grades
```
GET /students/{student_id}/grades
```

**Query Parameters**:
- `semester_id` (optional): Specific semester
- `course_id` (optional): Specific course
- `include_history` (optional): Include all attempts (default: false)

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "current_level": 3,
        "total_courses": 28,
        "courses_passed": 26,
        "cgpa": 3.45,
        "gpa_this_semester": 3.60,
        "grades": [
            {
                "semester": "Fall 2024",
                "course_code": "CS311",
                "course_name": "Data Structures",
                "credit_hours": 3,
                "coursework_score": 35,
                "midterm_score": 42,
                "final_exam_score": 75,
                "total_score": 58.6,
                "grade_letter": "B+",
                "grade_points": 3.2,
                "is_first_attempt": true
            }
        ]
    }
}
```

---

### 3.2 Get Academic Standing
```
GET /students/{student_id}/academic-standing
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "gpa_this_semester": 3.45,
        "cgpa": 3.45,
        "status": "Active",
        "is_on_warning": false,
        "warning_count": {
            "consecutive": 0,
            "total": 0
        },
        "is_dismissed": false,
        "is_on_probation": false,
        "is_honors_eligible": true,
        "academic_classification": "Excellent",
        "details": {
            "min_cgpa_for_honors": 3.0,
            "no_failed_courses": true,
            "max_semesters_for_honors": 8,
            "semesters_completed": 6
        }
    }
}
```

---

### 3.3 Get Academic Standing History
```
GET /students/{student_id}/standing-history
```

**Query Parameters**:
- `from_semester_id` (optional)
- `to_semester_id` (optional)

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "standing_history": [
            {
                "semester": "Spring 2024",
                "gpa": 3.50,
                "cgpa": 3.45,
                "courses_passed": 4,
                "courses_failed": 0,
                "total_credits": 13,
                "status": "Active",
                "warning_status": null,
                "remarks": "Good standing"
            }
        ]
    }
}
```

---

### 3.4 Issue Academic Warning (Admin)
```
POST /students/{student_id}/issue-warning
```

**Request Body**:
```json
{
    "semester_id": 15,
    "reason": "CGPA below 2.0",
    "notes": "Requires academic improvement plan"
}
```

**Response (200)**:
```json
{
    "success": true,
    "message": "Academic warning issued successfully",
    "data": {
        "student_id": "STU-2024-001",
        "warning_count": {
            "consecutive": 1,
            "total": 1
        },
        "is_on_warning": true,
        "issued_date": "2024-10-15T10:30:00Z",
        "dismissal_threshold": {
            "consecutive_warnings": 4,
            "warnings_remaining": 3
        }
    }
}
```

---

### 3.5 Dismiss Student (Admin)
```
POST /students/{student_id}/dismiss
```

**Request Body**:
```json
{
    "reason": "Automatic dismissal - 4 consecutive warnings",
    "dismissal_type": "Academic",
    "notes": "Student has been notified"
}
```

**Response (200)**:
```json
{
    "success": true,
    "message": "Student dismissed successfully",
    "data": {
        "student_id": "STU-2024-001",
        "is_dismissed": true,
        "dismissal_date": "2024-10-20T10:30:00Z",
        "dismissal_reason": "Automatic dismissal - 4 consecutive warnings"
    }
}
```

---

## 4. GRADUATION ENDPOINTS

### 4.1 Check Graduation Eligibility
```
GET /students/{student_id}/graduation-eligibility
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "name": "Ahmed Ali Mohamed",
        "graduation_eligible": true,
        "eligibility_status": "Eligible - All requirements met",
        "credits": {
            "required": 132,
            "earned": 129,
            "remaining": 3
        },
        "cgpa": {
            "current": 3.45,
            "minimum_required": 2.0,
            "meets_requirement": true
        },
        "requirements": {
            "credits": {
                "status": "Completed",
                "value": 129,
                "requirement": 132
            },
            "cgpa": {
                "status": "Meets",
                "value": 3.45,
                "requirement": 2.0
            },
            "graduation_project_1": {
                "status": "Completed",
                "grade": "A"
            },
            "graduation_project_2": {
                "status": "Completed",
                "grade": "B+"
            },
            "summer_training": {
                "status": "Completed",
                "hours": 3
            },
            "no_failed_courses": {
                "status": "True",
                "failed_count": 0
            }
        },
        "honors_eligible": true,
        "honors_requirements": {
            "cgpa": {
                "required": 3.0,
                "current": 3.45,
                "meets": true
            },
            "no_failures": {
                "required": true,
                "current": true,
                "meets": true
            },
            "max_duration": {
                "required": "4 years (8 semesters)",
                "completed_semesters": 6,
                "meets": true
            }
        },
        "estimated_graduation_date": "2025-06-15",
        "commencement_ceremony": "2025-06-21"
    }
}
```

---

### 4.2 Get Progress Tracking
```
GET /students/{student_id}/progress
```

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "student_id": "STU-2024-001",
        "progress_percentage": 97.7,
        "current_semester": "Fall 2024",
        "semester_progress": {
            "courses_registered": 4,
            "credits_registered": 12,
            "courses_passed": 28,
            "credits_passed": 129,
            "total_credits_required": 132
        },
        "program_requirements": [
            {
                "category": "General Courses",
                "required": 12,
                "completed": 12,
                "percentage": 100
            },
            {
                "category": "Basic Sciences & Math",
                "required": 15,
                "completed": 15,
                "percentage": 100
            },
            {
                "category": "Specialization Mandatory",
                "required": 38,
                "completed": 38,
                "percentage": 100
            },
            {
                "category": "Specialization Electives",
                "required": 12,
                "completed": 10,
                "percentage": 83
            },
            {
                "category": "Graduation Projects",
                "required": 6,
                "completed": 6,
                "percentage": 100
            },
            {
                "category": "Summer Training",
                "required": 3,
                "completed": 3,
                "percentage": 100
            }
        ],
        "academic_standing": "Excellent",
        "cgpa": 3.45
    }
}
```

---

## 5. SEMESTER & DEADLINE ENDPOINTS

### 5.1 Get Active Semester
```
GET /semesters/active
```

**Query Parameters**:
- `faculty_id`: Faculty to get semester for

**Response (200)**:
```json
{
    "success": true,
    "data": {
        "id": 15,
        "academic_year": "2024-2025",
        "semester_name": "Fall",
        "semester_number": 1,
        "start_date": "2024-09-01",
        "end_date": "2024-12-31",
        "is_active": true,
        "deadlines": [
            {
                "deadline_code": "registration_open",
                "deadline_name": "Registration Opens",
                "deadline_date": "2024-08-25",
                "week": 0
            },
            {
                "deadline_code": "registration_close",
                "deadline_name": "Registration Closes",
                "deadline_date": "2024-09-15",
                "week": 2
            },
            {
                "deadline_code": "add_drop",
                "deadline_name": "Add/Drop Deadline",
                "deadline_date": "2024-09-15",
                "week": 2
            },
            {
                "deadline_code": "withdrawal",
                "deadline_name": "Course Withdrawal Deadline",
                "deadline_date": "2024-11-10",
                "week": 7
            }
        ]
    }
}
```

---

## 6. ACADEMIC RULES MANAGEMENT (Admin)

### 6.1 List Academic Rules
```
GET /academic-rules
```

**Query Parameters**:
- `faculty_id`: Required for multi-tenant
- `category`: 'Registration', 'GPA', 'Attendance', etc.
- `is_active`: true/false

**Response (200)**:
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "rule_code": "REG_MAX_CREDITS_FRESHMAN",
            "category": "Registration",
            "title": "Maximum Credits for Freshman Level",
            "description": "Maximum credit hours freshmen can register per semester",
            "rule_type": "numeric",
            "rule_data": {
                "max_credits": 27,
                "level": 1,
                "notes": "Can exceed with senior approval"
            },
            "is_active": true,
            "effective_from": "2024-01-01",
            "effective_to": null
        }
    ]
}
```

---

### 6.2 Create/Update Academic Rule
```
POST /academic-rules
PUT /academic-rules/{rule_id}
```

**Request Body**:
```json
{
    "rule_code": "REG_MAX_CREDITS_FRESHMAN",
    "category": "Registration",
    "title": "Maximum Credits for Freshman Level",
    "rule_type": "numeric",
    "rule_data": {
        "max_credits": 27,
        "level": 1,
        "exceptions": []
    },
    "is_active": true,
    "effective_from": "2024-09-01",
    "effective_to": null
}
```

**Response (201/200)**:
```json
{
    "success": true,
    "message": "Rule created/updated successfully",
    "data": { /* rule object */ }
}
```

---

## 7. ERROR CODES & MEANINGS

| Code | Status | Message | Meaning |
|------|--------|---------|---------|
| 400001 | 400 | STUDENT_DISMISSED | Student has been dismissed |
| 400002 | 400 | PREREQUISITE_NOT_MET | Course prerequisites not met |
| 400003 | 400 | CREDIT_LIMIT_EXCEEDED | Student credit limit exceeded |
| 400004 | 400 | DEADLINE_PASSED | Registration/withdrawal deadline passed |
| 400005 | 400 | DUPLICATE_REGISTRATION | Already registered for this course |
| 404001 | 404 | STUDENT_NOT_FOUND | Student record not found |
| 404002 | 404 | COURSE_NOT_FOUND | Course record not found |
| 404003 | 404 | SEMESTER_NOT_FOUND | Semester not found |
| 409001 | 409 | CONFLICT_SCHEDULE | Course schedule conflict |
| 500001 | 500 | SERVER_ERROR | Unexpected server error |

---

## 8. RATE LIMITING

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1635355200
```

- **1000 requests** per hour per user
- **10,000 requests** per hour per API key
- Exceeded limits: `429 Too Many Requests`

---

## 9. PAGINATION

All list endpoints support:
- `page` (default: 1)
- `per_page` (default: 20, max: 100)

Response includes:
```json
{
    "meta": {
        "total": 150,
        "per_page": 20,
        "current_page": 1,
        "last_page": 8,
        "from": 1,
        "to": 20
    }
}
```

---

## 10. WEBHOOKS (Optional)

Subscribe to events:
```
POST /webhooks/subscribe
```

**Events**:
- `student.registered` - Course registration
- `student.withdrawn` - Course withdrawal
- `student.grade_updated` - Grade posted
- `student.warning_issued` - Academic warning
- `student.dismissed` - Dismissal

