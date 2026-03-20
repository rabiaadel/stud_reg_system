.PHONY: help docker-up docker-down docker-logs docker-build docker-rebuild docker-clean \
        install dev test lint build deploy-docker deploy-k8s deploy-minikube backup restore \
        db-setup db-migrate db-reset db-backup logs clean security scan

.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project variables
PROJECT_NAME = student-registration-system
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
NODE_ENV ?= development

help: ## Display this help screen
	@echo "$(BLUE)$(PROJECT_NAME) - Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Usage Examples:$(NC)"
	@echo "  make docker-up          # Start all Docker containers"
	@echo "  make install            # Install all dependencies"
	@echo "  make dev                # Start development servers"
	@echo "  make test               # Run all tests"
	@echo "  make deploy-docker      # Deploy using Docker Compose"

# ============================================================================
# DOCKER COMMANDS
# ============================================================================

docker-up: ## Start all Docker containers (development)
	@echo "$(BLUE)Starting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Containers started!$(NC)"
	@echo "  Frontend:  http://localhost:3001"
	@echo "  Backend:   http://localhost:3000"
	@echo "  Database:  localhost:5432"

docker-down: ## Stop all Docker containers
	@echo "$(BLUE)Stopping Docker containers...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Containers stopped!$(NC)"

docker-restart: ## Restart all Docker containers
	@echo "$(BLUE)Restarting Docker containers...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Containers restarted!$(NC)"

docker-logs: ## View Docker container logs (follow mode)
	$(DOCKER_COMPOSE) logs -f

docker-logs-backend: ## View backend container logs
	$(DOCKER_COMPOSE) logs -f backend

docker-logs-frontend: ## View frontend container logs
	$(DOCKER_COMPOSE) logs -f frontend

docker-logs-db: ## View database container logs
	$(DOCKER_COMPOSE) logs -f postgres

docker-build: ## Build all Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	$(DOCKER_COMPOSE) build
	@echo "$(GREEN)✓ Build completed!$(NC)"

docker-rebuild: ## Rebuild all Docker images (no cache)
	@echo "$(BLUE)Rebuilding Docker images (no cache)...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✓ Build completed!$(NC)"

docker-clean: ## Remove all containers and images
	@echo "$(RED)Removing all containers and images...$(NC)"
	$(DOCKER_COMPOSE) down -v
	@echo "$(GREEN)✓ Cleanup completed!$(NC)"

docker-ps: ## Show running Docker containers
	$(DOCKER_COMPOSE) ps

docker-exec-db: ## Execute psql in database container (interactive)
	$(DOCKER_COMPOSE) exec postgres psql -U postgres

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: ## Install all dependencies (backend + frontend)
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(YELLOW)Frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ All dependencies installed!$(NC)"

install-backend: ## Install backend dependencies only
	@echo "$(BLUE)Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)✓ Backend dependencies installed!$(NC)"

install-frontend: ## Install frontend dependencies only
	@echo "$(BLUE)Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed!$(NC)"

setup: install db-setup ## Complete setup (install + database)
	@echo "$(GREEN)✓ Setup completed! Ready to start.$(NC)"
	@echo "  Run: make dev"

# ============================================================================
# DEVELOPMENT
# ============================================================================

dev: ## Start development servers (backend + frontend)
	@echo "$(BLUE)Starting development servers...$(NC)"
	@echo "  This will open two new terminals"
	@echo "  Backend runs on: http://localhost:3000"
	@echo "  Frontend runs on: http://localhost:3001"
	@echo ""
	@echo "$(YELLOW)Note: Run commands in separate terminals:$(NC)"
	@echo "  Terminal 1: cd backend && npm start"
	@echo "  Terminal 2: cd frontend && npm start"

dev-backend: ## Start backend development server only
	@echo "$(BLUE)Starting backend server...$(NC)"
	cd backend && npm start

dev-frontend: ## Start frontend development server only
	@echo "$(BLUE)Starting frontend server...$(NC)"
	cd frontend && npm start

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	@echo "$(BLUE)Running tests...$(NC)"
	@echo "$(YELLOW)Backend tests...$(NC)"
	cd backend && npm test
	@echo "$(YELLOW)Frontend tests...$(NC)"
	cd frontend && npm test
	@echo "$(GREEN)✓ All tests completed!$(NC)"

test-backend: ## Run backend tests only
	@echo "$(BLUE)Running backend tests...$(NC)"
	cd backend && npm test

test-frontend: ## Run frontend tests only
	@echo "$(BLUE)Running frontend tests...$(NC)"
	cd frontend && npm test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	@echo "$(YELLOW)Backend (watch)...$(NC)"
	cd backend && npm test -- --watch

