# Quick-Start Verification Checklist

**Purpose:** Verify that the quick-start script handles all necessary setup steps without conflicts

## Pre-Startup Checklist

- [ ] Docker installed and running (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Node.js and npm installed (`npm --version`)
- [ ] `.env` file exists or `.env.docker` available
- [ ] All three seed files present:
  - [ ] `database/seeds/001_demo_users.sql`
  - [ ] `database/seeds/002_initial_setup.sql`
  - [ ] `database/seeds/003_complete_curriculum.sql`
- [ ] Backend `package.json` has `migrate` and `seed` scripts
- [ ] No conflicting containers from previous runs

---

## Quick-Start Script Verification

### STEP 0: Pre-flight Checks ✅
```bash
$ bash quick-start.sh
✓ Docker installed: Docker version...
✓ Docker Compose installed: docker-compose version...
✓ npm installed: vX.X.X
✓ Docker daemon is running
```

**Verify:**
- [ ] All 5 checks pass
- [ ] No "❌" errors before proceeding
- [ ] Conflicting container warning displays (if applicable)

---

### STEP 1: Environment Setup ✅
```bash
✓ Copying .env.docker → .env (local defaults)
✓ Environment variables configured
```

**Verify:**
- [ ] `.env` file created/exists
- [ ] `DB_PASSWORD` is set
- [ ] `DB_USER`, `DB_NAME` configured

---

### STEP 2: Dependency Installation ✅
```bash
Installing backend dependencies...
✓ Backend dependencies installed

Installing frontend dependencies...
✓ Frontend dependencies installed
```

**Verify:**
- [ ] Neither step shows npm errors
- [ ] `backend/node_modules/` created
- [ ] `frontend/node_modules/` created

---

### STEP 3: Docker Services ✅
```bash
Starting Docker Compose...
Waiting for services to become healthy...
✓ PostgreSQL is healthy
```

**Verify:**
- [ ] `docker-compose up -d --build` completes
- [ ] PostgreSQL health check passes
- [ ] All 6 containers start:
  - [ ] postgres
  - [ ] backend
  - [ ] frontend
  - [ ] prometheus
  - [ ] grafana
  - [ ] trivy

```bash
$ docker ps
CONTAINER ID   IMAGE                          STATUS           NAMES
xxxxx          postgres:16-alpine            healthy          stud-reg-postgres
xxxxx          stud-reg-backend:latest       healthy          stud-reg-backend
xxxxx          stud-reg-frontend:latest      healthy          stud-reg-frontend
xxxxx          prom/prometheus:latest        healthy          stud-reg-prometheus
xxxxx          grafana/grafana:latest        healthy          stud-reg-grafana
xxxxx          aquasec/trivy:latest          running          stud-reg-trivy
```

---

### STEP 4: Database Schema Verification ✅
```bash
Verifying database schema...
✓ Database schema verified
```

**Verify:**
- [ ] No errors connecting to database
- [ ] Tables created successfully

```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "\dt"
```

Should show 40+ tables

---

### STEP 5: Database Migrations ✅
```bash
Running migrations...
✓ Migrations completed
```

**Verify:**
- [ ] No migration errors
- [ ] Migration scripts executed

---

### STEP 6: Database Seeding (3 Phases) ✅

#### Phase 1: Basic Users
```
Phase 1: Basic users (001_demo_users.sql)...
  → Already loaded during database initialization
```

**Verify:**
- [ ] 001_demo_users.sql was mounted during Docker init

#### Phase 2: Initial Setup & Curriculum
```
Phase 2: Running all pending seed files from database/seeds/...
  → Will include: 002_initial_setup.sql & 003_complete_curriculum.sql
```

**Verify:**
- [ ] `npm run seed` executes without critical errors
- [ ] Both 002 and 003 files processed

#### Verification
```
Verifying seed completion...
✓ Seed files verified (3 total)
✓ Curriculum courses verified (found key courses)
✓ Academic rules verified (14 rules found)
```

**Verify counts:**
- [ ] Seed files: 3 total executed
- [ ] Key courses found: CS211, BS113, PR411
- [ ] Academic rules: 12+ (found 14)

```bash
# Manual verification
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system
master_reg_system=# SELECT COUNT(*) FROM courses;
 count
-------
   125
(1 row)

master_reg_system=# SELECT * FROM seed_logs ORDER BY seed_name;
              seed_name              |          seeded_at
-------------------------------------+----------------------------
 001_demo_users.sql                  | 2026-03-20 XX:XX:XX
 002_initial_setup.sql               | 2026-03-20 XX:XX:XX
 003_complete_curriculum.sql         | 2026-03-20 XX:XX:XX

master_reg_system=# SELECT COUNT(*) FROM academic_rules;
 count
-------
    14
(1 row)
```

---

### STEP 7: Demo Data Hardset ✅
```bash
Ensuring demo users exist with correct credentials...
Re-running seeds...
Setting demo user passwords...
✓ Demo users configured
```

**Verify:**
- [ ] No errors during password update
- [ ] Three demo users have passwords set

```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "SELECT email, role FROM users WHERE role IN ('admin', 'doctor', 'student');"
          email           |  role
--------------------------|--------
 admin@university.edu     | admin
 doctor@university.edu    | doctor
 student@university.edu   | student
(3 rows)
```

---

### STEP 8: Service Health Verification ✅
```bash
Checking Backend API...
✓ Backend API is healthy

Checking Frontend...
✓ Frontend is healthy

Database Summary:
  Students:  134000
  Courses:   125
  Users:     3
```

**Verify:**
- [ ] Backend responds to health check
- [ ] Frontend loads index.html
- [ ] Student count is high (100k+)
- [ ] Course count is 100+
- [ ] User count is at least 3

---

### Final Output ✅
```bash
✅ SYSTEM READY!

Access points:
  Frontend:        http://localhost:3001
  Backend API:     http://localhost:3000
  API Docs:        http://localhost:3000/api/v1
  Prometheus:      http://localhost:9090
  Grafana:         http://localhost:3050

Seed Files Loaded:
  ✓ 001_demo_users.sql          - Demo credentials
  ✓ 002_initial_setup.sql        - Institutions, departments, specializations
  ✓ 003_complete_curriculum.sql - Courses, academic rules, prerequisites

Demo Credentials (pre-seeded):
  Admin:    admin@university.edu    / Uni@2026!Admin
  Doctor:   doctor@university.edu   / Uni@2026!Doctor
  Student:  student@university.edu  / Uni@2026!Student
```

**Verify:**
- [ ] All 5 access points listed
- [ ] All 3 seed files confirmed loaded
- [ ] Demo credentials displayed

---

## Post-Startup Verification

### Access Frontend
```bash
$ curl http://localhost:3001/index.html
# Should return HTML without errors
```

**Verify:**
- [ ] Frontend loads at `http://localhost:3001`
- [ ] React app initializes
- [ ] Login page displays

### Access Backend API
```bash
$ curl http://localhost:3000/health
{"status":"healthy"}
```

**Verify:**
- [ ] Backend API responds
- [ ] Health endpoint returns 200

### Access Prometheus
```bash
$ curl http://localhost:9090/-/healthy
```

**Verify:**
- [ ] Prometheus available at `http://localhost:9090`

### Access Grafana
```bash
$ curl http://localhost:3050/api/health
```

**Verify:**
- [ ] Grafana available at `http://localhost:3050`
- [ ] Login with credentials: admin / admin

### Test Login
```bash
$ curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@university.edu","password":"Uni@2026!Student"}'

{"success":true,"token":"eyJ...","user":{"id":"s-xxx","role":"student"}}
```

**Verify:**
- [ ] Login endpoint works
- [ ] JWT token returned
- [ ] Student role assigned

### Check Database
```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system
```

**Verify:**
- [ ] Can connect to database
- [ ] All tables present (40+)
- [ ] Data loaded (students, courses, rules)

---

## Conflict Detection

### Check for Port Conflicts
```bash
$ lsof -i :3000 -i :3001 -i :5432 -i :9090 -i :3050
```

**Should show:**
- [ ] 3000: backend
- [ ] 3001: frontend
- [ ] 5432: postgres
- [ ] 9090: prometheus
- [ ] 3050: grafana

No conflicts or duplicate ports

### Check for Volume Issues
```bash
$ docker volume ls | grep stud-reg
local     stud-reg_grafana_data
local     stud-reg_postgres_data
local     stud-reg_prometheus_data
local     stud-reg_trivy_cache
```

**Verify:**
- [ ] 4 volumes created
- [ ] No orphan volumes

### Check Container Networks
```bash
$ docker network ls | grep stud-reg
```

**Verify:**
- [ ] Network exists: `stud-reg-network`
- [ ] All containers connected

---

## Data Integrity Checks

### Verify Seed File Integrity
```bash
# Check seed_logs table
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "SELECT COUNT(*) FROM seed_logs WHERE seed_name = '003_complete_curriculum.sql';"

 count
-------
     1
(1 row)
```

**Verify:**
- [ ] 003_complete_curriculum.sql marked as seeded

### Verify Course Data
```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "SELECT COUNT(*) FROM courses WHERE code IN ('CS211', 'BS113', 'PR411');"

 count
-------
     3
(1 row)
```

**Verify:**
- [ ] Key curriculum courses loaded

### Verify Academic Rules
```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "SELECT COUNT(*) FROM academic_rules WHERE rule_type = 'CONSTRAINT';"

 count
-------
     8
(1 row)
```

**Verify:**
- [ ] Bylaw rules loaded (8+ constraints)

### Verify Prerequisites
```bash
$ docker-compose exec -T postgres psql -U postgres -d student_registration_system -c "SELECT COUNT(*) FROM course_prerequisites;"

 count
-------
     9
(1 row)
```

**Verify:**
- [ ] 9 prerequisite relationships configured

---

## Conflict Avoidance Summary

✅ **Pre-flight checks** prevent missing dependencies  
✅ **Container cleanup** removes prior run conflicts  
✅ **Service settling** avoids race conditions  
✅ **Health checks** verify readiness  
✅ **Seed verification** confirms all data loaded  
✅ **Password hardset** ensures consistent credentials  
✅ **Database counts** verify expected data  
✅ **Multiple access points** for verification  

---

## Troubleshooting Quick Reference

| Issue | Check | Resolution |
|-------|-------|------------|
| Courses not visible | `COURSE_COUNT > 100` | Check seed logs, re-run `npm run seed` |
| Login fails | `USER_COUNT >= 3` | Verify demo users seeded |
| Port conflict | `lsof -i :3000` | Kill conflicting process or rebuild |
| Database unresponsive | `docker logs postgres` | Check postgres logs, wait longer for health |
| Seed not running | `seed_logs` table | Check backend console for errors |
| Can't connect to DB | Network connectivity | Verify `stud-reg-network` exists |

---

## Sign-Off

- [ ] All 8 steps completed without critical errors
- [ ] All verification checks passed
- [ ] All 3 seed files confirmed loaded
- [ ] Demo credentials working
- [ ] Frontend accessible
- [ ] Backend API responsive
- [ ] Database populated correctly
- [ ] No port/container conflicts

**Status:** ✅ **SYSTEM READY FOR USE**

**Next:**
1. Open http://localhost:3001
2. Login with demo credentials
3. Explore the Student Registration System

---

**Last Updated:** March 20, 2026  
**Version:** 2.0 (Enhanced with 003_complete_curriculum.sql support)
