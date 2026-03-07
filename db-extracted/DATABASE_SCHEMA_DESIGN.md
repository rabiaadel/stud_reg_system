# Complete University Registration System - Database Schema & Design
## Multi-Tenant Architecture with Flexible Bylaw Rules Management

---

## TABLE OF CONTENTS
1. Database Architecture Overview
2. Core Database Schema (25+ Tables)
3. Laravel Migrations & Models
4. API Endpoints Structure
5. Business Logic & Services
6. Validation Rules Engine
7. Sample Implementation

---

## 1. DATABASE ARCHITECTURE OVERVIEW

### Design Principles
- **Multi-Tenant**: Support multiple universities/faculties
- **Rule-Engine Based**: Store rules as data, not hardcoded logic
- **Flexible**: Easily customizable for different institutions
- **Traceable**: Audit trail for all student actions
- **Performant**: Optimized for large student populations

### ERD (Entity Relationship Diagram)

```
Universities
    ├── Faculties
    │   ├── Departments
    │   ├── Specializations
    │   ├── Programs/Curricula
    │   └── AcademicRules
    ├── Semesters
    │   ├── SemesterDates
    │   └── SemesterDeadlines
    ├── Courses
    │   ├── CoursePrerequisites
    │   ├── CourseSchedules
    │   └── CourseInstructors
    └── Students
        ├── StudentRegistrations
        ├── StudentGrades
        ├── StudentAcademicStanding
        ├── StudentWithdrawals
        └── StudentProgressTracking
```

---

## 2. CORE DATABASE SCHEMA (25+ TABLES)

