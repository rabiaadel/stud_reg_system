#!/bin/bash
# ============================================================================
# Backend Startup Entrypoint
# Called by Docker container
# Sequence: Wait for DB → Migrate → Seed → Start Server
# ============================================================================

set -e

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  Student Registration System — Backend Startup  ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Database connection settings
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-student_registration_system}
DB_USER=${DB_USER:-postgres}

# Timeout configuration
MAX_ATTEMPTS=30
ATTEMPT=0
DELAY=2

# ──────────────────────────────────────────────────────────────────────────
echo "1️⃣  Waiting for PostgreSQL to be ready..."
echo "   (Host: $DB_HOST:$DB_PORT)"
echo ""

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✅ PostgreSQL is reachable"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  echo "   Attempt $ATTEMPT/$MAX_ATTEMPTS - Waiting for database..."
  sleep $DELAY
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo ""
  echo "❌ PostgreSQL failed to start within timeout"
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "2️⃣  Running database migrations..."
echo ""

if npm run migrate; then
  echo "✅ Migrations completed"
else
  echo "❌ Migration failed"
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "3️⃣  Seeding database (idempotent)..."
echo ""

if npm run seed; then
  echo "✅ Seeds applied"
else
  echo "⚠️  Seeding encountered issues (continuing)"
fi

# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "4️⃣  Starting Node.js server..."
echo ""

# Use npm start in production, npm run dev in development
if [ "$NODE_ENV" = "development" ]; then
  echo "📝 Running in DEVELOPMENT mode with nodemon"
  npm run dev
else
  echo "🚀 Running in PRODUCTION mode"
  npm start
fi
