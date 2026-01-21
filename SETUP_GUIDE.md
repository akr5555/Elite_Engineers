# Elite Platform - Setup & Implementation Guide

## 🎯 What We've Built

A complete **FastAPI backend** in the `ai-engine` folder with:
- GitHub API integration for fetching engineer data
- AI-powered scoring algorithms
- RESTful API endpoints
- PostgreSQL database integration
- Complete documentation

## 📁 Project Structure Created

```
ai-engine/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI app entry point
│   ├── config.py                    # Settings & environment config
│   ├── database.py                  # Database connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── engineer.py              # SQLAlchemy Engineer model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── engineer.py              # Pydantic request/response schemas
│   │   └── github.py                # GitHub data schemas
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── engineers.py         # Engineer API endpoints
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── github_service.py        # GitHub API integration
│   │   └── scoring_service.py       # AI scoring algorithms
│   │
│   └── utils/
│       ├── __init__.py
│       └── helpers.py               # Utility functions
│
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── .gitignore
├── requirements.txt                 # Python dependencies
└── README.md                        # Backend documentation

frontend/
├── src/
│   └── services/
│       └── api.ts                   # API client for backend
├── .env                             # Frontend environment
└── .env.example
```

## 🚀 Step-by-Step Setup Instructions

### STEP 1: Install Python & PostgreSQL

#### Install Python (if not already installed)
1. Download Python 3.9+ from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Verify installation:
   ```bash
   python --version
   ```

#### Install PostgreSQL
1. Download from https://www.postgresql.org/download/
2. During installation:
   - Remember the password you set for 'postgres' user
   - Default port: 5432
3. Verify installation:
   ```bash
   psql --version
   ```

### STEP 2: Create PostgreSQL Database

Open Command Prompt or PowerShell and run:

```bash
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# Inside psql, create the database:
CREATE DATABASE elite_db;

# Verify database was created:
\l

# Exit psql:
\q
```

### STEP 3: Get GitHub Personal Access Token

1. Go to GitHub.com → Settings → Developer settings
2. Click "Personal access tokens" → "Tokens (classic)"
3. Click "Generate new token (classic)"
4. Give it a name: "Elite Platform"
5. Select scopes:
   - ✅ `repo` (all)
   - ✅ `user` (all)
   - ✅ `read:org`
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

### STEP 4: Setup Backend Environment

```bash
# Navigate to ai-engine folder
cd D:\Elite\ai-engine

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### STEP 5: Configure Environment Variables

Open `D:\Elite\ai-engine\.env` and update:

```env
# Update this with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/elite_db

# Paste your GitHub token here
GITHUB_TOKEN=ghp_your_token_here

# These can stay as is for development
API_V1_PREFIX=/api
SECRET_KEY=your-secret-key-change-this-in-production-use-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### STEP 6: Run the Backend

```bash
# Make sure you're in ai-engine folder with venv activated
cd D:\Elite\ai-engine
venv\Scripts\activate

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### STEP 7: Test the API

Open your browser and visit:

1. **API Documentation**: http://localhost:8000/docs
   - You'll see interactive API docs (Swagger UI)
   - You can test all endpoints here!

2. **Health Check**: http://localhost:8000/health
   - Should return: `{"status":"healthy",...}`

3. **Alternative Docs**: http://localhost:8000/redoc

### STEP 8: Create Your First Engineer Profile

Using the Swagger UI at http://localhost:8000/docs:

1. Find the `POST /api/engineers` endpoint
2. Click "Try it out"
3. Enter this JSON:

```json
{
  "name": "John Doe",
  "github_username": "torvalds",
  "role": "Senior Software Engineer",
  "location": "Portland, OR",
  "skills": ["C", "Linux", "Git", "Kernel Development"],
  "experience": 30
}
```

4. Click "Execute"
5. You should get a 201 response with the created engineer!

### STEP 8.5: Seed Database with Sample Data (Optional but Recommended)

To quickly populate your database with sample engineers, use the seed script:

#### Option 1: Using the Batch File (Easiest)
```bash
# Make sure backend is running, then double-click:
D:\Elite\ai-engine\seed-database.bat
```

#### Option 2: Using Python Directly
```bash
# Navigate to ai-engine folder
cd D:\Elite\ai-engine

