# Student Registration System - Database Service

This directory contains the PostgreSQL database schema and related files for the Student Registration System.

## Overview

The database service uses PostgreSQL and contains a comprehensive schema for managing university student registration, academic records, and administrative functions.

## Schema

The database consists of 25+ tables organized into the following categories:

### Core Entities
- **Universities**: Multi-tenant university management
- **Faculties**: Faculty/department management
- **Departments**: Department organization
- **Specializations**: Academic programs

### Academic Structure
- **Semesters**: Academic calendar management
- **Courses**: Course catalog and prerequisites
- **Course Categories**: Course classification
- **Grading Scales**: Grade point systems

### Student Management
- **Students**: Student profiles and academic standing
- **Student Registrations**: Course enrollment tracking
- **Student Grades**: Grade management and GPA calculation
- **Student Academic Standing**: Academic warnings and dismissals

### Administrative Features
- **Academic Rules**: Configurable business rules
- **Registration Constraints**: Enrollment limitations
- **Audit Logs**: System activity tracking
- **Notifications**: Student communication

## Setup Instructions

### Prerequisites
- PostgreSQL 13+ installed
- Database user with creation privileges

### Database Creation

1. Create the database:
```sql
CREATE DATABASE student_registration_system;
```

2. Connect to the database and run the schema:
```bash
psql -d student_registration_system -f schema.sql
```

### Environment Variables

Create a `.env` file in the database directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_registration_system
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

## Key Features

### Multi-Tenant Architecture
- Support for multiple universities and faculties
- Isolated data per faculty with shared infrastructure

### Flexible Rule Engine
- Academic rules stored as JSON in database
- Dynamic rule evaluation without code changes
- Configurable constraints and requirements

### Comprehensive Audit Trail
- All student actions logged
- Grade changes tracked
- Administrative actions recorded

### Academic Standing Management
- Automatic GPA calculation
- Warning and dismissal tracking
- Honors eligibility determination

## Data Seeding

Sample data seeding scripts are available in the `seeds/` directory:

- University and faculty setup
- Course catalog
- Academic rules configuration
- Sample student data

## Backup and Recovery

### Backup
```bash
pg_dump student_registration_system > backup.sql
```

### Restore
```bash
psql -d student_registration_system < backup.sql
```

## Performance Considerations

### Indexes
- Primary keys on all tables
- Foreign key indexes for referential integrity
- Composite indexes for common query patterns
- Partial indexes for active records

### Partitioning
Consider table partitioning for large tables:
- `student_grades` by academic year
- `audit_logs` by date
- `student_registrations` by semester

## Security

### Row Level Security (RLS)
Enable RLS on sensitive tables to ensure faculty-level data isolation.

### Encryption
Sensitive data (national IDs, contact info) should be encrypted at rest.

## Maintenance

### Regular Tasks
- Update statistics: `ANALYZE`
- Vacuum tables: `VACUUM`
- Reindex if needed: `REINDEX`

### Monitoring
- Monitor query performance
- Track table sizes
- Audit log growth

## API Integration

The database is accessed through the backend service using connection pooling and prepared statements for optimal performance.