### Table 1: universities
```sql
CREATE TABLE universities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table 2: faculties
```sql
CREATE TABLE faculties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    university_id INT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    dean_name VARCHAR(255),
    dean_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE,
    INDEX idx_university (university_id)
);
```

### Table 3: departments
```sql
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    chair_name VARCHAR(255),
    chair_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    INDEX idx_faculty (faculty_id)
);
```

### Table 4: specializations
```sql
CREATE TABLE specializations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    faculty_id INT NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    total_credits INT DEFAULT 132,
    min_cgpa DECIMAL(3,2) DEFAULT 2.0,
    min_study_years INT DEFAULT 3,
    max_study_years INT DEFAULT 4,
    specialization_start_credits INT DEFAULT 66,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    INDEX idx_department (department_id)
);
```

### Table 5: academic_rules
```sql
CREATE TABLE academic_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Registration', 'GPA', 'Attendance', 'Dismissal', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50), -- 'numeric', 'boolean', 'condition', 'date'
    rule_data JSON, -- Store rule parameters as JSON
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE,
    effective_to DATE,
    created_by INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    INDEX idx_faculty (faculty_id),
    INDEX idx_category (category)
);
```

### Table 6: registration_constraints
```sql
CREATE TABLE registration_constraints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    specialization_id INT NOT NULL,
    academic_level INT, -- 1: Freshman, 2: Sophomore, 3: Junior, 4: Senior
    min_credits INT,
    max_credits INT,
    min_cgpa DECIMAL(3,2),
    max_cgpa DECIMAL(3,2),
    is_new_student BOOLEAN,
    exceptions JSON, -- Store exceptions as JSON for flexibility
    created_at TIMESTAMP,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_level (specialization_id, academic_level, is_new_student)
);
```

### Table 7: semesters
```sql
CREATE TABLE semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    academic_year VARCHAR(9), -- e.g., '2024-2025'
    semester_number INT, -- 1: Fall, 2: Spring, 3: Summer
    semester_name ENUM('Fall', 'Spring', 'Summer'),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_semester (faculty_id, academic_year, semester_number),
    INDEX idx_faculty (faculty_id)
);
```

### Table 8: semester_deadlines
```sql
CREATE TABLE semester_deadlines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    semester_id INT NOT NULL,
    deadline_code VARCHAR(50), -- 'registration_open', 'add_drop', 'withdrawal', etc.
    deadline_name VARCHAR(255),
    deadline_date DATE NOT NULL,
    deadline_week INT,
    description TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_deadline (semester_id, deadline_code)
);
```

### Table 9: course_categories
```sql
CREATE TABLE course_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(255),
    name_ar VARCHAR(255),
    description TEXT,
    percent_min DECIMAL(4,2),
    percent_max DECIMAL(4,2),
    is_mandatory BOOLEAN,
    created_at TIMESTAMP
);
```

### Table 10: courses
```sql
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT NOT NULL,
    specialization_id INT,
    code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'CS311'
    name_en VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    credit_hours INT NOT NULL,
    level INT, -- 1, 2, 3, 4
    category_id INT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    min_passing_grade DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id),
    FOREIGN KEY (category_id) REFERENCES course_categories(id),
    INDEX idx_faculty (faculty_id),
    INDEX idx_code (code)
);
```

### Table 11: course_prerequisites
```sql
CREATE TABLE course_prerequisites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    prerequisite_course_id INT NOT NULL,
    min_grade DECIMAL(3,2), -- NULL = just needs to pass
    is_strict BOOLEAN DEFAULT TRUE, -- Strict = must pass before registration
    logic VARCHAR(50), -- 'AND', 'OR', 'XOR'
    created_at TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_prerequisite (course_id, prerequisite_course_id)
);
```

### Table 12: grading_scales
```sql
CREATE TABLE grading_scales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    faculty_id INT,
    grade_letter VARCHAR(3),
    grade_ar VARCHAR(50),
    min_percentage DECIMAL(5,2),
    max_percentage DECIMAL(5,2),
    grade_points DECIMAL(3,2),
    description VARCHAR(255),
    created_at TIMESTAMP,
    UNIQUE KEY unique_grade (faculty_id, grade_letter),
    INDEX idx_faculty (faculty_id)
);
```

### Table 13: students
```sql
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    faculty_id INT NOT NULL,
    specialization_id INT,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    first_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_ar VARCHAR(100),
    last_name_ar VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F'),
    national_id VARCHAR(20),
    admission_date DATE,
    admission_type VARCHAR(50), -- 'Regular', 'Exceptional', 'Transfer'
    current_level INT, -- 1, 2, 3, 4
    total_credits_passed INT DEFAULT 0,
    cgpa DECIMAL(3,3) DEFAULT 0,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissal_date DATE,
    dismissal_reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id),
    FOREIGN KEY (specialization_id) REFERENCES specializations(id),
    INDEX idx_faculty (faculty_id),
    INDEX idx_student_id (student_id)
);
```

### Table 14: student_registrations
```sql
CREATE TABLE student_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    course_id INT NOT NULL,
    grade_id INT,
    status ENUM('Registered', 'Withdrawn', 'InProgress', 'Completed'), -- 'Registered', 'Withdrawn', 'In Progress', 'Completed'
    registration_date DATETIME,
    withdrawal_date DATETIME,
    withdrawal_reason VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (grade_id) REFERENCES student_grades(id),
    UNIQUE KEY unique_registration (student_id, semester_id, course_id),
    INDEX idx_student (student_id),
    INDEX idx_semester (semester_id)
);
```

### Table 15: student_grades
```sql
CREATE TABLE student_grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_registration_id INT NOT NULL,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    coursework_score DECIMAL(5,2),
    midterm_score DECIMAL(5,2),
    final_exam_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade_letter VARCHAR(3),
    grade_points DECIMAL(3,2),
    is_first_attempt BOOLEAN DEFAULT TRUE,
    is_improvement_attempt BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (student_registration_id) REFERENCES student_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    INDEX idx_student (student_id),
    INDEX idx_course (course_id)
);
```

### Table 16: student_academic_standing
```sql
CREATE TABLE student_academic_standing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    semester_id INT,
    gpa DECIMAL(3,3),
    cgpa DECIMAL(3,3),
    is_on_warning BOOLEAN DEFAULT FALSE,
    consecutive_warning_count INT DEFAULT 0,
    total_warning_count INT DEFAULT 0,
    is_dismissed BOOLEAN DEFAULT FALSE,
    dismissal_reason VARCHAR(255),
    is_on_probation BOOLEAN DEFAULT FALSE,
    probation_start_date DATE,
    probation_end_date DATE,
    is_honors_eligible BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    INDEX idx_student (student_id)
);
```

### Table 17: student_withdrawals
```sql
CREATE TABLE student_withdrawals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    withdrawal_type ENUM('Course', 'Semester', 'Faculty'), -- Course, Semester, Faculty
    reason VARCHAR(255),
    is_excused BOOLEAN DEFAULT FALSE,
    excuse_document_path VARCHAR(255),
    approved_by INT,
    approved_date DATE,
    notes TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    INDEX idx_student (student_id)
);
```

### Table 18: student_progress_tracking
```sql
CREATE TABLE student_progress_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    semester_id INT NOT NULL,
    total_courses_registered INT,
    total_credits_registered INT,
    courses_passed INT,
    credits_passed INT,
    total_credits_accumulated INT,
    cgpa DECIMAL(3,3),
    is_on_track BOOLEAN,
    projections JSON, -- Expected completion, warnings, etc.
    created_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### Table 19: attendance_records