# Run the seed script
python seed_data.py
```

This will create 5 sample engineers with real GitHub data. You should see:
```
✓ Created engineer: Sarah Chen (ID: 1)
✓ Created engineer: Marcus Johnson (ID: 2)
✓ Created engineer: Priya Sharma (ID: 3)
✓ Created engineer: Alex Rodriguez (ID: 4)
✓ Created engineer: Emily Watson (ID: 5)

Database seeding complete! Created 5/5 engineers
```

**Note**: The seed script uses real GitHub usernames (torvalds, gaearon, tj, sindresorhus, yyx990803) to fetch actual GitHub stats and calculate real compatibility scores.

### STEP 9: Run the Frontend

Open a **NEW** terminal (keep backend running):

```bash
# Navigate to frontend
cd D:\Elite\frontend

# Install dependencies (if not done)
npm install

# Run development server
npm run dev
```

Frontend should start at: http://localhost:5173

## 🔧 How Everything Works

### 1. Frontend → Backend Communication Flow

```
User interacts with React UI
         ↓
React calls api.ts functions
         ↓
HTTP request to FastAPI backend (localhost:8000)
         ↓
FastAPI routes handle request
         ↓
Services fetch GitHub data & calculate scores
         ↓
Data saved to PostgreSQL database
         ↓
Response sent back to frontend
         ↓
UI updates with new data
```

### 2. Engineer Creation Process

When you create an engineer:

1. **Frontend** sends POST request to `/api/engineers`
2. **Backend** receives request and validates data
3. **GitHub Service** fetches:
   - User profile
   - Repositories
   - Commit history
   - Language statistics
4. **Scoring Service** calculates:
   - Trust Score (0-100) based on activity
   - Compatibility Score (0-100) based on skills
   - Detailed breakdowns
   - Highlights and evidence
5. **Database** stores the engineer profile
6. **Response** sent back with complete engineer data

### 3. Scoring Algorithm Explained

#### Trust Score Components:
- **30%**: Commit volume (more commits = higher trust)
- **20%**: Repository count (variety of projects)
- **25%**: Popular repositories (community recognition)
- **15%**: Language diversity (breadth of skills)
- **10%**: Stars & forks (code quality indicators)

#### Compatibility Score Components:
- **70%**: Skills match (how many required skills match)
- **15%**: Activity level (recent commit activity)
- **15%**: Language relevance (matching programming languages)

### 4. Database Schema

The `engineers` table stores:
- Basic info: name, avatar, role, location, bio
- GitHub data: username, repos, commits, stars, forks
- Calculated scores: compatibility_score, trust_score
- Complex JSON data: skills, languages, activity, breakdowns
- Metadata: created_at, updated_at, last_synced_at

## 📡 API Endpoints Reference

### Engineers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/engineers` | List all engineers (with filters) |
| GET | `/api/engineers/{id}` | Get specific engineer |
| POST | `/api/engineers` | Create new engineer |
| PATCH | `/api/engineers/{id}` | Update engineer |
| POST | `/api/engineers/{id}/sync` | Resync GitHub data |
| DELETE | `/api/engineers/{id}` | Delete engineer |
| GET | `/api/engineers/compare/?ids=1,2,3` | Compare engineers |

### Query Parameters for GET /api/engineers

- `skip`: Pagination offset (default: 0)
- `limit`: Max results (default: 50, max: 100)
- `search`: Search by name/role/username
- `skills`: Filter by skills (comma-separated)
- `min_trust_score`: Minimum trust score filter
- `min_compatibility_score`: Minimum compatibility filter

## 🔍 Testing Examples

### Example 1: Create Engineer
```bash
curl -X POST "http://localhost:8000/api/engineers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Linus Torvalds",
    "github_username": "torvalds",
    "role": "Software Engineer",
    "skills": ["C", "Linux", "Git"],
    "experience": 30
  }'
```

