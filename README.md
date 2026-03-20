# 🎓 Student Registration System (FCITU)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/node-v20-brightgreen.svg?style=for-the-badge)
![React](https://img.shields.io/badge/react-18.2-61dafb.svg?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-containerized-2496ed.svg?style=for-the-badge)

**✨ A Production-Ready Full-Stack University Management Platform ✨**

> Built by a **DevOps Engineer** 👨‍💻 pursuing full-stack excellence  
> For **Faculty of Computers and Information, Tanta University**  
> كلية حاسبات ومعلومات جامعه طنطا

</div>

---

<div align="center">

### 🔗 Connect With Me

[![GitHub](https://img.shields.io/badge/-GitHub-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/rabiaadel?tab=repositories)
[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/rabia-adel-49b3b6310/)

</div>

---

## 📖 About This Project

<details open>
<summary><b>✨ What Makes This Special?</b></summary>

This is a **complete, production-ready student registration system** built from the ground up by a DevOps engineer transitioning into full-stack development. The goal was to create a comprehensive platform that demonstrates:

- 🏗️ **DevOps best practices** — Infrastructure as Code, containerization, monitoring
- 🚀 **Modern architecture** — Clean separation of concerns, scalable design
- 🔐 **Security-first approach** — JWT auth, bcrypt hashing, rate limiting, CORS
- 📊 **Real-world observability** — Prometheus metrics, Grafana dashboards, structured logging
- 🎯 **High availability** — Health checks, auto-restart, persistent storage
- 💯 **Code quality** — Linting, testing, comprehensive error handling

Every component is **containerized**, **monitored**, and **designed for high availability**—because **excellence demands more than just code**. ⭐

</details>

---

## ⚡ Quick Start (One Command!)

```bash
bash quick-start.sh
```

<div align="center">

### 🚀 This Single Command Does Everything:

| Step | Action | Status |
|------|--------|--------|
| 🔧 | Setup environment variables | ✅ Auto |
| 📦 | Install all dependencies | ✅ Auto |
| 🐳 | Build Docker images | ✅ Auto |
| 🚀 | Start all services | ✅ Auto |
| 🗄️ | Initialize database | ✅ Auto |
| 🔄 | Run migrations | ✅ Auto |
| 🌱 | Seed demo data | ✅ Auto |
| ✔️ | Verify health | ✅ Auto |

</div>

**Then open**: 🌐 **http://localhost:3001**

> The script automatically copies `.env.docker` → `.env` with sensible local defaults

---

## 🔑 Demo Credentials (Pre-Seeded)

<div align="center">

### Test the System Instantly with Pre-Loaded Accounts

</div>

| 👤 Role | 📧 Email | 🔐 Password | 🎯 Purpose |
|:---:|:---|:---|:---|
| 🛡️ **Admin** | `admin@university.edu` | `Uni@2026!Admin` | Full system control, user management |
| 👨‍🏫 **Doctor** | `doctor@university.edu` | `Uni@2026!Doctor` | Faculty dashboard, grade entry |
| 🎓 **Student** | `student@university.edu` | `Uni@2026!Student` | Course registration, grade viewing |

---

## 🏗️ Architecture Overview

<details open>
<summary><b>📐 System Design (3-Tier Architecture)</b></summary>

```
┌──────────────────────────────────────────────────────────────┐
│  🌐 PRESENTATION LAYER (Frontend)                            │
│  React 18 + Tailwind + Ant Design                            │
│  Port 3001 via Nginx Reverse Proxy                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    HTTP/REST
                  (JSON + JWT Auth)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  ⚙️ APPLICATION LAYER (Backend API)                          │
│  Express.js + Node.js v20                                    │
│  Port 3000                                                   │
│                                                               │
│  Features:                                                   │
│  ✅ JWT Authentication           ✅ Rate Limiting            │
│  ✅ Security Headers             ✅ Compression              │
│  ✅ Input Validation             ✅ Error Handling           │
│  ✅ Request Logging              ✅ Prometheus Metrics       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    SQL Protocol
                  (Connection Pool)
                         │
┌────────────────────────▼─────────────────────────────────────┐
│  🗄️  DATABASE LAYER                                          │
│  PostgreSQL 16-Alpine                                        │
│  Port 5432                                                   │
│                                                               │
│  Features:                                                   │
│  ✅ ACID Transactions            ✅ Relational Schema        │
│  ✅ Volume Persistence           ✅ Health Checks            │
│  ✅ Indexed Queries              ✅ Automatic Backups        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  📊 MONITORING & OBSERVABILITY STACK                         │
│                                                               │
│  Prometheus (http://localhost:9090)      Metrics Collector   │
│  Grafana    (http://localhost:3050)      Dashboard Viz       │
│  Trivy                                    Security Scanner    │
└──────────────────────────────────────────────────────────────┘
```

</details>

---

## 🎨 Dashboard Overview

Your system includes **6 comprehensive Grafana dashboards**:

<div align="center">

| Dashboard | 📊 Purpose | 🔗 Access | Updates |
|:---|:---|:---:|:---:|
| 🎯 **Student Performance** | GPA trends, academic standing | `:3050` | 30s |
| 📚 **Enrollment Analytics** | Course capacity, enrollment rates | `:3050` | 1m |
| 🔌 **API Performance** | Response times, error rates, endpoints | `:3050` | 30s |
| 💻 **System Health** | Memory, CPU, uptime, connections | `:3050` | 30s |
| 🏫 **Academic Affairs** | Student levels, graduation progress | `:3050` | 1m |
| ⚠️ **Alert Rules** | Configurable thresholds & actions | File | - |

</div>

> **All dashboards auto-refresh** and include detailed legends, percentiles, and real-time metrics

---

## 🛠️ Technology Stack

<details open>
<summary><b>📦 Complete Technology Breakdown</b></summary>

### **🌐 Frontend**
- **React 18** — Modern UI framework with hooks and functional components
- **React Router v6** — Client-side routing with nested routes
- **Tailwind CSS 3.4** — Utility-first styling with responsive design
- **Ant Design 5.11** — Enterprise component library for complex UIs
- **Zustand 4.4** — Lightweight state management (no Redux boilerplate)
- **Axios** — HTTP client with interceptors for auth tokens
- **Chart.js + react-chartjs-2** — Data visualization for analytics
- **date-fns** — Lightweight date utilities
- **jwt-decode** — Client-side JWT parsing
- **react-hot-toast** — Toast notifications for UX feedback

### **⚙️ Backend API**
- **Express.js 4.18** — Lightweight, unopinionated HTTP framework
- **Node.js 20 (Alpine)** — Runtime optimized for containers
- **PostgreSQL 16** — ACID-compliant relational database
- **node-postgres (pg)** — Native PostgreSQL driver
- **Helmet** — Security headers & XSS protection
- **express-rate-limit** — DDoS & brute-force mitigation
- **CORS** — Cross-Origin Resource Sharing with flexible origins
- **express-validator** — Input validation & sanitization
- **bcryptjs** — Password hashing (with salt rounds)
- **jsonwebtoken** — JWT generation & verification (7-day expiry)
- **express-fileupload** — Document uploads with 5MB limit
- **Winston** — Structured logging to files & console
- **prom-client** — Prometheus metrics export
- **compression** — gzip response compression
- **uuid** — Unique ID generation for records

### **🗄️ Database**
- **PostgreSQL 16-Alpine** — Minimal, production-grade image
- **Docker Named Volumes** — Persistent data storage
- **SQL Migrations** — Version-controlled schema changes
- **Seeding Scripts** — Initial demo data population
- **Health Checks** — Automated readiness probes

### **🐳 Containerization & Orchestration**
- **Docker** — Multi-stage builds for optimized images
- **Docker Compose** — Local development orchestration
- **Docker Networks** — Isolated `stud-reg-network` bridge
- **Volume Mounts** — Database persistence & log collection

### **📊 Monitoring & Observability**
- **Prometheus 2.x** — Time-series metrics collection
- **Grafana** — Dashboard visualization & alerting
- **Trivy** — Container image vulnerability scanning

### **🔐 Security & Quality**
- **bcryptjs** — Secure password hashing (10 salt rounds)
- **Helmet.js** — 15+ security headers configured
- **CORS Whitelist** — Origin validation
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **Input Validation** — express-validator on all endpoints
- **Request Logging** — Per-request unique IDs (X-Request-ID)
- **Non-root User** — Containers run as `nodejs:nodejs` (uid 1001)

</details>

---

## 📦 Project Structure

<details open>
<summary><b>🗂️ Complete Directory Layout</b></summary>

```
stud_reg_system/
│
├── 📄 docker-compose.yml          # Local development orchestration
├── 📄 docker-compose.prod.yml     # Production overrides
├── 📄 Dockerfile.backend           # Multi-stage Node.js build
├── 📄 Dockerfile.frontend          # Multi-stage React + Nginx build
├── 📄 Dockerfile.db                # PostgreSQL with init scripts
├── 📄 quick-start.sh               # One-command startup automation
├── 📄 Makefile                     # Development tasks & shortcuts
├── 📄 .env.example                 # Environment variable template
├── 📄 .env.docker                  # Local defaults for quick-start
│
├── 📁 backend/                    # Express.js API Server
│   ├── 📄 server.js               # Express app initialization
│   ├── 📄 package.json            # Dependencies & scripts
│   ├── 📄 entrypoint.sh           # Container startup script
│   │
│   ├── 📁 config/                 # Configuration modules
│   │   ├── database.js            # PostgreSQL connection pool
│   │   ├── config.js              # App settings from .env
│   │   └── logger.js              # Winston logger setup
│   │
│   ├── 📁 routes/                 # API endpoint definitions
│   │   ├── authRoutes.js          # /auth (login, register, refresh)
│   │   ├── studentRoutes.js       # /students (profile, registration)
│   │   ├── coursesRoutes.js       # /courses (catalog, scheduling)
│   │   ├── registrationRoutes.js  # /registration (enrollment)
│   │   ├── gradeRoutes.js         # /grades (results, transcripts)
│   │   ├── instructorRoutes.js    # /instructors (faculty data)
│   │   ├── adminRoutes.js         # /admin (user management)
│   │   ├── adminManagementRoutes.js # /admin/management (advanced)
│   │   ├── semesterRoutes.js      # /semesters (academic calendar)
│   │   ├── academicRulesRoutes.js # /academic-rules (bylaws)
│   │   └── publicRoutes.js        # /public (no auth required)
│   │
│   ├── 📁 controllers/            # Business logic handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── courseController.js
│   │   └── ... (one per domain)
│   │
│   ├── 📁 middleware/             # Express middleware
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── errorHandler.js        # Global error handling
│   │   ├── notFound.js            # 404 responses
│   │   ├── requestContext.js      # Request ID & logger injection
│   │   └── roleCheck.js           # Role-based access control
│   │
│   ├── 📁 services/               # Data access & business logic
│   │   ├── studentService.js
│   │   ├── registrationService.js
│   │   └── ... (reusable functions)
│   │
│   ├── 📁 validators/             # Input validation rules
│   │   ├── authValidator.js
│   │   ├── studentValidator.js
│   │   └── ...
│   │
│   ├── 📁 scripts/                # Database & utility scripts
│   │   ├── migrate.js             # Run pending migrations
│   │   ├── seed.js                # Load demo data
│   │   └── reset-db.js            # Wipe & reinitialize
│   │
│   ├── 📁 jobs/                   # Cron jobs & async tasks
│   │   └── (scheduled processes)
│   │
│   ├── 📁 utils/                  # Helper functions
│   │   ├── tokenUtils.js
│   │   ├── dateUtils.js
│   │   └── ...
│   │
│   └── 📁 tests/                  # Jest unit & integration tests
│       └── (test suites)
│
├── 📁 frontend/                   # React Web Application
│   ├── 📄 package.json            # Dependencies & scripts
│   ├── 📄 tailwind.config.js      # Tailwind customization
│   ├── 📄 postcss.config.js       # PostCSS pipeline
│   ├── 📄 entrypoint.sh           # Container startup
│   │
│   ├── 📁 public/                 # Static assets
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   └── 📁 src/                    # React components & logic
│       ├── 📄 App.js              # Root component
│       ├── 📄 index.js            # React DOM render
│       ├── 📄 index.css           # Global styles
│       │
│       ├── 📁 pages/              # Full-page components (route handlers)
│       │   ├── LoginPage.js       # Authentication
│       │   ├── SignupPage.js      # Registration
│       │   ├── DashboardPage.js   # Student dashboard
│       │   ├── AdminDashboard.js  # Admin panel
│       │   ├── DoctorDashboard.js # Faculty dashboard
│       │   ├── RegistrationPage.js # Course enrollment
│       │   ├── GradesPage.js      # Grade reporting
│       │   ├── CoursesPage.js     # Course catalog
│       │   ├── ProgressPage.js    # Academic progress
│       │   └── GraduationPage.js  # Graduation status
│       │
│       ├── 📁 components/         # Reusable React components
│       │   ├── Header.js
│       │   ├── Sidebar.js
│       │   ├── FormField.js
│       │   └── ... (UI building blocks)
│       │
│       ├── 📁 pages/admin/        # Admin-specific pages
│       ├── 📁 pages/doctor/       # Faculty-specific pages
│       ├── 📁 pages/student/      # Student-specific pages
│       ├── 📁 pages/shared/       # Role-independent components
│       │
│       ├── 📁 services/           # API client functions
│       │   └── api.js             # Axios instance with auth interceptor
│       │
│       ├── 📁 store/              # Zustand state management
│       │   ├── authStore.js       # User & auth state
│       │   ├── registrationStore.js
│       │   └── ...
│       │
│       ├── 📁 context/            # React Context (if used)
│       ├── 📁 hooks/              # Custom React hooks
│       ├── 📁 utils/              # Helper functions
│       └── 📁 constants/          # Hardcoded values
│
├── 📁 database/                   # Database schema & migrations
│   ├── 📄 schema.sql              # Tables, columns, relations
│   ├── 📄 enhancements.sql        # Indexes, constraints, views
│   ├── 📄 migrations/             # Version-controlled changes
│   │   └── 001_initial_schema.sql
│   │
│   ├── 📁 seeds/                  # Initial data
│   │   └── 001_demo_users.sql     # Pre-loaded accounts
│   │
│   └── 📁 db-extracted/           # Backup exports
│
├── 📁 docker/                     # Docker-specific configs
│   ├── 📄 nginx.conf              # Frontend Nginx reverse proxy
│   ├── 📄 prometheus.yml          # Metrics scrape targets
│   ├── 📄 trivy-reports/          # Security scan results
│   │
│   └── 📁 grafana/                # Dashboard & datasource configs
│       ├── 📄 datasource.yaml     # Prometheus connection
│       ├── 📄 dashboards.yaml     # Dashboard provisioning
│       └── 📁 dashboards/         # Dashboard JSON definitions
│
├── 📁 k8s/                        # Kubernetes manifests (not yet in scope)
│   └── (Not covered in this README)
│
└── 📁 .github/                    # GitHub configuration
    └── workflows/                 # (CI/CD - not yet in scope)
```

---

## 🚀 Running the System

### **Option 1: Automated Setup (Recommended)**

```bash
# From project root
bash quick-start.sh
```

This handles **everything**: environment setup, dependency installation, Docker builds, database initialization, and health verification.

### **Option 2: Manual Docker Compose**

```bash
# Install dependencies (optional - Docker handles this)
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start all services
docker-compose up -d

# Watch logs (all containers)
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

### **Option 3: Local Development (No Docker)**

#### Backend Setup
```bash
cd backend
npm install
cp ../.env.docker .env  # Use provided defaults
npm run migrate          # Initialize schema
npm run seed            # Load demo data
npm run dev             # Starts on localhost:3000
```

#### Frontend Setup (in new terminal)
```bash
cd frontend
npm install
npm start               # Starts on localhost:3001
```

#### Database Requirements (if not using Docker)
- PostgreSQL 16+
- Create database: `student_registration_system`
- Run migrations: `psql -U postgres -d student_registration_system -f database/schema.sql`

---

## 📋 Service Endpoints & Access

Once running, access all services:

| Service       | URL                              | Purpose                          |
|---------------|----------------------------------|----------------------------------|
| Frontend      | http://localhost:3001            | Student/Admin/Faculty UI         |
| Backend API   | http://localhost:3000/api/v1     | REST API with JWT auth           |
| API Health    | http://localhost:3000/health     | Backend readiness check          |
| Metrics       | http://localhost:3000/metrics    | Prometheus-format metrics        |
| Prometheus    | http://localhost:9090            | Metrics database & explorer      |
| Grafana       | http://localhost:3050            | Dashboard visualizations         |

> **Grafana Credentials**: Admin / Admin (default, change in production)

---

## 🔧 Configuration & Environment

### Environment Variables

Create or edit `.env` in project root:

```bash
# DATABASE
DB_HOST=postgres              # Container DNS name (or localhost)
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres          # CHANGE IN PRODUCTION!
DB_NAME=student_registration_system

# BACKEND
NODE_ENV=development          # or 'production'
BACKEND_PORT=3000
JWT_SECRET=your-secret-key    # Generate random 32+ char string
JWT_EXPIRY=7d                 # Token expiration time
API_RATE_LIMIT=100            # Requests per 15 minutes
CORS_ORIGINS=http://localhost:3001,http://localhost:3000
LOG_LEVEL=info                # debug, info, warn, error

# FRONTEND
FRONTEND_PORT=3001
REACT_APP_API_URL=/api/v1     # Backend API base path
REACT_APP_ENV=development

# MONITORING
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin        # CHANGE IN PRODUCTION!
PROMETHEUS_RETENTION=15d      # Metric retention period
```

### Using `.env` Files for Different Environments

```bash
# Development (auto-loaded by docker-compose)
source .env.docker && docker-compose up

# Production (if .env.production exists)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🐳 Docker & Containerization

### Service Container Images

All images are **multi-stage builds** for minimal size:

#### **Backend** (`Dockerfile.backend`)
- **Base**: `node:20-alpine` (100MB)
- **Optimization**: 
  - Dependencies installed in builder stage
  - Only `node_modules` and source copied to runtime
  - Non-root user (nodejs:nodejs)
  - Health checks enabled
- **Size**: ~325MB final image

#### **Frontend** (`Dockerfile.frontend`)
- **Builder Stage**: `node:20-alpine` (builds React)
- **Runtime Stage**: `nginx:1.27-alpine` (serves static files, 25MB)
- **Optimization**:
  - Build artifacts not included in final image
  - Nginx configured for SPA routing
  - Health checks with wget
- **Size**: ~55MB final image

#### **Database** (`Dockerfile.db`)
- **Base**: `postgres:16-alpine` (150MB)
- **Features**:
  - Auto-initialization scripts in `/docker-entrypoint-initdb.d/`
  - Schema, enhancements, and seeds applied on first run
  - Volume-based persistence
  - Health checks with `pg_isready`

### Docker Compose Features

**Networking**: Custom bridge network (`stud-reg-network`)
- Services can reference each other by container name
- Isolated from other containers on host
- Subnet: `172.28.0.0/16`

**Health Checks**: All services include health probes
- **Postgres**: `pg_isready` every 10s
- **Backend**: HTTP GET to `/health` every 30s
- **Frontend**: wget to `/index.html` every 30s
- **Prometheus**: HTTP GET to `/-/healthy` every 30s
- **Grafana**: HTTP GET to `/api/health` every 30s

**Volumes**:
```yaml
postgres_data       # PostgreSQL data persistence
prometheus_data     # Metrics storage (15-day retention)
grafana_data        # Dashboard configurations
trivy_cache         # Vulnerability scan cache
./backend/logs      # Application logs (host mount)
./database          # SQL scripts (host mount)
```

**Restart Policies**: `unless-stopped`
- Services auto-restart if they crash
- Respects manual `docker-compose down`

**Logging**: JSON file driver with rotation
- Max size: 10MB per file
- Max files: 3 (keeps 30MB per service)
- Prevents disk space exhaustion

### Building Images Locally

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache

# View images created
docker images | grep stud-reg
```

### Pushing to Registry (Manual)

```bash
# Tag image
docker tag stud-reg-backend:latest your-registry/stud-reg-backend:v1.0.0

# Push to Docker Hub or private registry
docker push your-registry/stud-reg-backend:v1.0.0
```

---

## 🗄️ Database Schema Overview

### Core Tables

**users**
- `user_id` (PK, auto-increment)
- `email` (UNIQUE, indexed)
- `password_hash` (bcrypt)
- `role` (admin, doctor, student)
- `first_name_en`, `first_name_ar`
- `last_name_en`, `last_name_ar`
- `phone`, `national_id`
- `created_at`, `updated_at`
- Status: active, inactive, pending

**students**
- `student_id` (PK, FK to users)
- `academic_level` (1-4)
- `specialization_id` (FK)
- `admission_year`
- `admission_type` (regular, transfer, special)
- GPA, progress, standing

**courses**
- `course_id` (PK)
- `code` (UNIQUE, e.g., "CS101")
- `name_en`, `name_ar`
- `credit_hours` (3-4 typical)
- `prerequisite_id` (self-referential FK)
- `semester_id` (when offered)
- Instructor assignments

**enrollments** (Junction)
- `enrollment_id` (PK)
- `student_id` (FK)
- `course_id` (FK)
- `semester_id` (FK)
- Grade when completed
- Status: enrolled, dropped, completed

**grades**
- `grade_id` (PK)
- `enrollment_id` (FK)
- `homework_score`, `midterm_score`, `final_score`
- `calculated_grade` (A-F)
- `gpa_points` (4.0 scale)

**instructors**
- `instructor_id` (PK, FK to users)
- `department`
- `specialization`
- Assigned courses (M:M with courses)

**semesters**
- `semester_id` (PK)
- `code` (e.g., "2025-Spring")
- `start_date`, `end_date`
- Registration deadlines
- Status: upcoming, active, closed

**account_requests**
- Pending registrations awaiting admin approval
- Tracks status and reason if denied

### Indexes for Performance
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_grades_enrollment_id ON grades(enrollment_id);
```

---

## 🔐 Security Implementation

### Authentication & Authorization

**JWT (JSON Web Tokens)**
- Issued on login valid for 7 days
- Signed with `HS256` algorithm
- Payload includes: `user_id`, `email`, `role`, `iat`, `exp`
- Verified on every protected endpoint

**Password Security**
- Hashed with bcryptjs (10 salt rounds)
- Never stored in plaintext
- Can't be recovered, only reset

**Role-Based Access Control (RBAC)**
- Three roles: `admin`, `doctor` (faculty), `student`
- Middleware enforces on protected routes
- Each endpoint specifies required role(s)

**Request Security**

| Layer         | Implementation                                    |
|---------------|--------------------------------------------------|
| HTTPS         | TLS in production (Nginx termination)            |
| CORS          | Whitelist by origin, credentials allowed         |
| Rate Limit    | 100 requests per 15-min per IP                    |
| Input Valid   | express-validator on all endpoints                |
| SQL Injection | Parameterized queries (pg library)                |
| XSS           | Helmet CSP headers + React escaping               |
| CSRF          | SameSite cookies in production                    |

**Helmet Security Headers**
```
Strict-Transport-Security: max-age=31536000
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### Container Security

- **Non-root User**: Containers run as `nodejs:nodejs` (uid 1001)
- **Read-only Filesystem**: Can be enforced in production
- **No Secrets in Images**: All sensitive data via environment variables
- **Vulnerability Scanning**: Trivy included for image analysis

---

## 📊 Monitoring & Observability

### Prometheus Metrics

The backend exports metrics in Prometheus format at `/metrics`:

**Application Metrics**:
- `http_request_duration_seconds` — Response times by endpoint
- `http_request_total` — Total requests by method/path/status
- `database_query_duration` — SQL execution time
- `registered_users_total` — User count by role

**System Metrics** (auto-collected):
- `nodejs_memory_usage_bytes` — Heap size, RSS
- `nodejs_active_handles` — Open connections
- `process_cpu_seconds_total` — CPU usage

### Grafana Dashboards

Access at **http://localhost:3050**

Pre-configured dashboards:
- **System Health**: Backend uptime, memory, CPU
- **Request Performance**: p50/p95/p99 latencies
- **Student Metrics**: Registration trends, enrollment stats
- **Error Rate**: 4xx/5xx by endpoint
- **Database Performance**: Query times, connection pool

**Default Credentials**: `admin` / `admin`

### Prometheus Storage

- **Local Storage**: Time-series data in `prometheus_data` volume
- **Retention**: 15 days (configurable via `docker-compose.yml`)
- **Scrape Interval**: 15 seconds (backend `/metrics`)
- **Query Language**: PromQL for custom queries

### Logging

**Backend Logs** (Winston):
- **Console**: JSON format with timestamp, level, message
- **File**: `backend/logs/app.log` (rotating)
- **Per-Request**: Unique ID (X-Request-ID) for tracing
- **Levels**: debug, info, warn, error

**Access Logs**:
```json
{
  "timestamp": "2026-03-20T10:30:45.123Z",
  "level": "info",
  "method": "POST",
  "path": "/api/v1/auth/login",
  "status": 200,
  "duration": "45ms",
  "userId": 1,
  "ip": "172.28.0.1"
}
```

**Docker Logs**:
```bash
# Follow all service logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since timestamp
docker-compose logs --since 2h backend
```

---

## 🛡️ Application Features

### Student Features
- **Course Registration**: Browse catalog, enroll with prerequisites validation
- **Grade Viewing**: View grades, cumulative GPA, transcript
- **Progress Tracking**: Semester-by-semester progress, academic standing
- **Graduation Check**: Verify completion of degree requirements
- **Profile Management**: Update contact info, upload photo

### Faculty (Doctor) Features
- **Course Management**: View assigned courses, student list
- **Grade Entry**: Input marks for homework, midterm, final
- **Course Materials**: Upload syllabus, notes
- **Student Advising**: View mentee progress

### Admin Features
- **User Management**: Create/edit/disable accounts
- **Course Setup**: Create courses, assign instructors, set prerequisites
- **Semester Management**: Create semesters, set registration dates
- **Registration Approval**: Approve pending account requests
- **Reports**: Export student lists, grade distributions
- **Academic Rules**: Configure GPA thresholds, course requirements

### System Features
- **Email Notifications** (when configured)
- **File Upload**: Student documents, course materials
- **API Rate Limiting**: Prevent abuse
- **Request Logging**: Audit trail for all actions
- **Health Checks**: Automated service readiness verification
- **Graceful Shutdown**: Proper connection cleanup

---

## 📚 Documentation

- **[START.md](START.md)** — Detailed step-by-step startup guide
- **[API_REFERENCE.md](API_REFERENCE.md)** — Complete API endpoint documentation with request/response examples

---

## 🔧 Common Tasks

### Make Commands

```bash
# View all available commands
make help

# Docker operations
make docker-up              # Start containers
make docker-down            # Stop containers
make docker-restart         # Restart containers
make docker-logs            # View all logs
make docker-build           # Rebuild images
make docker-clean           # Remove containers & images

# Development
make install                # Install dependencies
make dev                    # Start dev servers (requires local PostgreSQL)
make test                   # Run all test suites
make lint                   # Check code style

# Database
make db-setup               # Initialize schema
make db-migrate             # Run pending migrations
make db-seed                # Load demo data
make db-reset               # Drop & recreate

# Production
make deploy-docker          # Deploy with Docker Compose
```

### Database Maintenance

```bash
# Reset database (caution: deletes all data)
cd backend && npm run reset-db

# Export data backup
docker-compose exec postgres pg_dump \
  -U postgres student_registration_system \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T postgres psql \
  -U postgres student_registration_system \
  < backup_20260320_103000.sql

# Connect to database directly
docker-compose exec postgres psql -U postgres -d student_registration_system
```

### Backend Development

```bash
# Start with auto-reload
npm run dev

# Run linter
npm run lint

# Run tests
npm run test

# Check specific test file
npm test -- routes/authRoutes.test.js
```

### Frontend Development

```bash
# Start dev server with hot reload
npm start

# Build for production
npm run build

# Lint & fix code
npm run lint
```

---

## 🚨 Troubleshooting

### Containers Won't Start

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs backend
docker-compose logs postgres

# Verify network
docker network ls
docker network inspect stud-reg-network

# Remove & rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Verify PostgreSQL is healthy
docker-compose ps postgres  # Should show (healthy)

# Check database password in .env
grep DB_PASSWORD .env

# Test connection directly
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# Recreate database
docker-compose down -v postgres
docker-compose up -d postgres
```

### Frontend blank page
```bash
# Check if backend is reachable
curl http://localhost:3000/health

# Check browser console for CORS errors
# Ensure CORS_ORIGINS includes frontend URL

# Rebuild frontend
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Port already in use

```bash
# If port 3000 is in use
lsof -i :3000
kill -9 <PID>

# Or change in .env
BACKEND_PORT=3002
FRONTEND_PORT=3002 (etc.)
```

---

## 📈 Performance Optimization

### Implemented Features
- **Response Compression**: gzip enabled on all responses
- **Database Connection Pooling**: Reuses connections vs. creating new ones
- **Image Caching**: Multi-stage builds, layer caching in Compose
- **Frontend Bundling**: React production build with minification
- **Indexed Queries**: Database indexes on frequently searched columns
- **Rate Limiting**: Prevents request floods

### Monitoring Performance
- Prometheus metrics at `/metrics`
- Grafana dashboards for visualization
- Request duration histograms (p50/p95/p99)

### Scaling Recommendations
1. **Database**: PostgreSQL read replicas for reporting
2. **Backend**: Load balancer + multiple Node.js instances
3. **Frontend**: CDN for static assets
4. **Caching**: Redis for sessions & frequently accessed data
5. **Search**: Elasticsearch for full-text course search

---

## 📝 License

MIT License — See [LICENSE.txt](LICENSE.txt)

---

## 👨‍💻 About the Developer

**Rabia Adel** — DevOps Engineer & Full-Stack Developer

This project represents the transition from DevOps infrastructure work into building complete, production-ready applications. Every architectural decision prioritizes:
- **Reliability**: Health checks, restart policies, persistent storage
- **Observability**: Prometheus metrics, Grafana dashboards, structured logging
- **Security**: JWT auth, bcrypt hashing, rate limiting, CORS, Helmet headers
- **Scalability**: Docker containerization, multi-stage builds, connection pooling
- **Developer Experience**: One-command startup, comprehensive documentation, Make tasks

**Connect:**
- 🔗 GitHub: https://github.com/rabiaadel?tab=repositories
- 💼 LinkedIn: https://www.linkedin.com/in/rabia-adel-49b3b6310/

**For FCITU:** كلية حاسبات ومعلومات جامعه طنطا  
Faculty of Computers and Information, Tanta University

---

## 🎯 Roadmap (Future Enhancements)

- [ ] CI/CD Pipeline (GitHub Actions / Jenkins)
- [ ] Kubernetes Deployment (Helm charts)
- [ ] Redis Caching Layer
- [ ] Email Notifications (SendGrid/SMTP)
- [ ] SMS Alerts
- [ ] Advanced Reporting (PDF exports)
- [ ] Mobile App (React Native)
- [ ] Two-Factor Authentication (2FA)
- [ ] Internationalization (i18n)
- [ ] Dark Mode UI Theme

---

<div align="center">

**Built with ❤️ for excellence in education technology**

Last Updated: March 20, 2026

</div>