```sql
CREATE TABLE attendance_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    total_sessions INT,
    attended_sessions INT,
    attendance_percentage DECIMAL(5,2),
    last_updated TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    UNIQUE KEY unique_attendance (student_id, course_id, semester_id)
);
```

### Table 20: graduation_eligibility
```sql
CREATE TABLE graduation_eligibility (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL UNIQUE,
    total_credits_passed INT,
    total_credits_required INT,
    credits_remaining INT,
    cgpa DECIMAL(3,3),
    min_cgpa_required DECIMAL(3,2),
    is_eligible BOOLEAN DEFAULT FALSE,
    is_honors_eligible BOOLEAN DEFAULT FALSE,
    project_status VARCHAR(50), -- 'Not_Started', 'In_Progress', 'Completed'
    training_status VARCHAR(50), -- 'Not_Started', 'In_Progress', 'Completed'
    missing_requirements JSON, -- List of missing requirements
    estimated_graduation_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

### Table 21: audit_logs
```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    entity_type VARCHAR(100), -- 'Registration', 'Grade', 'Withdrawal', etc.
    entity_id INT,
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_entity (entity_type, entity_id)
);
```

### Table 22: course_schedules
```sql
CREATE TABLE course_schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    section VARCHAR(10),
    day_of_week INT, -- 0=Sunday, 6=Saturday
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    instructor_id INT,
    capacity INT,
    enrolled_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
```

### Table 23: notifications
```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    faculty_id INT,
    notification_type VARCHAR(50), -- 'Warning', 'Deadline', 'Grade', etc.
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);
```

### Table 24: course_repeat_tracking
```sql
CREATE TABLE course_repeat_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    first_attempt_grade DECIMAL(3,2),
    first_attempt_date DATE,
    repeat_count INT DEFAULT 0,
    best_grade DECIMAL(3,2),
    best_grade_date DATE,
    is_for_improvement BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY unique_repeat (student_id, course_id)
);
```

### Table 25: graduation_projects
```sql
CREATE TABLE graduation_projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    project_number INT, -- 1 or 2
    project_title VARCHAR(255),
    project_description TEXT,
    start_date DATE,
    end_date DATE,
    advisor_id INT,
    grade DECIMAL(3,2),
    status ENUM('NotStarted', 'InProgress', 'Completed', 'Failed'), 
    submitted_date DATETIME,
    created_at TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
```

---

## 3. LARAVEL MIGRATIONS & MODELS

### Migration Pattern (database/migrations)

```php
<?php
// Example: CreateUniversitiesTable.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUniversitiesTable extends Migration
{
    public function up()
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('universities');
    }
}
```

### Laravel Models (app/Models)

```php
// University Model
namespace App\Models;

class University extends Model
{
    protected $fillable = [
        'code', 'name_en', 'name_ar', 'country', 'city', 
        'email', 'phone', 'website', 'is_active'
    ];

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }

    public function departments()
    {
        return $this->hasManyThrough(Department::class, Faculty::class);
    }

    public function semesters()
    {
        return $this->hasManyThrough(Semester::class, Faculty::class);
    }
}

