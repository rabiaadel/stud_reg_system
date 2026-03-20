# 📖 Complete API Reference

## Base Configuration

```
Base URL:      http://localhost:3000/api/v1
Authentication: JWT Token (Authorization: Bearer <token>)
Content-Type:  application/json
```

## Global Response Format

All API responses follow this standard structure:

```json
{
  "success": true|false,
  "data": { /* payload */ },
  "message": "Human-readable message",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- `200` - Success / OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

---

## 🔐 Authentication Routes
**Base:** `/api/v1/auth`

### POST /login
Login with credentials and receive JWT token

**Access:** Public

**Request:**
```json
{
  "email": "student@university.edu",
  "password": "Uni@2026!Student"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "email": "student@university.edu",
      "role": "student",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### POST /register
Register new account (creates account request for admin approval)

**Access:** Public

**Request:**
```json
{
  "email": "newuser@tanta.edu.eg",
  "password": "SecurePass123!",
  "role": "student",
  "first_name_en": "Ahmed",
  "first_name_ar": "أحمد",
  "last_name_en": "Hassan",
  "last_name_ar": "حسن",
  "national_id": "30010123456789",
  "phone": "+201001234567",
  "student_id": "20241001",
  "specialization_id": 1,
  "admission_type": "regular"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account request submitted. Pending admin approval.",
  "data": {
    "account_request_id": 42,
    "email": "newuser@tanta.edu.eg",
    "role": "student",
    "status": "pending"
  }
}
```

### GET /me
Get current authenticated user info

**Access:** Authenticated users only

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "email": "student@university.edu",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "student_id": "STU001",
      "specialization": "Software Engineering",
      "academic_level": "Junior"
    }
  }
}
```

### POST /refresh-token
Refresh expired JWT token

**Access:** Authenticated users

**Request:**
```json
{
  "refreshToken": "refresh_token_from_login"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  }
}
```

### POST /logout
Logout current session

**Access:** Authenticated users

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /request-password-reset
Request password reset email

**Access:** Public

**Request:**
```json
{
  "email": "student@university.edu"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

### POST /reset-password
Complete password reset with token

**Access:** Public

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 👨‍🎓 Student Routes
**Base:** `/api/v1/students`

### GET /profile
Get logged-in student's profile

**Access:** Student role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student_id": "STU001",
    "full_name": "John Doe",
    "email": "john@university.edu",
    "date_of_birth": "2000-01-01",
    "phone": "+1234567890",
    "national_id": "30010123456789",
    "department": "Computer Science",
    "specialization": "Software Engineering",
    "academic_level": "Junior",
    "enrollment_status": "active",
    "admission_date": "2022-09-01",
    "admission_type": "regular"
  }
}
```

### PUT /profile
Update student profile information

**Access:** Student role

**Request:**
```json
{
  "phone": "+9876543210",
  "address": "123 Street Name"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { /* updated profile object */ }
}
```

### GET /eligibility
Check course registration eligibility for upcoming semester

**Access:** Student role

**Query Parameters:**
- `semester_id` (optional) - Check eligibility for specific semester

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_eligible": true,
    "reason": "Student meets all registration requirements",
    "current_cgpa": 3.2,
    "current_gpa": 3.4,
    "credits_completed": 45,
    "max_credits_available": 18,
    "total_warnings": 0,
    "active_warnings": false,
    "is_dismissed": false,
    "status": "Good Standing",
    "requirements_check": {
      "meets_minimum_gpa": true,
      "not_dismissed": true,
      "no_active_warnings": true,
      "within_study_limit": true,
      "attendance_requirement": true
    }
  }
}
```

### GET /schedule
Get student's planned course schedule

**Access:** Student role

