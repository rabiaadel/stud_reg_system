# Frontend - Student Registration System

Modern React-based frontend for the University Student Registration System.

## 📋 Overview

This frontend provides a complete user interface for students and administrators to manage course registration, grades, academic standing, and graduation progress.

## 🎯 Features

### Student Features
- **Dashboard**: Overview of academic progress and performance
- **Course Browsing**: Browse available courses with details and prerequisites
- **Course Registration**: Register for courses with eligibility checks
- **Grades Management**: View detailed grades and performance metrics
- **Academic Standing**: Track academic warnings and dismissals
- **Graduation Tracking**: Monitor progress toward graduation
- **Progress Tracking**: View GPA trends and historical performance

### Admin Features
- **Dashboard**: System overview with key statistics
- **Bulk Operations**: Recalculate GPA for all students
- **Notifications**: Send bulk notifications to students
- **Audit Logs**: View system activity and changes
- **Academic Rules**: Manage institutional rules (coming soon)
- **Student Management**: Manage student records (coming soon)

## 🛠️ Tech Stack

- **React 18.2.0** - UI library
- **React Router 6.20.0** - Client-side routing
- **Zustand 4.4.0** - State management
- **Axios 1.6.0** - HTTP client
- **Ant Design 5.11.0** - UI components
- **TailwindCSS 3.4.0** - Styling
- **Chart.js 4.4.0** - Data visualization
- **react-hot-toast 2.4.1** - Notifications

## 📦 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running on http://localhost:3000

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
Create a `.env` file based on `.env.example`:
```bash
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_ENV=development
```

3. **Start development server**
```bash
npm start
```

The application will open at `http://localhost:3001`

## 🏗️ Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.js                    # Main layout with navigation
│   ├── pages/
│   │   ├── LoginPage.js                 # Authentication
│   │   ├── DashboardPage.js             # Student dashboard
│   │   ├── CoursesPage.js               # Course browsing
│   │   ├── RegistrationPage.js          # Course registration
│   │   ├── GradesPage.js                # Grade display
│   │   ├── AcademicStandingPage.js      # Academic status
│   │   ├── GraduationPage.js            # Graduation tracking
│   │   ├── ProgressPage.js              # Progress visualization
│   │   └── AdminDashboard.js            # Admin panel
│   ├── services/
│   │   └── api.js                       # API client with Axios
│   ├── store/
│   │   └── index.js                     # Zustand state management
│   ├── utils/
│   │   └── [utility functions]
│   ├── App.js                           # Main app with routing
│   ├── index.js                         # React root
│   └── index.css                        # Global styles
├── public/
│   ├── index.html                       # HTML template
│   └── [static assets]
├── package.json                         # Dependencies
└── .env.example                         # Environment template
```

## 🔐 Authentication

The application uses JWT-based authentication:

1. **Login**: User credentials sent to `/api/v1/auth/login`
2. **Token Storage**: JWT stored in localStorage as `authToken`
3. **Auto-Injection**: Axios interceptor automatically adds token to requests
4. **Auto-Logout**: Redirects to login on 401 responses
5. **Role-Based Access**: Routes protected by user role (student/admin)

## 🗂️ API Integration

### Service Modules

The `api.js` file provides 7 service modules:

```javascript
// Authentication
authService.login(email, password)
authService.logout()
authService.setToken(token)
authService.getToken()
authService.isAuthenticated()
authService.getCurrentUser()

// Student Management
studentService.getProfile()
studentService.checkEligibility()
studentService.registerCourses(courseIds)
studentService.withdrawCourse(courseId)
studentService.getStudentGrades()
studentService.getAcademicStanding()
studentService.getGraduationEligibility()

// Courses
courseService.getCourses(page, limit)
courseService.getCourseDetails(courseId)
courseService.checkPrerequisites(courseId)

// Semesters
semesterService.getSemesters()
semesterService.getActiveSemester()
semesterService.getSemesterLockedDetails(semesterId)

// Admin
adminService.getDashboardStatistics()
adminService.getAuditLogs()
adminService.recalculateAllGPA()
adminService.sendNotifications(data)
```

### Axios Configuration

- **Base URL**: `http://localhost:3000/api/v1`
- **Timeout**: 10 seconds
- **Request Interceptor**: Adds Authorization header with JWT
- **Response Interceptor**: Handles 401 errors and redirects to login

## 🎨 Styling

### Ant Design
Used for UI components (buttons, forms, tables, modals, etc.)

### TailwindCSS
Used for utility-first styling and responsive layout

### Custom Styles
Global styles in `index.css` with:
- Layout styling
- Container utilities
- Loading states
- Component-specific overrides

## 📊 State Management (Zustand)

### Auth Store
```javascript
useAuthStore()
- user: current user object
- isLoading: loading state
- error: error messages
- isAuthenticated: auth status
- setUser(user): set user data
- login(email, password): authenticate
- logout(): clear auth
```

### Student Store
```javascript
useStudentStore()
- student: student profile data
- grades: student grades array
- academicStanding: academic status
- setStudentGrades(grades): update grades
```

### Course Store
```javascript
useCourseStore()
- courses: available courses
- selectedCourse: current course
- setCourses(courses): update courses
```

### Semester Store
```javascript
useSemesterStore()
- currentSemester: active semester
- semesters: all semesters
- deadlines: semester deadlines
```

## 🧪 Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject configuration (not reversible)
npm run eject
```

### Code Structure Best Practices

- **Components**: Reusable UI components in `components/` directory
- **Pages**: Full-page components in `pages/` directory
- **Services**: API integration in `services/` directory
- **Store**: Global state management in `store/` directory
- **Utils**: Utility functions in `utils/` directory

## 🚀 Production Build

```bash
npm run build
```

Creates optimized production build in `build/` directory.

### Deployment

1. Create production `.env` file with backend URL
2. Build the application
3. Deploy `build/` directory to your hosting service
4. Ensure CORS is properly configured on backend

## 🔍 Troubleshooting

### API Connection Issues
- Verify backend is running on `http://localhost:3000`
- Check `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

### Authentication Issues
- Clear localStorage and try logging in again
- Verify JWT token is being stored in localStorage
- Check backend `/api/v1/auth/login` is working

### Component Issues
- Ensure all imports use named exports or adjust imports
- Check Ant Design and TailwindCSS are properly loaded
- Verify all dependencies are installed

## 📚 Documentation

- [Backend Documentation](../backend/README.md)
- [Database Documentation](../database/README.md)
- [API Endpoints](../backend/API_DOCUMENTATION.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes following code style
3. Test thoroughly
4. Submit pull request

## 📄 License

All rights reserved © 2024 University Student Registration System