// Faculty Model
class Faculty extends Model
{
    protected $fillable = [
        'university_id', 'code', 'name_en', 'name_ar', 
        'description', 'dean_name', 'dean_email', 'is_active'
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function departments()
    {
        return $this->hasMany(Department::class);
    }

    public function specializations()
    {
        return $this->hasMany(Specialization::class);
    }

    public function academicRules()
    {
        return $this->hasMany(AcademicRule::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}

// Student Model
class Student extends Model
{
    protected $fillable = [
        'faculty_id', 'specialization_id', 'student_id',
        'first_name_en', 'last_name_en', 'email', 'phone',
        'date_of_birth', 'gender', 'national_id',
        'admission_date', 'admission_type', 'current_level',
        'total_credits_passed', 'cgpa', 'is_dismissed'
    ];

    protected $casts = [
        'cgpa' => 'decimal:3',
        'admission_date' => 'date',
        'dismissal_date' => 'date',
        'is_dismissed' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function specialization()
    {
        return $this->belongsTo(Specialization::class);
    }

    public function registrations()
    {
        return $this->hasMany(StudentRegistration::class);
    }

    public function academicStanding()
    {
        return $this->hasOne(StudentAcademicStanding::class);
    }

    public function grades()
    {
        return $this->hasMany(StudentGrade::class);
    }

    public function progressTracking()
    {
        return $this->hasOne(StudentProgressTracking::class);
    }

    public function graduationEligibility()
    {
        return $this->hasOne(GraduationEligibility::class);
    }

    public function projects()
    {
        return $this->hasMany(GraduationProject::class);
    }

    // Helper methods
    public function getCurrentLevel()
    {
        $credits = $this->total_credits_passed;
        
        if ($credits < 33) return 1; // Freshman
        if ($credits < 66) return 2; // Sophomore
        if ($credits < 102) return 3; // Junior
        return 4; // Senior
    }

    public function recalculateCGPA()
    {
        $gradesData = $this->grades()
            ->where('is_first_attempt', true)
            ->selectRaw('SUM(grade_points * credits) as points_sum, SUM(credits) as total_credits')
            ->first();

        if ($gradesData->total_credits > 0) {
            return $gradesData->points_sum / $gradesData->total_credits;
        }
        
        return 0;
    }

    public function checkDismissal()
    {
        $standing = $this->academicStanding;
        
        // Check warning conditions
        if ($standing->consecutive_warning_count >= 4 || 
            $standing->total_warning_count >= 6) {
            return true;
        }
        
        // Check duration condition
        $semesters = $this->registrations()
            ->distinct('semester_id')
            ->count('semester_id');
        
        if ($semesters > 8) {
            return true;
        }
        
        return false;
    }
}

// Course Model
class Course extends Model
{
    protected $fillable = [
        'faculty_id', 'specialization_id', 'code', 'name_en', 'name_ar',
        'description', 'credit_hours', 'level', 'category_id',
        'is_mandatory', 'min_passing_grade', 'is_active'
    ];

    public function prerequisites()
    {
        return $this->belongsToMany(
            Course::class,
            'course_prerequisites',
            'course_id',
            'prerequisite_course_id'
        )->withPivot('min_grade', 'is_strict', 'logic');
    }

    public function dependents()
    {
        return $this->belongsToMany(
            Course::class,
            'course_prerequisites',
            'prerequisite_course_id',
            'course_id'
        );
    }

    public function studentRegistrations()
    {
        return $this->hasMany(StudentRegistration::class);
    }

    public function schedules()
    {
        return $this->hasMany(CourseSchedule::class);
    }

    public function checkPrerequisites(Student $student)
    {
        foreach ($this->prerequisites as $prereq) {
            $grade = $student->grades()
                ->where('course_id', $prereq->id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$grade || $grade->grade_points < $prereq->pivot->min_grade) {
                return false;
            }
        }
        
        return true;
    }
}

// StudentRegistration Model
class StudentRegistration extends Model
{
    protected $fillable = [
        'student_id', 'semester_id', 'course_id',
        'status', 'registration_date', 'withdrawal_date'
    ];

    protected $casts = [
        'registration_date' => 'datetime',
        'withdrawal_date' => 'datetime'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function grade()
    {
        return $this->hasOne(StudentGrade::class);
    }
}

// StudentGrade Model
class StudentGrade extends Model
{
    protected $fillable = [
        'student_registration_id', 'student_id', 'course_id', 'semester_id',
        'coursework_score', 'midterm_score', 'final_exam_score',
        'total_score', 'grade_letter', 'grade_points',
        'is_first_attempt', 'is_improvement_attempt'
    ];

    protected $casts = [
        'coursework_score' => 'decimal:2',
        'midterm_score' => 'decimal:2',
        'final_exam_score' => 'decimal:2',
        'total_score' => 'decimal:2',
        'grade_points' => 'decimal:2'
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function registration()
    {
        return $this->belongsTo(StudentRegistration::class, 'student_registration_id');
    }

    public function calculateGrade()
    {
        if (is_null($this->total_score)) {
            return null;
        }

        $totalScore = $this->total_score;
        
        // Find matching grade from grading scale
        $grade = GradingScale::where('faculty_id', $this->student->faculty_id)
            ->where('min_percentage', '<=', $totalScore)
            ->where('max_percentage', '>=', $totalScore)
            ->first();

        if ($grade) {
            $this->update([
                'grade_letter' => $grade->grade_letter,
                'grade_points' => $grade->grade_points
            ]);
            
            return $grade;
        }

        return null;
    }
}

// AcademicRule Model - Core for flexibility
class AcademicRule extends Model
{
    protected $fillable = [
        'faculty_id', 'rule_code', 'category', 'title',
        'description', 'rule_type', 'rule_data',
        'is_active', 'effective_from', 'effective_to'
    ];

    protected $casts = [
        'rule_data' => 'json',
        'is_active' => 'boolean',
        'effective_from' => 'date',
        'effective_to' => 'date'
    ];

    public function faculty()
    {
        return $this->belongsTo(Faculty::class);
    }

    public function getValue($key, $default = null)
    {
        return data_get($this->rule_data, $key, $default);
    }
}
```

---

## 4. API ENDPOINTS STRUCTURE

### Student Registration Endpoints

```php
// routes/api.php
Route::prefix('v1')->middleware('auth:api')->group(function () {
    
    // Student Registration
    Route::post('/students/{student}/register', 'StudentRegistrationController@register');
    Route::delete('/students/{student}/deregister/{course}', 'StudentRegistrationController@deregister');
    Route::post('/students/{student}/withdraw', 'StudentRegistrationController@withdraw');
    Route::get('/students/{student}/eligibility', 'StudentRegistrationController@checkEligibility');
    Route::get('/students/{student}/planned-schedule', 'StudentRegistrationController@getPlanningSchedule');
    
    // Courses
    Route::get('/courses', 'CourseController@index');
    Route::get('/courses/{course}/prerequisites', 'CourseController@getPrerequisites');
    Route::get('/courses/{course}/dependents', 'CourseController@getDependents');
    
    // Grades & Academic Standing
    Route::get('/students/{student}/grades', 'GradeController@getStudentGrades');
    Route::get('/students/{student}/academic-standing', 'AcademicStandingController@show');
    Route::post('/students/{student}/recalculate-standing', 'AcademicStandingController@recalculate');
    
    // Graduation & Progress
    Route::get('/students/{student}/graduation-eligibility', 'GraduationController@checkEligibility');
    Route::get('/students/{student}/progress', 'ProgressTrackingController@show');
    
    // Withdrawals
    Route::post('/students/{student}/request-withdrawal', 'WithdrawalController@request');
    Route::post('/students/{student}/approve-withdrawal/{withdrawal}', 'WithdrawalController@approve');
    
    // Admin: Dismissals & Warnings
    Route::post('/students/{student}/issue-warning', 'AcademicStandingController@issueWarning');
    Route::post('/students/{student}/dismiss', 'AcademicStandingController@dismiss');
    
    // Academic Rules Management
    Route::get('/academic-rules', 'AcademicRuleController@index');
    Route::post('/academic-rules', 'AcademicRuleController@store');
    Route::put('/academic-rules/{rule}', 'AcademicRuleController@update');
    
    // Semesters
    Route::get('/semesters', 'SemesterController@index');
    Route::get('/semesters/{semester}/deadlines', 'SemesterController@getDeadlines');
});
```

---

## 5. BUSINESS LOGIC & SERVICES

### Service for Registration Validation

```php
<?php
// app/Services/RegistrationService.php
namespace App\Services;

use App\Models\{Student, Course, Semester, AcademicRule};
use Exception;

class RegistrationService
{
    public function validateRegistration(Student $student, Course $course, Semester $semester)
    {
        $this->checkStudentStatus($student);
        $this->checkPrerequisites($student, $course);
        $this->checkCreditLimits($student, $semester);
        $this->checkRegistrationDeadline($semester);
        $this->checkDuplicateRegistration($student, $course, $semester);
        
        return true;
    }

    private function checkStudentStatus(Student $student)
    {
        if ($student->is_dismissed) {
            throw new Exception("Student is dismissed from faculty");
        }

        if (!$student->is_active) {
            throw new Exception("Student account is inactive");
        }
    }

    private function checkPrerequisites(Student $student, Course $course)
    {
        if (!$course->checkPrerequisites($student)) {
            throw new Exception("Student does not meet course prerequisites");
        }
    }

    private function checkCreditLimits(Student $student, Semester $semester)
    {
        $currentLevel = $student->getCurrentLevel();
        $registeredCredits = $student->registrations()
            ->whereIn('status', ['Registered', 'InProgress'])
            ->where('semester_id', $semester->id)
            ->sum('courses.credit_hours');

        // Get constraints for this level and CGPA
        $constraints = \App\Models\RegistrationConstraint::where(
            'specialization_id',
            $student->specialization_id
        )->where('academic_level', $currentLevel)
            ->where(function ($q) use ($student) {
                $q->whereNull('min_cgpa')
                    ->orWhere('min_cgpa', '<=', $student->cgpa);
            })
            ->where(function ($q) use ($student) {
                $q->whereNull('max_cgpa')
                    ->orWhere('max_cgpa', '>=', $student->cgpa);
            })
            ->first();

        if (!$constraints) {
            throw new Exception("No registration constraints found for student level");
        }

        if ($registeredCredits >= $constraints->max_credits) {
            throw new Exception("Student has reached maximum credit hours for this level");
        }
    }

    private function checkRegistrationDeadline(Semester $semester)
    {
        $deadline = $semester->deadlines()
            ->where('deadline_code', 'registration_open')
            ->first();

        if (!$deadline || now() > $deadline->deadline_date) {
            throw new Exception("Registration deadline has passed");
        }
    }

    private function checkDuplicateRegistration(Student $student, Course $course, Semester $semester)
    {
        $exists = $student->registrations()
            ->where('course_id', $course->id)
            ->where('semester_id', $semester->id)
            ->where('status', 'Registered')
            ->exists();

        if ($exists) {
            throw new Exception("Student is already registered for this course");
        }
    }
}
```

### Grade Calculation Service

```php
<?php
// app/Services/GradeCalculationService.php
namespace App\Services;

use App\Models\{StudentGrade, GradingScale};

class GradeCalculationService
{
    public function calculateFinalGrade(StudentGrade $grade)
    {
        // Validation
        if (is_null($grade->final_exam_score) || $grade->final_exam_score < 30) {
            $grade->update(['grade_letter' => 'F', 'grade_points' => 0]);
            return;
        }

        // Calculate total score
        $courseworkPercent = 0.40; // 40% coursework
        $finalPercent = 0.60; // 60% final exam

        $totalScore = ($grade->coursework_score * $courseworkPercent) + 
                      ($grade->final_exam_score * $finalPercent);

        $grade->update(['total_score' => $totalScore]);

        // Assign grade
        $this->assignGrade($grade);
    }

    private function assignGrade(StudentGrade $grade)
    {
        $scale = GradingScale::where('faculty_id', $grade->student->faculty_id)
            ->where('min_percentage', '<=', $grade->total_score)
            ->where('max_percentage', '>=', $grade->total_score)
            ->first();

        if ($scale) {
            $grade->update([
                'grade_letter' => $scale->grade_letter,
                'grade_points' => $scale->grade_points
            ]);
        }
    }

    public function recalculateStudentGPA(Student $student)
    {
        // Get all grades
        $gradesData = $student->grades()
            ->where('is_first_attempt', true)
            ->join('courses', 'student_grades.course_id', '=', 'courses.id')
            ->selectRaw('SUM(student_grades.grade_points * courses.credit_hours) as points_sum, 
                         SUM(courses.credit_hours) as total_credits')
            ->first();

        if ($gradesData->total_credits == 0) {
            return 0;
        }

        $cgpa = $gradesData->points_sum / $gradesData->total_credits;
        
        $student->update(['cgpa' => round($cgpa, 3)]);
        
        return $cgpa;
    }
}
```

### Academic Standing Service

```php
<?php
// app/Services/AcademicStandingService.php
namespace App\Services;

use App\Models\{Student, StudentAcademicStanding, Semester};

class AcademicStandingService
{
    public function updateStanding(Student $student, Semester $semester)
    {
        $standing = $student->academicStanding()->firstOrCreate([
            'student_id' => $student->id
        ]);

        // Recalculate GPA
        $gpa = app(GradeCalculationService::class)->recalculateStudentGPA($student);
        $standing->update(['gpa' => $gpa, 'cgpa' => $student->cgpa]);

        // Check warning condition
        $minCGPA = 2.0; // From rules
        if ($gpa < $minCGPA && $semester->semester_number > 1) { // Not first semester
            $Standing->increment('total_warning_count');
            $standing->increment('consecutive_warning_count');
            $standing->update(['is_on_warning' => true]);
            
            // Notify student
            event(new StudentWarningIssued($student, $standing));
        } else {
            // Reset consecutive counter if not warning
            $standing->update(['consecutive_warning_count' => 0, 'is_on_warning' => false]);
        }

        // Check dismissal conditions
        $this->checkDismissal($student, $standing);

        // Check honors eligibility
        $this->checkHonorsEligibility($student, $standing);

        return $standing;
    }

    private function checkDismissal(Student $student, StudentAcademicStanding $standing)
    {
        if ($standing->consecutive_warning_count >= 4 || 
            $standing->total_warning_count >= 6) {
            
            $student->update([
                'is_dismissed' => true,
                'dismissal_date' => now(),
                'dismissal_reason' => 'Academic Standing Violation'
            ]);
            
            event(new StudentDismissed($student));
        }
    }

    private function checkHonorsEligibility(Student $student, StudentAcademicStanding $standing)
    {
        $honorsMinCGPA = 3.0;
        $noFailures = $student->grades()->where('grade_letter', 'F')->count() === 0;
        $maxSemesters = 8;

        $semesters = $student->registrations()
            ->distinct('semester_id')
            ->count('semester_id');

        if ($standing->cgpa >= $honorsMinCGPA && $noFailures && $semesters <= $maxSemesters) {
            $standing->update(['is_honors_eligible' => true]);
        }
    }
}
```

---

## 6. VALIDATION RULES ENGINE

### Flexible Rule Checking

```php
<?php
// app/Services/RuleEngineService.php
namespace App\Services;

use App\Models\{AcademicRule, Faculty};

class RuleEngineService
{
    protected $faculty;

    public function __construct(Faculty $faculty)
    {
        $this->faculty = $faculty;
    }

    public function getRule($ruleCode)
    {
        return AcademicRule::where('faculty_id', $this->faculty->id)
            ->where('rule_code', $ruleCode)
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('effective_from')->orWhere('effective_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('effective_to')->orWhere('effective_to', '>=', now());
            })
            ->first();
    }

    public function getNumericRule($ruleCode, $key, $default = null)
    {
        $rule = $this->getRule($ruleCode);
        return $rule ? $rule->getValue($key, $default) : $default;
    }

    public function checkCondition($ruleCode, $student)
    {
        $rule = $this->getRule($ruleCode);
        
        if (!$rule) {
            return false;
        }

        $conditions = $rule->rule_data;
        
        // Custom logic based on rule type
        switch ($rule->category) {
            case 'GPA':
                return $student->cgpa >= $conditions['min_cgpa'] &&
                       $student->cgpa <= $conditions['max_cgpa'];
            
            case 'Registration':
                return $this->checkRegistrationConditions($student, $conditions);
            
            case 'Attendance':
                return $this->checkAttendanceConditions($student, $conditions);
            
            default:
                return true;
        }
    }

    private function checkRegistrationConditions($student, $conditions)
    {
        $registeredCredits = $student->registrations()
            ->where('status', 'Registered')
            ->sum('courses.credit_hours');

        return $registeredCredits <= $conditions['max_credits'] &&
               $registeredCredits >= $conditions['min_credits'];
    }

    private function checkAttendanceConditions($student, $conditions)
    {
        // Check attendance across all courses
        // Return true if meets minimum attendance
        return true;
    }
}
```

---

## 7. SAMPLE IMPLEMENTATION FLOW

### Registration Process Flow

```php
<?php
// app/Http/Controllers/StudentRegistrationController.php
namespace App\Http\Controllers;

use App\Models\{Student, Course, Semester};
use App\Services\{RegistrationService, AcademicStandingService};
use Illuminate\Http\Request;

class StudentRegistrationController extends Controller {
    protected $registrationService;
    protected $standingService;

    public function __construct(
        RegistrationService $registrationService,
        AcademicStandingService $standingService
    ) {
        $this->registrationService = $registrationService;
        $this->standingService = $standingService;
    }

    public function register(Request $request, Student $student)
    {
        try {
            // Get current semester
            $semester = Semester::where('is_active', true)
                ->where('faculty_id', $student->faculty_id)
                ->first();

            if (!$semester) {
                return response()->json([
                    'success' => false,
                    'message' => 'No active semester found'
                ], 400);
            }

            // Validate courses
            $courses = Course::whereIn('id', $request->course_ids)
                ->where('faculty_id', $student->faculty_id)
                ->get();

            // Register each course
            foreach ($courses as $course) {
                $this->registrationService->validateRegistration($student, $course, $semester);
                
                StudentRegistration::create([
                    'student_id' => $student->id,
                    'semester_id' => $semester->id,
                    'course_id' => $course->id,
                    'status' => 'Registered',
                    'registration_date' => now()
                ]);
            }

            // Update student credits
            $totalCredits = $courses->sum('credit_hours');
            $student->increment('total_credits_passed', $totalCredits);

            // Update academic standing
            $this->standingService->updateStanding($student, $semester);

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'registered_courses' => $courses->count(),
                    'total_credits' => $totalCredits,
                    'cgpa' => $student->cgpa
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function checkEligibility(Student $student)
    {
        $standing = $student->academicStanding;
        $graduation = $student->graduationEligibility;

        return response()->json([
            'student_id' => $student->student_id,
            'cgpa' => $student->cgpa,
            'is_on_warning' => $standing->is_on_warning,
            'warning_count' => $standing->total_warning_count,
            'is_dismissed' => $student->is_dismissed,
            'graduation_eligible' => $graduation->is_eligible,
            'credits_remaining' => $graduation->credits_remaining,
            'missing_requirements' => $graduation->missing_requirements
        ]);
    }
}
```

---

## 8. FLEXIBLE RULE CONFIGURATION

To make the system flexible for different universities, store rules in the database:

```json
{
  "rule_code": "REG_MAX_CREDITS_FRESHMAN",
  "category": "Registration",
  "title": "Maximum Credits for Freshman",
  "rule_data": {
    "max_credits": 27,
    "level": 1
  }
}
```

This allows you to update rules without changing code!

---

## Key Features of This Design

✅ **Multi-Tenant**: Multiple universities, faculties, departments  
✅ **Flexible Rules**: Store rules as data, easily updatable  
✅ **Comprehensive**: 25+ tables covering all aspects  
✅ **Scalable**: Proper indexing and relationships  
✅ **Auditable**: Track all changes with audit logs  
✅ **Validated**: Business logic service layer  
✅ **API-First**: RESTful endpoints for all operations  
✅ **Extensible**: Easy to add new rules and features  

---

## Next Steps

1. Create migrations for all 25 tables
2. Build models with relationships
3. Implement all service classes
4. Create API controllers
5. Add comprehensive testing
6. Deploy with proper indexing

