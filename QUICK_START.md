# 🚀 Quick Start Guide - Elite Engineer Discovery Platform

## ⚡ Super Quick Start (2 Minutes)

### 1. Start Backend
```bash
cd D:\Elite\ai-engine
python -m uvicorn app.main:app --reload
```

**Expected Output:**
```
Starting Elite - Engineer Discovery Platform v1.0.0
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Seed Database (Optional - Recommended for First Time)
Open a **new terminal**:
```bash
cd D:\Elite\ai-engine
python seed_data.py
```

**Expected Output:**
```
✓ Created engineer: Sarah Chen (ID: 1)
✓ Created engineer: Marcus Johnson (ID: 2)
...
Database seeding complete! Created 5/5 engineers
```

### 3. Start Frontend
Open **another new terminal**:
```bash
cd D:\Elite\frontend
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:5173/
```

### 4. Open in Browser
Navigate to: **http://localhost:5173**

You should see the landing page. Click "Get Started" or navigate to http://localhost:5173/dashboard

---

## 📝 What You Can Do Now

### ✅ View Engineers
- Go to [Dashboard](http://localhost:5173/dashboard)
- See all engineers with their compatibility scores
- Search by name, role, or skills
- Filter by specific skills

### ✅ View Engineer Profile
- Click on any engineer card
- See detailed GitHub stats
- View compatibility breakdown
- Check trust evidence
- See AI-generated highlights

### ✅ Add New Engineer
- Click "Add Engineer" button on dashboard
- Fill in the form:
  - Name
  - GitHub Username (use real GitHub users like "torvalds", "gaearon", etc.)
  - Skills (comma-separated)
  - Experience (years)
- Click "Create Engineer Profile"
- Data is fetched from GitHub automatically
- AI scores are calculated automatically

### ✅ Compare Engineers
- Go to [Compare](http://localhost:5173/compare)
- Select up to 3 engineers from dropdown
- View side-by-side comparison
- See radar chart of compatibility metrics
- Compare GitHub stats in bar chart
- View skill matrix

---

## 🔧 Common Commands

### Backend Commands
```bash
# Start backend
cd D:\Elite\ai-engine
python -m uvicorn app.main:app --reload

# Seed database
python seed_data.py

# Check API docs
# Open http://localhost:8000/docs in browser

# Health check
curl http://localhost:8000/health
```

### Frontend Commands
```bash
# Start frontend
cd D:\Elite\frontend
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

---

## 📚 API Endpoints

Base URL: `http://localhost:8000/api`

### List Engineers
```bash
GET /api/engineers?limit=100&skip=0
```

### Get Single Engineer
```bash
GET /api/engineers/{id}
```

### Create Engineer
```bash
POST /api/engineers
Content-Type: application/json

{
  "name": "John Doe",
  "github_username": "johndoe",
  "skills": ["React", "Node.js"],
  "experience": 5,
  "role": "Senior Engineer",
  "location": "San Francisco, CA"
}
```

### Update Engineer
```bash
PUT /api/engineers/{id}
Content-Type: application/json

{
  "role": "Lead Engineer"
}
```

### Delete Engineer
```bash
DELETE /api/engineers/{id}
```

### Sync Engineer GitHub Data
```bash
POST /api/engineers/{id}/sync
```

---

## 🎯 Test the Integration

### Test 1: Add Engineer via UI
1. Go to http://localhost:5173/dashboard
2. Click "Add Engineer"
3. Enter:
   - Name: Test Engineer
   - GitHub: torvalds
   - Skills: C, Linux, Git
   - Experience: 30
4. Submit
5. Check dashboard - should show new engineer immediately

### Test 2: Check Real-Time Data
1. Open browser dev tools (F12)
2. Go to Network tab
3. Navigate to dashboard
4. See `GET /api/engineers?limit=100` request
5. Check response has real data from backend

### Test 3: Profile Deep Link
1. Open http://localhost:5173/engineer/1
2. Should load engineer with ID 1
3. All data should come from API
4. Check Network tab to confirm API call

---

## 🐛 Troubleshooting

### Backend Not Starting
**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
cd D:\Elite\ai-engine
pip install -r requirements.txt
```

### Frontend Not Starting
**Error:** `Cannot find module 'react'`

**Fix:**
```bash
cd D:\Elite\frontend
npm install
```

### CORS Errors
**Error:** `Access to fetch blocked by CORS policy`

**Fix:** Backend should have CORS configured. Check `ai-engine/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Database Empty
**Solution:** Seed the database:
```bash
cd D:\Elite\ai-engine
python seed_data.py
```

### Port Already in Use
**Error:** `Address already in use`

**Fix for Backend (8000):**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Fix for Frontend (5173):**
```bash
# Kill process and restart
npm run dev
```

---

## 📁 Key Files

### Backend
- `ai-engine/app/main.py` - FastAPI app entry point
- `ai-engine/app/api/routes/engineers.py` - API endpoints
- `ai-engine/app/services/github_service.py` - GitHub integration
- `ai-engine/app/services/scoring_service.py` - AI scoring
- `ai-engine/elite.db` - SQLite database
- `ai-engine/seed_data.py` - Database seeding script

### Frontend
- `frontend/src/App.tsx` - React app with routing
- `frontend/src/pages/Dashboard.tsx` - Engineer listing
- `frontend/src/pages/EngineerProfile.tsx` - Profile details
- `frontend/src/pages/AddEngineer.tsx` - Add engineer form
- `frontend/src/pages/Compare.tsx` - Compare engineers
- `frontend/src/services/api.ts` - API client

---

## 🌟 Features Summary

### ✅ Fully Integrated
- No dummy data - all from API
- Real-time updates
- TanStack Query caching
- Loading & error states
- Type-safe with TypeScript

### ✅ Backend Features
- FastAPI REST API
- SQLite database
- GitHub API integration
- AI-powered scoring
- Automatic data fetching
- CORS enabled

### ✅ Frontend Features
- React + TypeScript
- shadcn/ui components
- TanStack Query
- React Router
- Responsive design
- Modern UI/UX

---

## 📖 Documentation

- **Full Setup Guide**: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **API Documentation**: http://localhost:8000/docs (when backend running)
- **Backend README**: [ai-engine/README.md](ai-engine/README.md)

---

## 🎉 You're All Set!

The Elite Engineer Discovery Platform is ready to use. All features are working with real-time data integration.

**Next Steps:**
1. Add more engineers via the UI
2. Explore the comparison feature
3. Check out the AI explanability features
4. Customize the scoring algorithms
5. Add your own GitHub token for higher API limits

**Need Help?**
- Check the documentation files
- Visit http://localhost:8000/docs for API reference
- Review INTEGRATION_GUIDE.md for detailed integration info