**Query Parameters:**
- `semester_id` (optional) - Filter by specific semester
- `include_details` (optional) - Include course details (default: false)

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
      "instructor": "Dr. Smith",
      "classroom": "Room 101",
      "schedule": "MWF 9:00-10:15",
      "semester": "Spring 2024"
    },
    {
      "course_id": 5,
      "course_code": "MATH201",
      "course_name": "Linear Algebra",
      "credits": 4,
      "instructor": "Dr. Johns",
      "classroom": "Room 205",
      "schedule": "TTh 10:30-12:00",
      "semester": "Spring 2024"
    }
  ]
}
```

### POST /register
Register for multiple courses in a semester

**Access:** Student role

**Request:**
```json
{
  "semester_id": 1,
  "course_ids": [1, 5, 8, 12]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Successfully registered for 4 courses",
  "data": {
    "semester_id": 1,
    "total_courses": 4,
    "total_credits": 13,
    "registrations": [
      {
        "registration_id": 101,
        "course_id": 1,
        "course_code": "CS101",
        "course_name": "Introduction to Programming",
        "credits": 3,
        "status": "registered"
      }
    ]
  }
}
```

**Possible Errors:**
- 400: Not eligible for registration
- 400: Course already registered
- 400: Credit limit exceeded
- 400: Prerequisites not met
- 409: Course is full

### POST /withdraw/:courseId
Withdraw from a course before deadline

**Access:** Student role

**Request:**
```json
{
  "semester_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully withdrawn from CS101",
  "data": {
    "withdrawn_course_id": 1,
    "remaining_credits": 10,
    "remaining_courses": 3
  }
}
```

### GET /grades
Get all grades for student

**Access:** Student role

**Query Parameters:**
- `semester_id` (optional) - Filter by semester
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "student_grade_id": 1,
      "course_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "credits": 3,
      "coursework_score": 85,
      "final_exam_score": 90,
      "final_score": 88.5,
      "grade_letter": "A",
      "grade_point": 4.0,
      "semester": "Fall 2023",
      "semester_id": 5
    },
    {
      "student_grade_id": 2,
      "course_id": 5,
      "course_code": "MATH201",
      "course_name": "Linear Algebra",
      "credits": 4,
      "coursework_score": 78,
      "final_exam_score": 82,
      "final_score": 80,
      "grade_letter": "B+",
      "grade_point": 3.5,
      "semester": "Fall 2023",
      "semester_id": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  },
  "summary": {
    "total_courses": 15,
    "total_credits_earned": 45,
    "courses_passed": 14,
    "courses_failed": 1
  }
}
```

### GET /standing
Get current academic standing

**Access:** Student role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "student_id": "STU001",
    "gpa": 3.45,
    "cgpa": 3.42,
    "total_credits_earned": 45,
    "total_credits_completed": 42,
    "courses_passed": 14,
    "courses_failed": 1,
    "academic_level": "Junior",
    "enrollment_status": "active",
    "academic_standing": "Good Standing",
    "warning_issued": false,
    "is_dismissed": false,
    "dismissal_reason": null,
    "semesters_completed": 4,
    "semesters_remaining": "4-5"
  }
}
```

### GET /standing/history
Get academic standing history across all semesters

**Access:** Student role

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "semester": "Spring 2024",
      "semester_id": 6,
      "gpa": 3.5,
      "cgpa": 3.45,
      "status": "Good Standing",
      "credits_earned": 12,
      "courses_passed": 4,
      "courses_failed": 0,
      "warnings": 0
    },
    {
      "semester": "Fall 2023",
      "semester_id": 5,
      "gpa": 3.4,
      "cgpa": 3.42,
      "status": "Good Standing",
      "credits_earned": 12,
      "courses_passed": 4,
      "courses_failed": 0,
      "warnings": 0
    }
  ]
}
```

### GET /graduation
Check graduation eligibility

