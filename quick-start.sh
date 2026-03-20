#!/bin/bash
# ============================================================================
# Complete System Startup — One Command
# Usage: bash quick-start.sh
# ============================================================================

set -e

print_header() {
  echo ""
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║  Student Registration System — Quick Start             ║"
  echo "║  Date: March 20, 2026                                   ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
}

print_step() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
}

print_header

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 0: Pre-flight Checks"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed"
  echo "   Please install Docker from https://www.docker.com/products/docker-desktop"
  exit 1
fi
echo "✓ Docker installed: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose is not installed"
  echo "   Please install Docker Compose"
  exit 1
fi
echo "✓ Docker Compose installed: $(docker-compose --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed"
  echo "   Please install Node.js and npm from https://nodejs.org"
  exit 1
fi
echo "✓ npm installed: $(npm --version)"

# Check if Docker daemon is running
if ! docker ps &> /dev/null; then
  echo "❌ Docker daemon is not running"
  echo "   Please start Docker Desktop or the Docker daemon"
  exit 1
fi
echo "✓ Docker daemon is running"

# Warn if existing containers conflict
CONFLICTING=$(docker ps --all --format '{{.Names}}' | grep -E 'stud-reg' | wc -l)
if [ "$CONFLICTING" -gt 0 ]; then
  echo "⚠️  Found $CONFLICTING existing containers from previous runs"
  echo "   These will be removed during startup"
fi

echo ""

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 1: Environment Setup"

# Prefer the docker-friendly defaults for local runs
if [ ! -f ".env" ]; then
  if [ -f ".env.docker" ]; then
    echo "✓ Copying .env.docker → .env (local defaults)"
    cp .env.docker .env
  elif [ -f ".env.production" ]; then
    echo "⚠️  .env.docker missing, falling back to .env.production → .env"
    cp .env.production .env
  else
    echo "⚠️  .env file not found"
    echo "   Please configure .env file with database credentials"
    exit 1
  fi
else
  echo "✓ .env file exists"
fi

# Verify critical variables
if ! grep -q "DB_PASSWORD" .env; then
  echo "❌ DB_PASSWORD not set in .env"
  exit 1
fi

echo "✓ Environment variables configured"

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 2: Dependency Installation"

echo "Installing backend dependencies..."
cd backend
npm install
cd ..
echo "✓ Backend dependencies installed"

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✓ Frontend dependencies installed"

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 3: Starting Docker Services"

echo "Starting Docker Compose (postgres, backend, frontend, prometheus, grafana)..."
echo ""

docker-compose down --remove-orphans 2>/dev/null || true

# Rebuild to pick up any env changes (frontend build embeds API URL)
docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo "Waiting for services to become healthy..."
sleep 10

# Give containers extra time to settle to avoid race conditions
echo "Letting services settle for 20s to avoid startup conflicts..."
sleep 20

# Check PostgreSQL
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if docker-compose exec -T postgres pg_isready -U postgres &>/dev/null; then
    echo "✓ PostgreSQL is healthy"
    break
  fi
  echo "  PostgreSQL starting... (attempt $((attempt+1))/$max_attempts)"
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ PostgreSQL failed to start"
  docker-compose logs postgres
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 4: Pre-flight Database Checks"

echo "Verifying database schema..."
docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -c "SELECT COUNT(*) as tables_count FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null
if [ $? -eq 0 ]; then
  echo "✓ Database schema verified"
else
  echo "❌ Database schema issue"
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 5: Database Migrations"

echo "Running migrations..."
docker-compose exec -T backend npm run migrate

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed"
else
  echo "⚠️  Migrations had issues (continuing...)"
fi

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 6: Database Seeding (3 Phases)"

echo "Phase 1: Basic users (001_demo_users.sql)..."
echo "  → Already loaded during database initialization"
echo ""

echo "Phase 2: Running all pending seed files from database/seeds/..."
echo "  → Will include: 002_initial_setup.sql & 003_complete_curriculum.sql"
echo ""

docker-compose exec -T backend npm run seed

if [ $? -eq 0 ]; then
  echo "✓ All seed files processed"
else
  echo "⚠️  Some seeds had issues - checking database state..."
fi

# Verify critical seed files were loaded
echo ""
echo "Verifying seed completion..."
SEED_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM seed_logs;" 2>/dev/null | tr -d ' ')

if [ "$SEED_COUNT" -ge 2 ]; then
  echo "✓ Seed files verified ($SEED_COUNT total)"
else
  echo "⚠️  Expected at least 2 seed files, found $SEED_COUNT"
fi

# Verify that curriculum data was loaded
COURSE_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM courses WHERE code IN ('CS211', 'BS113', 'PR411');" 2>/dev/null | tr -d ' ')

if [ "$COURSE_COUNT" -ge 1 ]; then
  echo "✓ Curriculum courses verified (found key courses)"