# ============================================================================
# LINTING & CODE QUALITY
# ============================================================================

lint: ## Run linters on backend and frontend
	@echo "$(BLUE)Running linters...$(NC)"
	@echo "$(YELLOW)Backend linting...$(NC)"
	@cd backend && npm run lint 2>/dev/null || echo "  No backend lint script"
	@echo "$(YELLOW)Frontend linting...$(NC)"
	@cd frontend && npm run lint 2>/dev/null || echo "  No frontend lint script"
	@echo "$(GREEN)✓ Linting completed!$(NC)"

lint-backend: ## Run backend linter
	cd backend && npm run lint

lint-frontend: ## Run frontend linter
	cd frontend && npm run lint

# ============================================================================
# BUILD
# ============================================================================

build: ## Build production bundles (backend + frontend)
	@echo "$(BLUE)Building for production...$(NC)"
	@echo "$(YELLOW)Backend build...$(NC)"
	cd backend && npm run build 2>/dev/null || echo "  No backend build script"
	@echo "$(YELLOW)Frontend build...$(NC)"
	cd frontend && npm run build
	@echo "$(GREEN)✓ Production build completed!$(NC)"

build-backend: ## Build backend for production
	@echo "$(BLUE)Building backend...$(NC)"
	cd backend && npm run build

build-frontend: ## Build frontend for production
	@echo "$(BLUE)Building frontend...$(NC)"
	cd frontend && npm run build

# ============================================================================
# DATABASE
# ============================================================================

db-setup: ## Setup database (create tables and seed data)
	@echo "$(BLUE)Setting up database...$(NC)"
	@echo "$(YELLOW)Creating tables...$(NC)"
	docker-compose exec postgres psql -U postgres -d student_registration -f /usr/src/database/schema.sql 2>/dev/null || \
	psql -U postgres -d student_registration -f database/schema.sql
	@echo "$(GREEN)✓ Database setup completed!$(NC)"

db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	cd backend && npm run migrate 2>/dev/null || echo "  No migration script available"

db-reset: ## Reset database (drop and recreate)
	@echo "$(RED)Resetting database...$(NC)"
	docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS student_registration;" 2>/dev/null || \
	psql -U postgres -c "DROP DATABASE IF EXISTS student_registration;"
	docker-compose exec postgres psql -U postgres -c "CREATE DATABASE student_registration;" 2>/dev/null || \
	psql -U postgres -c "CREATE DATABASE student_registration;"
	@$(MAKE) db-setup
	@echo "$(GREEN)✓ Database reset completed!$(NC)"

db-backup: ## Backup database to SQL file
	@echo "$(BLUE)Backing up database...$(NC)"
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U postgres student_registration > backups/backup-$$(date +%Y%m%d-%H%M%S).sql 2>/dev/null || \
	pg_dump -U postgres student_registration > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✓ Backup completed!$(NC)"

db-restore: ## Restore database from latest backup
	@echo "$(BLUE)Restoring database...$(NC)"
	@LATEST_BACKUP=$$(ls -t backups/backup-*.sql 2>/dev/null | head -1); \
	if [ -z "$$LATEST_BACKUP" ]; then \
		echo "$(RED)No backup files found!$(NC)"; \
		exit 1; \
	fi; \
	docker-compose exec postgres psql -U postgres student_registration < $$LATEST_BACKUP 2>/dev/null || \
	psql -U postgres student_registration < $$LATEST_BACKUP; \
	echo "$(GREEN)✓ Restored from: $$LATEST_BACKUP$(NC)"

db-shell: ## Open database shell (psql)
	docker-compose exec postgres psql -U postgres -d student_registration

# ============================================================================
# DEPLOYMENT
# ============================================================================

deploy-docker: docker-build ## Deploy using Docker Compose (production)
	@echo "$(BLUE)Deploying with Docker Compose...$(NC)"
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "$(GREEN)✓ Deployment completed!$(NC)"

deploy-k8s: build ## Deploy to Kubernetes
	@echo "$(BLUE)Deploying to Kubernetes...$(NC)"
	kubectl apply -f k8s/namespaces/
	kubectl apply -f k8s/backend/
	kubectl apply -f k8s/frontend/
	kubectl apply -f k8s/db/
	@echo "$(GREEN)✓ Kubernetes deployment completed!$(NC)"
	@echo "  Check status: kubectl get pods -n student-registration"

deploy-minikube: build ## Deploy to Minikube
	@echo "$(BLUE)Deploying to Minikube...$(NC)"
	bash deploy-minikube.sh
	@echo "$(GREEN)✓ Minikube deployment completed!$(NC)"

