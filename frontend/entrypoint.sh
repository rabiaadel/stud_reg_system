#!/bin/bash
# ============================================================================
# Frontend Startup Entrypoint
# Called by Docker container
# Builds and serves production build
# ============================================================================

set -e

echo ""
echo "╔═════════════════════════════════════════════════╗"
echo "║ Student Registration System — Frontend Startup   ║"
echo "╚═════════════════════════════════════════════════╝"
echo ""

# Environment settings
REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:3000/api/v1}
NODE_ENV=${NODE_ENV:-production}

echo "Environment Configuration:"
echo "  NODE_ENV: $NODE_ENV"
echo "  API_URL: $REACT_APP_API_URL"
echo ""

# ──────────────────────────────────────────────────────────────────────────
if [ "$NODE_ENV" = "development" ]; then
  echo "🚀 Starting in DEVELOPMENT mode..."
  echo ""
  npm start
else
  echo "🏗️  Building for PRODUCTION..."
  echo ""
  
  npm run build
  
  if [ ! -d "build" ]; then
    echo "❌ Build failed - no build directory created"
    exit 1
  fi
  
  echo "✅ Build completed successfully"
  echo ""
  echo "🚀 Starting production server (Nginx)..."
  echo ""
  
  # Start Nginx (if running in Docker)
  if command -v nginx &> /dev/null; then
    nginx -g 'daemon off;'
  else
    # Fallback: serve with Node.js
    npx serve -s build -l 3001
  fi
fi
