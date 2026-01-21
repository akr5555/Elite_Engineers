# 🚀 Elite Platform - Quick Reference Card

## Essential Commands

### Start Backend
```bash
cd D:\Elite\ai-engine
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend  
```bash
cd D:\Elite\frontend
npm run dev
```

### Quick Start (Both)
```bash
cd D:\Elite
start-all.bat
```

## Important URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/health |
| Frontend | http://localhost:5173 |

## API Endpoints Cheat Sheet

```bash
# List engineers
GET /api/engineers?skip=0&limit=50&search=python

# Get specific engineer
GET /api/engineers/{id}

# Create engineer
POST /api/engineers
Body: {
  "name": "John Doe",
  "github_username": "johndoe",
  "skills": ["Python", "Django"],
  "experience": 5
}

# Update engineer
PATCH /api/engineers/{id}
Body: { "name": "Jane Doe" }

# Sync from GitHub
POST /api/engineers/{id}/sync

# Delete engineer
DELETE /api/engineers/{id}

# Compare engineers
GET /api/engineers/compare/?ids=id1,id2,id3
```

## Environment Variables (.env)

```env
# Required
DATABASE_URL=postgresql://postgres:password@localhost:5432/elite_db
GITHUB_TOKEN=ghp_your_github_token_here

# Optional (have defaults)
API_V1_PREFIX=/api
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

## Database Setup

```sql
-- Create database
CREATE DATABASE elite_db;

-- Connect to it
\c elite_db

-- Tables are auto-created on first run

-- View engineers
SELECT id, name, github_username, trust_score FROM engineers;
```

## File Structure Quick Reference

```
ai-engine/
├── app/
│   ├── main.py              ← Start here
│   ├── config.py            ← Settings
│   ├── database.py          ← DB connection
│   ├── models/
│   │   └── engineer.py      ← Database table
│   ├── schemas/
│   │   └── engineer.py      ← Request/response models
│   ├── services/
│   │   ├── github_service.py   ← Fetch from GitHub
│   │   └── scoring_service.py  ← Calculate scores
│   └── api/routes/
│       └── engineers.py     ← API endpoints
└── .env                     ← Secrets & config

frontend/
└── src/
    └── services/
        └── api.ts           ← Backend integration
```

## Common Tasks

### Create New Engineer
```typescript
// Frontend
import { api } from '@/services/api';

const engineer = await api.createEngineer({
  name: "John Doe",
  github_username: "johndoe",
  skills: ["Python", "React"],
  experience: 5
});
```

### List Engineers with Filter
```typescript
const result = await api.getEngineers({
  search: "python",
  skills: "python,django",
  min_trust_score: 85
});

console.log(result.engineers); // Array of engineers
console.log(result.total);     // Total count
```

### Get Single Engineer
```typescript
const engineer = await api.getEngineer("engineer-id-123");
```

### Sync Engineer Data
```typescript
const updated = await api.syncEngineer("engineer-id-123");
// Fetches latest GitHub data
```

## Troubleshooting Quick Fixes

### Backend won't start
```bash
# Activate venv
cd D:\Elite\ai-engine
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists and is configured
```

### Database connection error
```bash
# Check PostgreSQL is running
services.msc  # (Windows)

# Test connection
psql -U postgres -d elite_db

# Verify DATABASE_URL in .env
```

### GitHub API errors
```bash
# Check token is set
echo %GITHUB_TOKEN%

# Generate new token if needed:
# GitHub.com → Settings → Developer settings → Tokens
```

### CORS errors
- Ensure backend is running on port 8000
- Check FRONTEND_URL in backend .env
- Restart backend after changing .env

### Port already in use
```bash
# Find process
netstat -ano | findstr :8000

# Kill it
taskkill /PID <PID> /F
```

## Testing with cURL

```bash
# Create engineer
curl -X POST http://localhost:8000/api/engineers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","github_username":"torvalds","skills":["C"],"experience":30}'

# List engineers
curl http://localhost:8000/api/engineers

# Health check
curl http://localhost:8000/health
```

## Database Queries

```sql
-- Count engineers
SELECT COUNT(*) FROM engineers;

-- Top trust scores
SELECT name, trust_score FROM engineers ORDER BY trust_score DESC LIMIT 10;

-- Engineers by skill
SELECT name, skills FROM engineers WHERE skills::text LIKE '%Python%';

-- Delete all engineers
DELETE FROM engineers;
```

## Logs Location

**Backend logs**: Terminal where uvicorn is running  
**Frontend logs**: Browser console (F12)

## Get Help

📖 Full docs: `D:\Elite\SETUP_GUIDE.md`  
📖 Explanation: `D:\Elite\EXPLANATION.md`  
📖 Backend docs: http://localhost:8000/docs  
📖 Backend README: `D:\Elite\ai-engine\README.md`

## Score Calculation Summary

**Trust Score (0-100)**:
- 30% Commit volume
- 20% Repository count
- 25% Popular repos
- 15% Language diversity
- 10% Stars & forks

**Compatibility Score (0-100)**:
- 70% Skills match
- 15% Activity level
- 15% Language relevance

## Useful VS Code Extensions

- Python (Microsoft)
- Pylance
- REST Client
- PostgreSQL
- Database Client
- Thunder Client (API testing)

---

**Save this file for quick reference! 📌**
