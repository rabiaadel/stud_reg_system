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
  echo "║  Date: March 19, 2026                                   ║"
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
print_step "STEP 4: Database Migrations"

echo "Running migrations..."
docker-compose exec -T backend npm run migrate

if [ $? -eq 0 ]; then
  echo "✓ Migrations completed"
else
  echo "⚠️  Migrations had issues (continuing...)"
fi

# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 5: Database Seeding"

echo "Running seeds..."
docker-compose exec -T backend npm run seed

if [ $? -eq 0 ]; then
  echo "✓ Seeding completed"
else
  echo "⚠️  Seeding had issues (continuing...)"
fi

# --------------------------------------------------------------------------
print_step "STEP 5A: Ensure demo data is present (force)"

# Force the critical seed files to re-run, then reapply them plus hard-set demo passwords
echo "Forcing demo seed reapply..."
docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" <<'SQL'
DELETE FROM seed_logs WHERE seed_name IN ('001_demo_users.sql','002_initial_setup.sql');
SQL

echo "Re-running seeds..."
docker-compose exec -T backend npm run seed || true

echo "Hard-setting demo user passwords..."
docker-compose exec -T postgres psql -U "${DB_USER:-postgres}" -d "${DB_NAME:-student_registration_system}" <<'SQL'
-- Passwords correspond to:
-- Admin    admin@university.edu    / Uni@2026!Admin
-- Doctor   doctor@university.edu   / Uni@2026!Doctor
-- Student  student@university.edu  / Uni@2026!Student
UPDATE users SET password_hash='$2a$10$FNogMcL09L2XqfaCsEPxA.zvWtac4ma7z6vg60EYGccfQg2E3nUfa' WHERE email='admin@university.edu';
UPDATE users SET password_hash='$2a$10$MNB1PHMlFfvxcw8IZfdHN.FgK.xgYyr/NFCaSe0FOlrq6iNO/RkQW' WHERE email='doctor@university.edu';
UPDATE users SET password_hash='$2a$10$fSA/tvE75foMp6Nzh44er.o5DXuqEfBmxbAOS3pSBSYqj622.Dw46' WHERE email='student@university.edu';
SQL

# --------------------------------------------------------------------------
# ──────────────────────────────────────────────────────────────────────────
print_step "STEP 6: Verification"

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

echo "Useful commands:"
echo ""
echo "  View logs:       docker-compose logs -f backend"
echo "  Stop services:   docker-compose down"
echo "  Restart backend: docker-compose restart backend"
echo "  Database shell:  docker-compose exec postgres psql -U postgres"
echo ""

echo "📝 Demo Credentials (pre-seeded):"
echo "  Admin:    admin@university.edu    / Uni@2026!Admin"
echo "  Doctor:   doctor@university.edu   / Uni@2026!Doctor"
echo "  Student:  student@university.edu  / Uni@2026!Student"
echo ""

echo "Next steps:"
echo "  1. Open http://localhost:3001 in your browser"
echo "  2. Login with one of the credentials above"
echo "  3. Explore the system!"
echo ""
