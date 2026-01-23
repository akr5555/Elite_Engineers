# Elite Engineers - Server Management Guide

## 🚨 Common Issues & Solutions

### Issue: "Failed to create profile" Error

**Root Cause:**
The Elite Brain AI Engine (port 8001) was not running when the main backend (port 8000) tried to call it for AI scoring.

**Symptoms:**
- Browser shows: "Failed to create profile. Please try again."
- Console shows CORS errors (misleading - CORS was actually fine)
- Backend tries to connect to http://localhost:8001 but gets no response

**Why This Happens:**
When an engineer creates their profile with "Job Roles Looking For" filled in, the main backend calls the Elite Brain AI Engine to get:
- **Trust Score** (based on GitHub activity, contributions, etc.)
- **Compatibility Score** (matching skills with job requirements)

If Elite Brain isn't running, the profile creation fails.

## ✅ Solution

### Quick Fix
Always ensure **BOTH** servers are running:

1. **Main Backend** (Port 8000)
2. **Elite Brain AI Engine** (Port 8001)

### Automated Startup (Recommended)

Run the startup script to launch both servers automatically:

```powershell
.\start_all_servers.ps1
```

This will open two terminal windows - keep them both open.

### Manual Startup

If you prefer to start servers manually:

**Terminal 1 - Main Backend:**
```powershell
Set-Location "D:\EliteEngineersProject\Elite_Engineers\ai-engine"
D:\anaconda3\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Elite Brain AI:**
```powershell
Set-Location "D:\EliteEngineersProject\Elite_Engineers\Elite_brain"
D:\anaconda3\Scripts\uvicorn.exe main:app --reload --port 8001
```

### Health Check

Verify all servers are running:

```powershell
.\health_check.ps1
```

## 📊 Server Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│                     http://localhost:8080                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Main Backend API (FastAPI)                      │
│                   Port 8000                                  │
│  • Authentication                                            │
│  • Engineer CRUD                                             │
│  • Recruiter endpoints                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Calls AI Engine
                         │ POST /analyze
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Elite Brain AI Engine (FastAPI)                     │
│                   Port 8001                                  │
│  • GitHub Profile Scanning                                   │
│  • AI Score Calculation (Groq + Gemini)                     │
│  • Vector Search (sentence-transformers)                     │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│                localhost:5432/elite_db                       │
│  • Users & Engineers                                         │
│  • AI Scores & Analysis                                      │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 How AI Integration Works

### Engineer Profile Creation Flow

1. **Engineer fills form** with:
   - GitHub username
   - Skills
   - Location
   - **Job Roles Looking For** (required for AI scoring)

2. **Frontend sends request** to:
   ```
   POST /api/engineers
   ```

3. **Main Backend**:
   - Validates user authentication
   - Checks if GitHub username exists
   - Fetches public GitHub data (repos, stats)
   - **Calls Elite Brain AI** if job_roles provided:
     ```
     POST http://localhost:8001/analyze
     {
       "username": "github_username",
       "job_description": "Job roles text from form"
     }
     ```

4. **Elite Brain AI Engine**:
   - Scans GitHub profile deeply
   - Analyzes code quality, commits, contributions
   - Uses Groq AI to calculate **trust_score** (0-100)
   - Uses Gemini AI to calculate **compatibility_score** (0-100)
   - Provides AI explanation of scores
   - Returns results to Main Backend

5. **Main Backend**:
   - Saves engineer profile with AI scores
   - Returns success to Frontend

6. **Frontend**:
   - Shows "Profile created successfully"
   - Displays AI-generated scores

### Fallback Behavior

If Elite Brain AI Engine is unavailable:
- Main Backend uses **traditional scoring algorithm**
- Profile still gets created (no failure)
- Scores are calculated without AI (less accurate)

## 🎯 API Endpoints

### Main Backend (Port 8000)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/engineers` - Create engineer profile (calls AI)
- `GET /api/engineers` - List engineers
- `GET /api/engineers/{id}` - Get engineer details
- `GET /api/recruiter/candidates` - AI-sorted candidates
- `POST /api/recruiter/search` - Natural language search

### Elite Brain AI (Port 8001)

