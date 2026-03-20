# How to Start the System

## 🚀 Option 1: Automated (RECOMMENDED)

Run everything in one command:

```bash
bash quick-start.sh
```

This copies `.env.docker` → `.env` (local-friendly defaults), installs deps, runs Docker, migrations, and seeds.

This does:
1. ✅ Sets up environment variables
2. ✅ Installs backend dependencies
3. ✅ Installs frontend dependencies
4. ✅ Starts PostgreSQL, Backend, Frontend (Docker)
5. ✅ Runs database migrations
6. ✅ Loads demo data (seeds)
7. ✅ Verifies everything is working

**Then open**: http://localhost:3001

---

## 🔧 Option 2: Manual Steps

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 3: Start All Services

```bash
docker-compose up -d
```

### Step 4: Wait for Database to be Ready

```bash
docker-compose logs postgres
# Wait until you see "database system is ready to accept connections"
```

### Step 5: Run Database Migrations

```bash
docker-compose exec -T backend npm run migrate
```

### Step 6: Load Demo Data

```bash
docker-compose exec -T backend npm run seed
```

### Step 7: Check Backend is Healthy

```bash
curl http://localhost:3000/health
# Should respond with: {"success": true, "db": "ok"}
```

### Step 8: Open Frontend

Open in your browser: **http://localhost:3001**

---

## 📱 Login Credentials

```
Admin:    admin@university.edu    / Uni@2026!Admin
Doctor:   doctor@university.edu   / Uni@2026!Doctor  
Student:  student@university.edu  / Uni@2026!Student
```

---

## ⚠️ Common Issues

### Port Already in Use
```bash
# If ports 3000, 3001, or 5432 are in use:
# Stop Docker containers:
docker-compose down

# Or change ports in docker-compose.yml
```

### PostgreSQL Connection Failed
```bash
# Check if PostgreSQL container is running:
docker-compose ps

# View logs:
docker-compose logs postgres
```

### Frontend Can't Connect to Backend
```bash
# Check backend health:
curl http://localhost:3000/health

# Check frontend .env file has correct API URL:
grep REACT_APP_API_URL frontend/.env
# Should be: REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Database Seeds Not Loaded
```bash
# Re-run seed command:
docker-compose exec -T backend npm run seed

# Check if data was loaded:
docker-compose exec postgres psql -U postgres -d student_registration_system \
  -c "SELECT COUNT(*) as user_count FROM users;"
# Should show: 3 (admin, doctor, student)
```

---

## 🛑 Stop Everything

```bash
docker-compose down
```

This stops all services but keeps data.

---

## ♻️ Reset Everything (Delete All Data!)

```bash
docker-compose down -v
```

This removes containers, volumes, and ALL data.

---

## 📊 Check What's Running

```bash
docker-compose ps
```

Expected output:
```
NAME                COMMAND             STATUS          PORTS
postgres            postgres            Up              5432/tcp
backend             /app/entrypoint.sh  Up              3000->3000/tcp
frontend            npm start           Up              3001->3001/tcp
```

---

## 🔍 View Logs

### Backend logs
```bash
docker-compose logs -f backend
```

### Database logs
```bash
docker-compose logs -f postgres
```

### Frontend logs
```bash
docker-compose logs -f frontend
```

### All logs
```bash
docker-compose logs -f
```

---

## ✅ Verify Everything Works

```bash
# 1. Check backend is healthy
curl http://localhost:3000/health

# 2. Check database connection
curl http://localhost:3000/api/v1/health

# 3. Check frontend loads
curl -I http://localhost:3001

# 4. Check API works
curl http://localhost:3000/api/v1/courses
```

---

## 📚 Next Steps

1. Open **http://localhost:3001**
2. Login with any demo credentials above
3. Explore the system
4. See [API_REFERENCE.md](API_REFERENCE.md) for API documentation