### Example 2: Search Engineers
```bash
curl "http://localhost:8000/api/engineers?search=engineer&limit=10"
```

### Example 3: Filter by Skills
```bash
curl "http://localhost:8000/api/engineers?skills=python,javascript"
```

### Example 4: Get High Trust Engineers
```bash
curl "http://localhost:8000/api/engineers?min_trust_score=90"
```

## 🐛 Troubleshooting

### Problem: "ModuleNotFoundError"
**Solution**: Make sure virtual environment is activated
```bash
venv\Scripts\activate
pip install -r requirements.txt
```

### Problem: "Connection to database failed"
**Solution**: 
1. Check PostgreSQL is running
2. Verify DATABASE_URL in `.env` is correct
3. Test connection: `psql -U postgres -d elite_db`

### Problem: "GitHub API rate limit"
**Solution**:
1. Make sure GITHUB_TOKEN is set in `.env`
2. Check token has correct permissions
3. Wait if rate limited (resets hourly)

### Problem: "CORS error" in frontend
**Solution**: 
1. Make sure backend is running on port 8000
2. Check FRONTEND_URL in backend `.env` matches frontend URL
3. Restart backend after changing `.env`

### Problem: "Port 8000 already in use"
**Solution**:
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
uvicorn app.main:app --reload --port 8001
```

## 🎓 Next Steps

### 1. Connect Frontend to Backend

Update your frontend code to use the API service:

```typescript
// In Dashboard.tsx
import { api } from '@/services/api';

// Replace static data with API call
const { data: engineersData } = useQuery({
  queryKey: ['engineers'],
  queryFn: () => api.getEngineers({ limit: 50 })
});
```

### 2. Add More Features

- User authentication
- Email notifications
- Advanced filtering
- Export to PDF
- Engineer recommendations
- Saved searches

### 3. Production Deployment

- Use environment-specific configs
- Set up proper database migrations (Alembic)
- Configure proper CORS
- Add rate limiting
- Set up monitoring & logging
- Use production WSGI server (Gunicorn)

## 📚 Important Files Explained

### `app/main.py`
- FastAPI application instance
- CORS configuration
- Router registration
- Startup/shutdown events

### `app/config.py`
- Loads environment variables
- Centralized configuration
- Type-safe settings with Pydantic

### `app/database.py`
- Database connection setup
- Session management
- Dependency injection for DB sessions

### `app/models/engineer.py`
- SQLAlchemy ORM model
- Database table schema
- Relationships and constraints

### `app/schemas/engineer.py`
- Pydantic models for validation
- Request/response schemas
- Data transformation

### `app/services/github_service.py`
- GitHub API client
- Fetches user data, repos, commits
- Handles rate limiting & errors

### `app/services/scoring_service.py`
- AI scoring algorithms
- Trust score calculation
- Compatibility matching
- Highlight generation

### `app/api/routes/engineers.py`
- API endpoints
- Request handling
- Business logic orchestration
- Error handling

## 🔐 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Change SECRET_KEY** in production - Generate with:
   ```bash
   openssl rand -hex 32
   ```
3. **Use environment variables** for sensitive data
4. **Validate all inputs** - Pydantic handles this
5. **Use HTTPS** in production

## 📞 Support

If you encounter issues:
1. Check the logs in the terminal
2. Visit http://localhost:8000/docs for API documentation
3. Test endpoints in Swagger UI
4. Check PostgreSQL connection
5. Verify GitHub token is valid

## ✅ Success Checklist

- [ ] Python 3.9+ installed
- [ ] PostgreSQL installed and running
- [ ] Database `elite_db` created
- [ ] GitHub Personal Access Token obtained
- [ ] Virtual environment created and activated
- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Backend running on port 8000
- [ ] API docs accessible at /docs
- [ ] Successfully created test engineer
- [ ] Frontend can connect to backend

---

**You're all set! Start building amazing features! 🚀**