**Access:** Student role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_eligible": true,
    "overall_progress_percent": 95,
    "credits_required": 132,
    "credits_earned": 125,
    "credits_remaining": 7,
    "gpa_required": 2.0,
    "current_gpa": 3.45,
    "core_requirements_met": true,
    "elective_requirements_met": true,
    "graduation_projects_completed": 2,
    "graduation_projects_required": 2,
    "training_completed": true,
    "missing_requirements": [],
    "estimated_graduation_date": "Spring 2024",
    "special_exam_passes": true,
    "library_clearance": true,
    "financial_clearance": true,
    "dormitory_clearance": true
  }
}
```

### GET /progress
Get student progress tracking and statistics

**Access:** Student role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_credits_earned": 45,
    "total_courses_passed": 14,
    "total_courses_failed": 1,
    "completion_percentage": 34,
    "semester_progress": [
      {
        "semester": "Fall 2023",
        "credits": 12,
        "courses": 4,
        "gpa": 3.4
      },
      {
        "semester": "Spring 2023",
        "credits": 11,
        "courses": 4,
        "gpa": 3.35
      }
    ],
    "performance_trend": "improving"
  }
}
```

### POST /warning (Admin)
Issue academic warning to student

**Access:** Admin only

**Request:**
```json
{
  "student_id": 1,
  "reason": "GPA below 2.0 in Fall 2023"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Academic warning issued",
  "data": {
    "warning_id": 42,
    "student_id": 1,
    "reason": "GPA below 2.0",
    "issued_by": 5,
    "issued_date": "2024-01-15"
  }
}
```

### POST /dismiss (Admin only)
Dismiss student from university

**Access:** Admin/Super Admin

**Request:**
```json
{
  "student_id": 1,
  "reason": "Multiple academic warnings"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Student dismissed successfully",
  "data": {
    "dismissal_id": 1,
    "student_id": 1,
    "dismissal_reason": "Multiple academic warnings",
    "dismissed_by": 5,
    "dismissed_date": "2024-01-15"
  }
}
```

---

## 👨‍🏫 Instructor Routes
**Base:** `/api/v1/instructors`

### POST /
Create new instructor (doctor/faculty member)

**Access:** Admin/Super Admin

**Request:**
```json
{
  "faculty_id": 1,
  "employee_id": "DR-2024-001",
  "first_name_en": "Ahmed",
  "last_name_en": "Hassan",
  "first_name_ar": "أحمد",
  "last_name_ar": "حسن",
  "email": "ahmed.hassan@university.edu",
  "phone": "+201000000000",
  "title": "Assistant Professor",
  "academic_degree": "PhD",
  "department_id": 3
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Instructor created successfully",
  "data": {
    "id": 1,
    "employee_id": "DR-2024-001",
    "full_name": "Ahmed Hassan",
    "email": "ahmed.hassan@university.edu",
    "title": "Assistant Professor",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /
List all instructors for faculty

**Access:** Admin, Instructors

**Query Parameters:**
- `faculty_id` (required)
- `department_id` (optional)
- `is_active` (optional, default: true)
- `search` (optional) - Search by name or email

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "employee_id": "DR-2024-001",
      "first_name_en": "Ahmed",
      "last_name_en": "Hassan",
      "email": "ahmed.hassan@university.edu",
      "title": "Assistant Professor",
      "department_name": "Computer Science",
      "is_active": true
    }
  ]
}
```

### GET /:id
Get instructor details with course assignments