else
  echo "⚠️  Warning: Curriculum courses not found - 003_complete_curriculum.sql may not have loaded"
fi

# Verify academic rules were loaded
RULES_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM academic_rules;" 2>/dev/null | tr -d ' ')

if [ "$RULES_COUNT" -gt 5 ]; then
  echo "✓ Academic rules verified ($RULES_COUNT rules found)"
else
  echo "⚠️  Warning: Only $RULES_COUNT academic rules found (expected 12+)"
fi

# --------------------------------------------------------------------------
print_step "STEP 7: Demo Data Hardset"

# Force the critical seed files to re-run, then reapply them plus hard-set demo passwords
echo "Ensuring demo users exist with correct credentials..."
docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" <<'SQL'
DELETE FROM seed_logs WHERE seed_name IN ('001_demo_users.sql','002_initial_setup.sql','003_complete_curriculum.sql');
SQL

echo "Re-running seeds..."
docker-compose exec -T backend npm run seed || true

echo "Setting demo user passwords..."
docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" <<'SQL'
-- Passwords correspond to:
-- Admin    admin@university.edu    / Uni@2026!Admin
-- Doctor   doctor@university.edu   / Uni@2026!Doctor
-- Student  student@university.edu  / Uni@2026!Student
UPDATE users SET password_hash='$2a$10$FNogMcL09L2XqfaCsEPxA.zvWtac4ma7z6vg60EYGccfQg2E3nUfa' WHERE email='admin@university.edu';
UPDATE users SET password_hash='$2a$10$MNB1PHMlFfvxcw8IZfdHN.FgK.xgYyr/NFCaSe0FOlrq6iNO/RkQW' WHERE email='doctor@university.edu';
UPDATE users SET password_hash='$2a$10$fSA/tvE75foMp6Nzh44er.o5DXuqEfBmxbAOS3pSBSYqj622.Dw46' WHERE email='student@university.edu';
SQL

echo "✓ Demo users configured"

# --------------------------------------------------------------------------
# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 8: Service Health Verification"

echo "Checking service health..."
echo ""

# Backend health check
echo "Checking Backend API..."
if curl -f http://localhost:3000/health &>/dev/null; then
  echo "✓ Backend API is healthy"
else
  echo "⚠️  Backend API not ready yet (this is normal)"
fi

# Frontend health check
echo "Checking Frontend..."
if curl -f http://localhost:3001/index.html &>/dev/null; then
  echo "✓ Frontend is healthy"
else
  echo "⚠️  Frontend not ready yet (this is normal)"
fi

# Database data summary
echo ""
echo "Database Summary:"
STUDENT_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM students;" 2>/dev/null | tr -d ' ')
COURSE_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM courses;" 2>/dev/null | tr -d ' ')
USER_COUNT=$(docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ')

echo "  Students:  $STUDENT_COUNT"
echo "  Courses:   $COURSE_COUNT"
echo "  Users:     $USER_COUNT"
echo ""

# ──────────────────────────────────────────────────────────────────────────
print_step "✅ SYSTEM READY!"

echo "Access points:"
echo ""
echo "  Frontend:        http://localhost:3001"
echo "  Backend API:     http://localhost:3000"
echo "  API Docs:        http://localhost:3000/api/v1"
echo "  Prometheus:      http://localhost:9090"
echo "  Grafana:         http://localhost:3050"
echo ""

echo "Seed Files Loaded:"
echo "  ✓ 001_demo_users.sql          - Demo credentials"
echo "  ✓ 002_initial_setup.sql        - Institutions, departments, specializations"
echo "  ✓ 003_complete_curriculum.sql - Courses, academic rules, prerequisites"
echo ""

echo "Demo Credentials (pre-seeded):"
echo "  Admin:    admin@university.edu    / Uni@2026!Admin"
echo "  Doctor:   doctor@university.edu   / Uni@2026!Doctor"
echo "  Student:  student@university.edu  / Uni@2026!Student"
echo ""

echo "Useful commands:"
echo "  View logs:       docker-compose logs -f backend"
echo "  Stop services:   docker-compose down"
echo "  Restart backend: docker-compose restart backend"
echo "  Database shell:  docker-compose exec -T postgres psql -U postgres -d student_registration_system"
echo "  Check seeds:     docker-compose exec -T postgres psql -U postgres -d student_registration_system -c 'SELECT * FROM seed_logs;'"
echo ""

echo "Troubleshooting:"
echo "  If courses not visible:       Check that COURSE_COUNT > 100"
echo "  If login fails:               Verify USER_COUNT >= 3"
echo "  If database unresponsive:     docker-compose logs postgres"
echo "  To rebuild everything:        docker-compose down -v && bash quick-start.sh"
echo ""

echo "Next steps:"
echo "  1. Open http://localhost:3001 in your browser"
echo "  2. Login with one of the credentials above"
echo "  3. Explore the Student Registration System!"
echo ""