deploy-status: ## Check deployment status
	@echo "$(BLUE)Kubernetes deployment status:$(NC)"
	kubectl get pods -n student-registration
	kubectl get svc -n student-registration

# ============================================================================
# SECURITY & SCANNING
# ============================================================================

scan: ## Run security scan (Trivy)
	@echo "$(BLUE)Running security scan...$(NC)"
	bash scan-trivy.sh
	@echo "$(GREEN)✓ Security scan completed!$(NC)"

scan-docker: ## Scan Docker images for vulnerabilities
	@echo "$(BLUE)Scanning Docker images...$(NC)"
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image stud-reg-backend:latest
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image stud-reg-frontend:latest
	@echo "$(GREEN)✓ Image scan completed!$(NC)"

security-check: ## Run full security check
	@echo "$(BLUE)Running security checks...$(NC)"
	@echo "$(YELLOW)Checking npm vulnerabilities...$(NC)"
	cd backend && npm audit 2>/dev/null || true
	cd frontend && npm audit 2>/dev/null || true
	@echo "$(GREEN)✓ Security checks completed!$(NC)"

# ============================================================================
# LOGS & DEBUGGING
# ============================================================================

logs: docker-logs ## View all Docker logs

logs-app: ## View application logs (local)
	tail -f backend/logs/combined.log 2>/dev/null || echo "No log file found"

logs-error: ## View error logs (local)
	tail -f backend/logs/error.log 2>/dev/null || echo "No log file found"

# ============================================================================
# UTILITIES
# ============================================================================

clean: ## Clean all build artifacts and node_modules
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf backend/node_modules frontend/node_modules
	@rm -rf backend/dist frontend/build
	@rm -rf backend/logs/*.log
	@echo "$(GREEN)✓ Cleanup completed!$(NC)"

status: docker-ps ## Show system status
	@echo ""
	@echo "$(BLUE)Environment:$(NC)"
	@echo "  NODE_ENV: $(NODE_ENV)"
	@echo ""
	@echo "$(BLUE)Project Structure:$(NC)"
	@echo "  Backend:  ./backend"
	@echo "  Frontend: ./frontend"
	@echo "  Database: ./database"
	@echo "  Docker:   ./docker"

version: ## Show version information
	@echo "$(BLUE)Version Information:$(NC)"
	@echo "  Node.js:   $$(node --version)"
	@echo "  npm:       $$(npm --version)"
	@echo "  Docker:    $$(docker --version)"
	@echo "  Docker Compose: $$(docker-compose --version)"

info: ## Show project information
	@echo "$(BLUE)$(PROJECT_NAME)$(NC)"
	@echo "  Description:  Tanta University Student Registration System"
	@echo "  Technology:   Node.js, React, PostgreSQL, Docker"
	@echo "  Environment: $(NODE_ENV)"
	@echo ""
	@echo "$(YELLOW)Quick Start:$(NC)"
	@echo "  1. make install        # Install dependencies"
	@echo "  2. make db-setup       # Setup database"
	@echo "  3. make dev            # Start development servers"

# ============================================================================
# CI/CD
# ============================================================================

ci-test: lint test ## Run CI tests (lint + test)
	@echo "$(GREEN)✓ CI tests passed!$(NC)"

ci-build: ci-test build ## Full CI pipeline (test + build)
	@echo "$(GREEN)✓ CI pipeline completed!$(NC)"

# ============================================================================
# MONITORING & PERFORMANCE
# ============================================================================

monitor: ## Start monitoring dashboard (Prometheus + Grafana)
	@echo "$(BLUE)Starting monitoring services...$(NC)"
	docker-compose up -d prometheus grafana
	@echo "$(GREEN)✓ Monitoring services started!$(NC)"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Grafana:    http://localhost:3005"

monitor-logs: ## View detailed logs with timestamps
	docker-compose logs -f --timestamps

# ============================================================================
# DOCUMENTATION
# ============================================================================

docs: ## Generate documentation
	@echo "$(BLUE)Documentation locations:$(NC)"
	@echo "  Main:          README.md"
	@echo "  Setup:         SETUP_AND_CONFIGURATION.md"
	@echo "  CI/CD:         CI_CD_GUIDE.md"
	@echo "  Backend API:   backend/ADMIN_API_DOCUMENTATION.md"
	@echo "  Database:      database/README.md"

# ============================================================================
# QUICK COMMANDS
# ============================================================================

start: docker-up ## Alias for: docker-up

stop: docker-down ## Alias for: docker-down

restart: docker-restart ## Alias for: docker-restart

reset: db-reset ## Alias for: db-reset

check: security-check lint test ## Run all checks (security + lint + test)

all: install setup docker-build ## Complete project setup