**Access:** Admin, Instructors

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructor": {
      "id": 1,
      "employee_id": "DR-2024-001",
      "first_name_en": "Ahmed",
      "last_name_en": "Hassan",
      "email": "ahmed.hassan@university.edu",
      "title": "Assistant Professor",
      "department_name": "Computer Science"
    },
    "assignments": [
      {
        "assignment_id": 5,
        "course_id": 10,
        "course_code": "CS301",
        "course_name": "Database Systems",
        "semester_id": 3,
        "semester_name": "Spring 2024",
        "section": 1,
        "max_capacity": 50,
        "current_enrollment": 48,
        "classroom": "LAB-101",
        "schedule": {
          "days": ["Monday", "Wednesday"],
          "time": "09:00-10:30"
        }
      }
    ]
  }
}
```

### PUT /:id
Update instructor information

**Access:** Admin/Super Admin

**Request:**
```json
{
  "title": "Associate Professor",
  "email": "newemail@university.edu",
  "phone": "+201000000001"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Instructor updated successfully",
  "data": { /* updated instructor object */ }
}
```

### DELETE /:id
Deactivate instructor (soft delete)

**Access:** Admin/Super Admin

**Request:**
```json
{
  "reason": "Retirement"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Instructor deactivated successfully"
}
```

### POST /:id/assignments
Assign course to instructor for semester/section

**Access:** Admin/Super Admin

**Request:**
```json
{
  "course_id": 10,
  "semester_id": 3,
  "section": 1,
  "max_capacity": 50,
  "classroom": "LAB-101",
  "schedule_json": {
    "days": ["Monday", "Wednesday"],
    "time": "09:00-10:30"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Course assigned successfully",
  "data": {
    "assignment_id": 5,
    "instructor_id": 1,
    "course_id": 10,
    "semester_id": 3,
    "section": 1,
    "assigned_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /:id/workload
Get instructor workload analysis

**Access:** Admin/Super Admin

**Query Parameters:**
- `semester_id` (optional) - Analyze specific semester

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructor_id": 1,
    "name": "Ahmed Hassan",
    "courses_assigned": 3,
    "total_credits": 9,
    "total_student_capacity": 150,
    "average_class_size": 50,
    "is_overloaded": false
  }
}
```

### PUT /assignments/:assignmentId
Update course assignment details

**Access:** Admin/Super Admin

**Request:**
```json
{
  "max_capacity": 55,
  "classroom": "LAB-102",
  "schedule_json": {
    "days": ["Tuesday", "Thursday"],
    "time": "10:00-11:30"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Assignment updated successfully",
  "data": { /* updated assignment */ }
}
```

### DELETE /assignments/:assignmentId
Remove course assignment

**Access:** Admin/Super Admin

**Response (200):**
```json
{
  "success": true,
  "message": "Assignment removed successfully"
}
```

---

## 📚 Course Routes
**Base:** `/api/v1/courses`

### GET /
List all available courses with pagination and filtering

**Access:** Authenticated users

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `category` (optional) - Filter by category (Core, Elective, etc.)
- `department_id` (optional) - Filter by department
- `search` (optional) - Search by code or name
- `level` (optional) - Filter by course level (100, 200, 300, 400)

**Response (200):**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "course_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "credits": 3,
      "category": "Core",
      "department": "Computer Science",
      "description": "Fundamentals of programming with Python",
      "capacity": 30,
      "enrolled": 28,
      "instructor": "Dr. Smith"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### GET /:courseId
Get detailed course information

**Access:** Authenticated users

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
    "level": 100,
    "department": "Computer Science",
    "description": "Fundamentals of programming with Python",
    "syllabus": "Course covers...",
    "capacity": 30,
    "enrolled": 28,
    "instructor": "Dr. Smith",
    "meeting_time": "TR 9:00-10:30",
    "location": "Room 101",
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

### POST /
Create new course

**Access:** Admin/Super Admin

**Request:**
```json
{
  "course_code": "CS401",
  "course_name_en": "Advanced Database Systems",
  "course_name_ar": "أنظمة قواعد بيانات متقدمة",
  "credits": 3,
  "category": "Core",
  "department_id": 1,
  "level": 400,
  "description": "Advanced topics in database design",
  "max_capacity": 40
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Course created successfully",
  "data": { /* new course object */ }
}
```

### PUT /:courseId
Update course information

**Access:** Admin/Super Admin

**Request:**
```json
{
  "description": "Updated course description",
  "max_capacity": 35
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": { /* updated course */ }
}
```

### DELETE /:courseId
Delete course

**Access:** Admin/Super Admin

**Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

### GET /:courseId/prerequisites
Get prerequisites and check if student meets them

**Access:** Authenticated students

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_code": "CS101",
    "meets_all_prerequisites": true,
    "prerequisites": [
      {
        "prerequisite_code": "MATH101",
        "prerequisite_name": "Calculus I",
        "is_met": true,
        "grade_received": "A",
        "date_completed": "2023-05-15"
      }
    ]
  }
}
```

---

## 📊 Grade Routes
**Base:** `/api/v1/grades`

### GET /
Get grades for student

**Access:** Authenticated users, Faculty, Admin

**Query Parameters:**
- `student_id` (required for admin/faculty)
- `semester_id` (optional)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "student_grade_id": 1,
      "student_id": 1,
      "course_id": 1,
      "course_code": "CS101",
      "course_name": "Introduction to Programming",
      "credits": 3,
      "coursework_score": 85,
      "final_exam_score": 90,
      "final_score": 88.5,
      "grade_letter": "A",
      "grade_point": 4.0,
      "semester": "Fall 2023"
    }
  ]
}
```

### POST /
Record/post grade for student

**Access:** Instructor, Admin

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
  "message": "Grade recorded successfully",
  "data": {
    "student_grade_id": 1,
    "final_score": 88.5,
    "grade_letter": "A",
    "grade_point": 4.0
  }
}
```

