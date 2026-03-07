# Student Registration System - Backend API

This is the backend API service for the Student Registration System, built with Node.js, Express, and PostgreSQL.

## Overview

The backend provides RESTful APIs for:
- Student registration and management
- Course catalog and prerequisites
- Grade management and GPA calculation
- Academic standing and warnings
- Graduation eligibility checking
- Administrative functions

## Technology Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (to be implemented)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston
- **File Upload**: express-fileupload

## Project Structure

```
backend/
├── config/
│   ├── database.js          # Database connection configuration
│   └── ...
├── controllers/             # Request handlers
│   ├── studentController.js
│   ├── courseController.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── auth.js             # Authentication & authorization
│   ├── errorHandler.js     # Error handling
│   └── notFound.js         # 404 handler
├── routes/                  # API routes
│   ├── index.js            # Main routes
│   ├── studentRoutes.js
│   ├── courseRoutes.js
│   └── ...
├── logs/                    # Application logs
├── server.js                # Application entry point
├── package.json
├── .env                     # Environment variables
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 16 or higher
- PostgreSQL 13 or higher
- npm or yarn

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd stud_reg_system/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy `.env` and update the values:
   ```bash
   cp .env .env.local
   ```

   Update the following variables:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=student_registration_system
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_secure_jwt_secret
   ```

4. **Database Setup:**
   Ensure PostgreSQL is running and the database exists:
   ```sql
   CREATE DATABASE student_registration_system;
   ```

   Run the schema from the database service:
   ```bash
   psql -d student_registration_system -f ../database/schema.sql
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Student Management
- `GET /students/{id}` - Get student profile
- `PUT /students/{id}` - Update student profile
- `GET /students/{id}/eligibility` - Check registration eligibility
- `POST /students/{id}/register` - Register for courses
- `POST /students/{id}/withdraw` - Withdraw from course
- `GET /students/{id}/grades` - Get student grades
- `GET /students/{id}/academic-standing` - Get academic standing

#### Course Management
- `GET /courses` - List available courses
- `GET /courses/{id}` - Get course details
- `GET /courses/{id}/prerequisites` - Check course prerequisites

#### Administrative
- `POST /students/{id}/issue-warning` - Issue academic warning
- `POST /students/{id}/dismiss` - Dismiss student
- `GET /academic-rules` - List academic rules

### Response Format

#### Success Response
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

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "meta": {
    "timestamp": "2024-02-25T10:30:00Z",
    "request_id": "req_abc123def456"
  }
}
```

## Business Logic

### Registration Process
1. **Eligibility Check**: Verify student status, CGPA, and credit limits
2. **Prerequisite Validation**: Ensure all course prerequisites are met
3. **Credit Limit Validation**: Check against academic level constraints
4. **Schedule Conflict Check**: Prevent time conflicts (to be implemented)
5. **Registration**: Create student registrations and update credits

### GPA Calculation
- GPA = Σ(grade_points × credit_hours) / Σ(credit_hours)
- CGPA includes all completed courses
- Semester GPA includes only current semester courses

### Academic Standing
- **Warning**: Issued when GPA < 2.0 (configurable)
- **Dismissal**: After 4 consecutive warnings or 6 total warnings
- **Duration Limit**: Maximum 8 semesters for regular program

### Graduation Requirements
- Minimum 132 credit hours
- Minimum CGPA of 2.0
- All mandatory courses completed
- Project and training requirements met

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: 1000 requests per hour per IP
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **Error Handling**: Secure error responses

## Logging

Application logs are stored in the `logs/` directory:
- `error.log`: Error messages
- `combined.log`: All log levels

## Testing

```bash
npm test
```

## Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "student-registration-api"
```

## Monitoring

- Health check endpoint: `GET /health`
- Database connection monitoring
- Request logging and error tracking
- Performance monitoring (to be implemented)

## Contributing

1. Follow the existing code structure
2. Add comprehensive error handling
3. Include input validation for all endpoints
4. Update documentation for new features
5. Add tests for new functionality

## License

This project is licensed under the MIT License.