- `POST /analyze` - Analyze single engineer
- `POST /analyze/bulk` - Analyze multiple engineers
- `GET /candidates` - Get all analyzed candidates
- `POST /search` - Vector-based semantic search
- `GET /health` - Health check

## 🧪 Testing the Integration

### 1. Verify Servers Are Running

```powershell
.\health_check.ps1
```

Expected output:
```
✅ Main Backend API (Port 8000) - HEALTHY
✅ Elite Brain AI (Port 8001) - HEALTHY
✅ All systems operational!
```

### 2. Test Engineer Profile Creation

1. Open browser: http://localhost:8080/engineer-dashboard
2. Fill in the form:
   - GitHub Username: `torvalds` (or any valid username)
   - Name: `Test Engineer`
   - Skills: `Python, React, Node.js`
   - Location: `USA`
   - **Job Roles Looking For**: `I'm looking for full-stack developer roles with Python and React`
3. Click "Connect GitHub & Create Profile"
4. Check backend logs - should see:
   ```
   INFO: Calling AI Engine for torvalds with job_roles: ...
   INFO: AI scores - Trust: 85.0, Compatibility: 92.0
   ```

### 3. Manual API Test

Test Elite Brain directly:

```powershell
$body = @{
    username = "torvalds"
    job_description = "Looking for kernel development roles"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8001/analyze" -Method Post -Body $body -ContentType "application/json"
```

## 🐛 Troubleshooting

### Elite Brain Shuts Down Immediately

**Cause:** Missing dependencies or database connection issues

**Solution:**
```powershell
# Install required packages
pip install groq sentence-transformers scikit-learn asyncpg google-generativeai

# Check .env file has correct database URL
# Elite_brain/.env should have:
DATABASE_URL=postgresql://postgres:%40Nitish%406250@localhost:5432/elite_db
```

### "Extension 'vector' is not available" Warning

**Status:** Non-blocking warning - Elite Brain works without it

**Optional Fix (for vector search):**
```sql
-- Install pgvector extension in PostgreSQL
-- Download from: https://github.com/pgvector/pgvector
-- Follow installation instructions
```

### Main Backend Can't Connect to AI Engine

**Symptoms:**
- Logs show: "Timeout while analyzing engineer"
- Profile creation fails

**Solution:**
1. Ensure Elite Brain is running: `.\health_check.ps1`
2. Check firewall isn't blocking port 8001
3. Verify AI Engine base URL in code:
   ```python
   # ai-engine/app/services/ai_engine_service.py
   base_url = "http://localhost:8001"  # Should match Elite Brain port
   ```

### CORS Errors

**Current Config:** Both 8080 and 8081 are allowed

If you see CORS errors:
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear browser cache
3. Verify CORS config in [ai-engine/app/main.py](ai-engine/app/main.py#L37-L50)

## 📝 Development Workflow

### Daily Startup

```powershell
# Start both servers
.\start_all_servers.ps1

# Wait 10 seconds for startup

# Verify health
.\health_check.ps1

# Open API docs
start http://localhost:8000/docs
start http://localhost:8001/docs
```

### Making Changes

Both servers run with `--reload` flag:
- Automatically restart when code changes
- Keep terminals open to see logs
- Watch for errors during auto-reload

### Stopping Servers

Press `Ctrl + C` in each terminal window.

## 🚀 Next Steps

### Recommended Improvements

1. **Install pgvector** for semantic search:
   ```sql
   CREATE EXTENSION vector;
   ```

2. **Add health monitoring** to frontend:
   - Show indicator if AI Engine is down
   - Warn user that scores will be less accurate

3. **Implement caching**:
   - Cache GitHub profile data (24h)
   - Reduce API calls to GitHub
   - Speed up profile creation

4. **Add retry logic**:
   - Retry AI Engine calls if they fail
   - Exponential backoff strategy

5. **Create Docker Compose** setup:
   - Single command to start all services
   - Consistent environment across machines

## 📞 Support

If issues persist after following this guide:

1. Check both terminal logs for error messages
2. Verify database connection (PostgreSQL must be running)
3. Ensure all environment variables are set correctly:
   - `ai-engine/.env` - Main backend config
   - `Elite_brain/.env` - AI engine config
4. Run health check to identify which service is failing

---

**Last Updated:** January 23, 2026  
**Version:** 1.0 (Post-AI Integration)