### PUT /:gradeId
Update student grade

**Access:** Instructor, Admin

**Request:**
```json
{
  "coursework_score": 87,
  "final_exam_score": 92,
  "notes": "Score recalculated due to grading error"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Grade updated successfully",
  "data": { /* updated grade */ }
}
```

### DELETE /:gradeId
Delete grade record

**Access:** Admin only

**Response (200):**
```json
{
  "success": true,
  "message": "Grade deleted successfully"
}
```

---

## 📅 Semester Routes
**Base:** `/api/v1/semesters`

### GET /
Get all semesters

**Access:** Authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "semester_id": 1,
      "semester_name": "Fall 2023",
      "academic_year": 2023,
      "start_date": "2023-09-01",
      "end_date": "2023-12-15",
      "is_active": false,
      "is_current": false
    },
    {
      "semester_id": 6,
      "semester_name": "Spring 2024",
      "academic_year": 2024,
      "start_date": "2024-02-01",
      "end_date": "2024-05-15",
      "is_active": true,
      "is_current": true
    }
  ]
}
```

### GET /:semesterId
Get semester details including key dates

**Access:** Authenticated users

**Response (200):**
```json
{
  "success": true,
  "data": {
    "semester_id": 6,
    "semester_name": "Spring 2024",
    "academic_year": 2024,
    "start_date": "2024-02-01",
    "end_date": "2024-05-15",
    "is_active": true,
    "important_dates": {
      "add_drop_deadline": "2024-02-07",
      "withdrawal_deadline": "2024-04-10",
      "midterm_date": "2024-03-10",
      "final_exam_start": "2024-05-10"
    }
  }
}
```

### POST /
Create new semester

**Access:** Admin/Super Admin

**Request:**
```json
{
  "semester_name": "Summer 2024",
  "academic_year": 2024,
  "start_date": "2024-06-01",
  "end_date": "2024-08-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Semester created successfully",
  "data": { /* new semester */ }
}
```

---

## 🛡️ Admin Management Routes
**Base:** `/api/v1/admin`

### GET /dashboard
Get admin dashboard overview

**Access:** Admin/Super Admin

**Response (200):**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_students": 1250,
      "total_instructors": 85,
      "total_courses": 150,
      "active_semesters": 1
    },
    "pending_items": {
      "account_requests": 23,
      "course_modifications": 5,
      "appeals": 2
    },
    "recent_activities": [...]
  }
}
```

### GET /account-requests
Get pending account requests for approval

**Access:** Admin/Super Admin

**Query Parameters:**
- `status` (optional) - pending, approved, rejected
- `role` (optional) - student, instructor
- `search` (optional) - Search by email or name

