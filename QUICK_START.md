# Quick Start Guide

## ⚡ Get the System Running in 5 Minutes

This guide provides the fastest way to get the entire system up and running.

## 📋 Prerequisites

Before starting, ensure you have installed:
- ✅ PostgreSQL 13+ (https://www.postgresql.org/download/)
- ✅ Node.js 16+ (https://nodejs.org/)
- ✅ Git (optional)

**Verify installation:**
```bash
psql --version    # Should show PostgreSQL 13+
node --version    # Should show v16+
npm --version     # Should show npm installed
```

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Setup Database (1 minute)

```bash
# Create database
createdb -U postgres student_registration_system

# Import schema from stud_reg_system/database/schema.sql
psql -U postgres -d student_registration_system -f stud_reg_system/database/schema.sql

# Verify (should list 25+ tables)
psql -U postgres -d student_registration_system -c "\dt"
```

### Step 2: Setup Backend (2 minutes)

```bash
# Go to backend directory
cd stud_reg_system/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set database password:
# DB_PASSWORD=your_postgres_password

# Start backend
npm start
```

**Expected output:**
```
✓ Server running on port 3000
✓ Database connected successfully
```

### Step 3: Setup Frontend (1 minute)

**Open new terminal window:**

```bash
# Go to frontend directory
cd stud_reg_system/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start frontend
npm start
```

**Browser will automatically open at http://localhost:3001**

### Step 4: Login (30 seconds)

Use demo credentials:
```
Email: student@university.edu
Password: password123
```

### Step 5: Test Features (30 seconds)

1. View Dashboard
2. Browse Courses
3. Register for a Course
4. View Grades
5. Check Academic Standing

---

## 🔗 Access Points

After startup, access the system at:

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:3001 | Open in browser |
| Backend API | http://localhost:3000/api/v1 | For API calls |
| API Docs | See API_DOCUMENTATION.md | Endpoint reference |

---

## 🧪 Quick Test Workflow

### 1. Student Registration
1. Login as student
2. Go to "Courses"
3. Click "Register for Courses" button
4. Select courses from list
5. Click "Register Selected Courses"
6. View confirmation

### 2. View Grades
1. Go to "Grades"
2. See grade table and GPA charts
3. Filter by semester if available

### 3. Check Academic Standing
1. Go to "Academic Standing"
2. View GPA and status
3. Check warning history

### 4. Admin Dashboard (as admin)
1. Login with: `admin@university.edu` / `admin123`
2. Visit `/admin`
3. See system statistics
4. Use admin tools

---

## ⚠️ Troubleshooting - Quick Fixes

### Backend Won't Start
```bash
# Check if port 3000 is in use
# Solution: Change in backend/.env
SERVER_PORT=3001

# OR: Kill process on port 3000
lsof -ti :3000 | xargs kill -9  # macOS/Linux
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process  # Windows
```

### Frontend Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
# Check credentials in backend/.env
# Common issue: Wrong DB_PASSWORD

# Test connection
psql -U postgres -d student_registration_system -c "SELECT 1"
```

### Browser Shows Blank Page
1. Check browser console (F12)
2. Verify backend is running on port 3000
3. Clear localStorage: F12 → Application → Clear site data
4. Refresh page

---

## 📁 What You'll See

### Backend Running
```
✓ Server listening on port 3000
✓ Database connection pool created (20 connections max)
✓ Application ready for requests
```

### Frontend Running
```
✓ Compiled successfully
✓ Local: http://localhost:3001/
✓ Application ready for use
```

### Login Screen
- Email/Password input fields
- Demo credentials displayed
- Beautiful gradient background
- Ready for authentication

---

## 🎯 Next Steps

### Option 1: Explore the System
1. Test all student features
2. Try admin dashboard
3. Explore API endpoints
4. View database schema

### Option 2: Customize
1. Modify colors in tailwind.config.js
2. Change application title
3. Add your institution logo
4. Customize welcome message

### Option 3: Deploy
1. See README.md deployment section
2. Configure production environment
3. Set up SSL certificate
4. Deploy to server

---

## 📚 Further Reading

| Document | Purpose |
|----------|---------|
| README.md | System overview |
| INSTALLATION_GUIDE.md | Detailed setup |
| backend/README.md | Backend info |
| frontend/README.md | Frontend info |
| database/README.md | Database info |
| API_DOCUMENTATION.md | API reference |
| PROJECT_COMPLETION_SUMMARY.md | What's included |

---

## 🔐 Demo Credentials

**Student Account:**
- Email: `student@university.edu`
- Password: `password123`

**Admin Account:**
- Email: `admin@university.edu`  
- Password: `admin123`

---

## ✅ Verification Checklist

After startup, verify:

```
[ ] PostgreSQL running and accessible
[ ] Backend running on port 3000
[ ] Frontend running on port 3001
[ ] Login page visible in browser
[ ] Can login with demo credentials
[ ] Dashboard loads successfully
[ ] No console errors in browser
[ ] API calls working (check Network tab)
```

---

## 🆘 Still Having Issues?

1. **Check INSTALLATION_GUIDE.md** for detailed troubleshooting
2. **Review logs** in backend/logs/ directory
3. **Check browser console** (F12 → Console tab)
4. **Verify all prerequisites** are installed
5. **Ensure ports 3000 and 3001** are available

---

## 💡 Pro Tips

### Development
```bash
# Keep 3 terminals open:
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Utility (postgres, git, etc)
```

### Database Backup
```bash
# Backup database
pg_dump -U postgres student_registration_system > backup.sql

# Restore database
psql -U postgres student_registration_system < backup.sql
```

### View Logs
```bash
# Backend logs
tail -f backend/logs/*.log

# Database query logs
tail -f /var/log/postgresql/postgresql.log (Ubuntu)
```

---

## 🎉 Ready to Go!

You're all set! The Student Registration System is now running and ready for:
- ✅ Testing
- ✅ Customization
- ✅ Development
- ✅ Deployment

**Enjoy using the system!** 🚀

For any questions, refer to the comprehensive documentation files included with the project.