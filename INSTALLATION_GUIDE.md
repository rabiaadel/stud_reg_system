# Installation Guide

## Complete Setup Instructions for Student Registration System

This guide provides step-by-step instructions to set up the entire Student Registration System locally.

## System Requirements

### Minimum Hardware
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 5GB free
- **Processor**: Dual-core 2.0GHz or better

### Required Software

1. **PostgreSQL 13+**
   - Download: https://www.postgresql.org/download/
   - Version: 13 or higher
   - Windows, macOS, Linux support

2. **Node.js 16+**
   - Download: https://nodejs.org/
   - Version: 16+ (18 LTS recommended)
   - Includes npm

3. **Git** (Optional but recommended)
   - Download: https://git-scm.com/
   - For version control

4. **Text Editor/IDE**
   - VS Code recommended
   - Or any text editor

## Installation Steps

### Phase 1: PostgreSQL Database Setup

#### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer
3. Choose installation directory
4. Set password for `postgres` user (remember this!)
5. Choose port 5432 (default)
6. Select components (include pgAdmin for management)
7. Finish installation

#### macOS
```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
```

#### Verify Installation
```bash
psql --version
```

### Phase 2: Create Database

#### Using pgAdmin (Optional GUI)
1. Open pgAdmin
2. Connect to default server
3. Create new database named `student_registration_system`

#### Using Command Line
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE student_registration_system;

# List databases
\l

# Exit
\q
```

### Phase 3: Import Database Schema

```bash
# Navigate to database directory
cd stud_reg_system/database

# Import schema using psql
psql -U postgres -d student_registration_system -f schema.sql

# Verify tables were created
psql -U postgres -d student_registration_system -c "\dt"
```

### Phase 4: Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Install Node dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings
# For Windows: notepad .env
# For macOS/Linux: nano .env
```

#### Edit Backend .env File
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_registration_system
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_POOL_SIZE=20

# Server
SERVER_PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=change_me_to_random_string_in_production
```

#### Start Backend Server
```bash
# From backend directory
npm start

# You should see:
# ✓ Server running on port 3000
# ✓ Database connected
```

**Backend is now running at:** `http://localhost:3000`

### Phase 5: Frontend Setup

```bash
# Open new terminal window
# Navigate to frontend directory
cd stud_reg_system/frontend

# Install Node dependencies
npm install

# Create .env file
cp .env.example .env
```

#### Edit Frontend .env File
```env
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_ENV=development
```

#### Start Frontend Development Server
```bash
# From frontend directory
npm start

# Browser will automatically open at http://localhost:3001
```

**Frontend is now running at:** `http://localhost:3001`

## Verification

### Backend Health Check
```bash
# In terminal/browser, visit:
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Frontend Check
- Open http://localhost:3001 in browser
- Login page should appear
- No console errors

## Demo Credentials

Use these credentials to test the system:

### Student Account
- Email: `student@university.edu`
- Password: `password123`

### Admin Account
- Email: `admin@university.edu`
- Password: `admin123`

## Common Issues & Solutions

### Issue: PostgreSQL Connection Failed

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions:**
1. Verify PostgreSQL is running:
   - Windows: Check Service status in Services.msc
   - macOS: `brew services list` should show PostgreSQL started
   - Linux: `sudo systemctl status postgresql`

2. Restart PostgreSQL:
   ```bash
   # macOS
   brew services restart postgresql
   
   # Linux
   sudo systemctl restart postgresql
   ```

3. Check connection credentials in `.env` file

### Issue: Port Already in Use

**Error:** `Error: listen EADDRINUSE :::3000`

**Solution:**
1. Find process using port:
   ```bash
   # Linux/macOS
   lsof -i :3000
   
   # Windows (PowerShell)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
   ```

2. Kill process or use different port:
   ```bash
   # In .env, change:
   SERVER_PORT=3001
   ```

### Issue: npm Modules Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: CORS Errors in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify backend .env has correct CORS setting:
   ```env
   CORS_ORIGIN=http://localhost:3001
   ```

2. Restart backend server

3. Clear browser cache and localStorage:
   - F12 → Application → Clear site data

## Advanced Configuration

### Using Different Database

To use remote PostgreSQL database:

1. Edit backend `.env`:
   ```env
   DB_HOST=your.remote.host
   DB_PORT=5432
   DB_NAME=database_name
   DB_USER=username
   DB_PASSWORD=password
   ```

2. Ensure database is initialized with schema:
   ```bash
   psql -h your.remote.host -U username -d database_name -f schema.sql
   ```

### Using Different Ports

Edit appropriate `.env` files:

Backend (.env):
```env
SERVER_PORT=4000
```

Frontend (.env):
```env
REACT_APP_API_URL=http://localhost:4000/api/v1
```

Then update CORS in backend .env if frontend port changes

### Production Configuration

See [Deployment Guide](../README.md#-deployment) for production setup

## Testing the System

### 1. Test Student Registration
1. Login as student
2. Go to "Courses"
3. Browse available courses
4. Go to "Registration"
5. Select courses and register
6. Verify confirmation

### 2. Test Grade Management (Admin)
1. Login as admin
2. Go to admin dashboard
3. Verify statistics
4. Test GPA recalculation

### 3. Test Academic Standing
1. Login as student
2. Go to "Academic Standing"
3. View GPA and warning status
4. View history

## File Structure Verification

After setup, verify this structure exists:

```
stud_reg_system/
├── backend/
│   ├── .env (created from .env.example)
│   ├── node_modules/
│   ├── server.js
│   ├── package.json
│   └── [other files]
│
├── frontend/
│   ├── .env (created from .env.example)
│   ├── node_modules/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── [other files]
│
└── database/
    ├── schema.sql
    └── [other files]
```

## Next Steps

### 1. Backend Development
- Read [Backend README](./backend/README.md)
- Review [API Documentation](./backend/API_DOCUMENTATION.md)
- Check available endpoints

### 2. Frontend Development
- Read [Frontend README](./frontend/README.md)
- Customize UI components
- Add additional pages as needed

### 3. Database Management
- Read [Database README](./database/README.md)
- Set up backups
- Configure access control

### 4. Deployment
- Follow [Deployment Guide](./README.md#-deployment)
- Configure production environment
- Set up monitoring

## Getting Help

### Debug Mode
Enable detailed logging:

```bash
# Backend
NODE_ENV=development node server.js
```

### Check Logs
- Backend logs: `backend/logs/` directory
- Frontend console: Browser F12 → Console tab
- Database: PostgreSQL system logs

### Ask Questions
1. Check README files for each component
2. Review error messages carefully
3. Check API documentation for endpoint issues
4. Review database schema for data-related issues

## Summary

You now have a complete, working Student Registration System with:
- ✅ PostgreSQL database (25+ tables)
- ✅ Node.js/Express backend API (8+ route sets)
- ✅ React frontend application (8+ page components)
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Complete course registration workflow
- ✅ Grade management system
- ✅ Academic standing tracking
- ✅ Admin dashboard

**Ready to start developing?** Continue with component customization and feature enhancement!