**Response (200):**
```json
{
  "success": true,
  "count": 23,
  "data": [
    {
      "request_id": 42,
      "email": "newuser@tanta.edu.eg",
      "role": "student",
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "national_id": "30010123456789",
      "status": "pending",
      "submitted_at": "2024-01-10T14:30:00Z",
      "documents": [
        {
          "type": "national_id",
          "status": "uploaded"
        }
      ]
    }
  ]
}
```

### POST /account-requests/:requestId/approve
Approve pending account request

**Access:** Admin/Super Admin

**Request:**
```json
{
  "approved_by_notes": "All documents verified and eligibility confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account approved. User can now login.",
  "data": {
    "request_id": 42,
    "user_id": 1,
    "email": "newuser@tanta.edu.eg",
    "role": "student",
    "status": "approved",
    "approved_at": "2024-01-15T10:30:00Z"
  }
}
```

### POST /account-requests/:requestId/reject
Reject pending account request

**Access:** Admin/Super Admin

**Request:**
```json
{
  "rejection_reason": "Invalid national ID documentation"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account request rejected",
  "data": {
    "request_id": 42,
    "status": "rejected",
    "rejection_reason": "Invalid national ID documentation",
    "rejected_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /users
Get all users in system

**Access:** Admin/Super Admin

**Query Parameters:**
- `role` (optional) - student, instructor, admin
- `is_active` (optional)
- `search` (optional)

**Response (200):**
```json
{
  "success": true,
  "count": 1335,
  "data": [ /* array of users */ ]
}
```

### POST /manage/student-modifications
Create student course modification request

**Access:** Admin/Super Admin

**Request:**
```json
{
  "student_id": 101,
  "registration_id": 205,
  "action_type": "REMOVE",
  "course_id": 10,
  "semester_id": 3,
  "reason": "Medical leave"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Modification request created",
  "data": {
    "modification_id": 1,
    "student_id": 101,
    "action_type": "REMOVE",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### GET /manage/modifications/pending
Get pending course modifications awaiting review

**Access:** Admin/Super Admin

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "modification_id": 1,
      "student_id": 101,
      "student_name": "Omar Mohamed",
      "action_type": "REMOVE",
      "course_code": "CS301",
      "course_name": "Database Systems",
      "status": "PENDING",
      "reason": "Medical leave",
      "requested_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### PUT /manage/modifications/:modificationId/review
Review and approve/reject pending modification

**Access:** Admin/Super Admin

**Request:**
```json
{
  "decision": "APPROVED",
  "reviewer_notes": "Medical documentation verified"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Modification approved successfully",
  "data": {
    "modification_id": 1,
    "status": "APPROVED",
    "approved_at": "2024-01-15T11:00:00Z"
  }
}
```

### GET /activity-logs
Get audit trail of admin activities

**Access:** Admin/Super Admin

**Query Parameters:**
- `action` (optional) - approve, reject, create, update, delete
- `user_id` (optional) - Filter by which admin performed action
- `from_date` (optional) - Start date for logs
- `to_date` (optional) - End date for logs

**Response (200):**
```json
{
  "success": true,
  "count": 1250,
  "data": [
    {
      "log_id": 1,
      "action": "ACCOUNT_APPROVED",
      "performed_by": "admin@university.edu",
      "target_user": "newuser@tanta.edu.eg",
      "details": "Account approved for student role",
      "timestamp": "2024-01-15T10:30:00Z",
      "ip_address": "192.168.1.100"
    }
  ]
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Course already on student's schedule"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error_id": "ERR_12345"
}
```

---

## 📋 Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@university.edu",
    "password": "Uni@2026!Student"
  }'
```

### Get Student Profile
```bash
curl -X GET http://localhost:3000/api/v1/students/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Register for Courses
```bash
curl -X POST http://localhost:3000/api/v1/students/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "semester_id": 6,
    "course_ids": [1, 5, 8, 12]
  }'
```

---

**API Version:** 1.0
**Last Updated:** March 2024
**Status:** Production Ready ✅
