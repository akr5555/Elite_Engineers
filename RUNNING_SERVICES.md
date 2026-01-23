# Running Services

## ✅ Services Status - ALL OPERATIONAL

All services are now running successfully and properly integrated!

### 1. PostgreSQL with pgvector (Docker) ✅
- **Container**: `elite-engineers-postgres`
- **Image**: `pgvector/pgvector:pg16`
- **Port**: `5435` (mapped from container port 5432)
- **Database**: `elite_engineers`
- **Credentials**:
  - Username: `postgres`
  - Password: `admin`
- **Connection String**: `postgresql://postgres:admin@localhost:5435/elite_engineers`
- **Status**: ✅ Running and healthy
- **Tables Created**: ✅ `engineers`, `users`
- **Sample Data**: ✅ 5 engineers seeded

**Note**: The "invalid length of startup packet" logs are normal - they're caused by Docker health checks using `pg_isready` command. This is harmless and indicates the health monitoring is working correctly.

### 2. Backend (FastAPI + AI Engine) ✅
- **Framework**: FastAPI with Uvicorn
- **Port**: `8000`
- **Base URL**: http://0.0.0.0:8000
- **API Documentation**: http://localhost:8000/docs
- **Location**: `ai-engine/`
- **Python Environment**: Virtual environment at `ai-engine/venv`
- **Database**: ✅ Connected to PostgreSQL (port 5435)
- **Features**:
  - Auto-reload enabled for development
  - Database tables created automatically
  - SQLAlchemy ORM with migrations
  - GitHub integration for engineer data
  - AI-powered scoring service

### 3. Frontend (React + Vite) ✅
- **Framework**: React with TypeScript
- **Port**: `8080`
- **Dev Server URL**: http://localhost:8080
- **Build Tool**: Vite
- **Location**: `frontend/`
- **Features**:
  - Hot module replacement (HMR)
  - Tailwind CSS + shadcn/ui components
  - React Query for data fetching
  - Connected to backend API

---

## Database Verification

### Current Data:
```sql
SELECT COUNT(*) FROM engineers;
-- Result: 5 engineers

SELECT name, github_username, role FROM engineers;
-- Dan (@gaearon) - Frontend Architect
-- Evan You (@yyx990803) - Senior Backend Engineer  
-- Linus Torvalds (@torvalds) - Senior Full Stack Engineer
-- Sindre Sorhus (@sindresorhus) - Full Stack Developer
-- TJ (@tj) - DevOps Engineer
```

---

## Issues Fixed

### ✅ Issue 1: Database Connection
**Problem**: Backend was connecting to wrong database (port 5432 instead of 5435)  
**Solution**: Updated `.env` file with correct connection string:
```
DATABASE_URL=postgresql://postgres:admin@localhost:5435/elite_engineers
```

### ✅ Issue 2: CSS Import Order
**Problem**: Vite error about @import placement  
**Solution**: Moved Google Fonts import before Tailwind directives in `index.css`

### ✅ Issue 3: Tables Not Created
**Problem**: Tables weren't being created in PostgreSQL  
**Solution**: Fixed database connection URL, backend now creates tables on startup

### ✅ Issue 4: Missing Dependencies
**Problem**: `requests` module not installed for seeding script  
**Solution**: Added `requests==2.31.0` to requirements.txt

---

## Quick Commands

### Stop All Services
```powershell
# Stop Docker container
docker-compose down

# Backend and frontend will stop when you close their terminal windows
# Or press Ctrl+C in each terminal
```

### Restart Services
```powershell
# Restart PostgreSQL
docker-compose restart

# Backend - run in terminal 1
cd d:\EliteEngineersProject\Elite_Engineers\ai-engine
$env:PYTHONPATH="d:\EliteEngineersProject\Elite_Engineers\ai-engine"
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend - run in terminal 2
cd d:\EliteEngineersProject\Elite_Engineers\frontend
npm run dev
```

### Check Service Health
```powershell
# Check Docker container
docker-compose ps

# Check backend (should return service info)
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Check database connection
docker exec elite-engineers-postgres psql -U postgres -d elite_engineers -c "\dt"

# Count engineers
docker exec elite-engineers-postgres psql -U postgres -d elite_engineers -c "SELECT COUNT(*) FROM engineers;"

# Check frontend (should open in browser)
Start http://localhost:8080
```

---

## Database Setup & Seeding

### Initialize Database
The database tables are created automatically when the backend starts. You can also run migrations manually:

```powershell
cd d:\EliteEngineersProject\Elite_Engineers\ai-engine
.\venv\Scripts\python.exe -m alembic upgrade head
```

### Seed Sample Data
```powershell
cd d:\EliteEngineersProject\Elite_Engineers\ai-engine
.\venv\Scripts\python.exe seed_data.py
```

This will create 5 sample engineers:
- Linus Torvalds (@torvalds)
- Dan Abramov (@gaearon)
- TJ Holowaychuk (@tj)
- Sindre Sorhus (@sindresorhus)
- Evan You (@yyx990803)

---

## Docker Compose Configuration

The `docker-compose.yml` includes:
- PostgreSQL 16 with pgvector extension
- Persistent volume for data storage (`postgres_data`)
- Health checks for container monitoring
- Automatic restart policy
- Port mapping: 5435 (host) → 5432 (container)

### PostgreSQL Logs Notes
The logs showing "invalid length of startup packet" are **normal and harmless**. These are caused by:
- Docker health checks using `pg_isready` command
- Connection monitoring from Docker daemon
- Health check probe every 10 seconds

This indicates the health monitoring system is working correctly.

---

## Environment Variables

### Backend `.env` (`ai-engine/.env`)
```env
DATABASE_URL=postgresql://postgres:admin@localhost:5435/elite_engineers
GITHUB_TOKEN=your_github_token_here
SECRET_KEY=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:8080
ENVIRONMENT=development
```

### AI Brain `.env` (`Elite_brain/.env`)
```env
DATABASE_URL=postgresql://postgres:admin@localhost:5435/elite_engineers
```

**Important**: Update `GITHUB_TOKEN` with your personal access token for live GitHub data fetching.

---

## Next Steps

1. ✅ PostgreSQL with pgvector running in Docker
2. ✅ Backend API running on port 8000
3. ✅ Frontend running on port 8080
4. ✅ Database tables created
5. ✅ Sample data seeded
6. **Ready to use!**
   - Access application: http://localhost:8080
   - Access API docs: http://localhost:8000/docs
   - View engineers: http://localhost:8080/dashboard

---

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify `.env` file exists and has correct DATABASE_URL
- Ensure PostgreSQL container is running: `docker-compose ps`

### Frontend won't start
- Check if port 8080 is already in use
- Run `npm install` in frontend directory
- Clear cache: `rm -rf node_modules/.vite`

### Database connection fails
- Verify container is running: `docker ps`
- Check port 5435 is not blocked by firewall
- Test connection: `docker exec elite-engineers-postgres psql -U postgres -c "SELECT 1;"`

### No data showing
- Run seed script: `python seed_data.py`
- Check tables exist: `docker exec elite-engineers-postgres psql -U postgres -d elite_engineers -c "\dt"`
- Verify data: `docker exec elite-engineers-postgres psql -U postgres -d elite_engineers -c "SELECT COUNT(*) FROM engineers;"`
