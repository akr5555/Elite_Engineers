# Frontend-Backend Integration Guide

## ✅ Integration Status

The Elite Engineer Discovery Platform is now **fully integrated** with real-time data flow between frontend and backend. No dummy data is used anywhere.

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│                     (React + TypeScript)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      TanStack Query                              │
│              (Data Fetching & Caching Layer)                     │
│  - 30s stale time                                                │
│  - Automatic refetching                                          │
│  - Loading/Error states                                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Service Layer                             │
│                 (src/services/api.ts)                            │
│  - HTTP requests via fetch                                       │
│  - snake_case → camelCase transformation                         │
│  - Error handling                                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP/REST over localhost
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                              │
│                (http://localhost:8000/api)                       │
│  - Request validation (Pydantic)                                 │
│  - Business logic                                                │
│  - GitHub API integration                                        │
│  - AI scoring algorithms                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SQLite Database                               │
│              (ai-engine/elite.db)                                │
│  - Engineer profiles                                             │
│  - GitHub stats                                                  │
│  - Calculated scores                                             │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 Pages Integration Status

### ✅ Dashboard Page (`/dashboard`)
**Status**: Fully Integrated

**Data Sources**:
- `useQuery(['engineers'])` - Fetches all engineers from API
- Transforms via `transformEngineerFromAPI`

**Features**:
- Real-time engineer listing
- Search and filter functionality
- Stats cards (total engineers, avg compatibility, etc.)
- Loading state with spinner
- Error state with retry
- Empty state when no engineers exist
- "Add Engineer" button

**API Endpoints Used**:
- `GET /api/engineers?limit=100`

---

### ✅ Engineer Profile Page (`/engineer/:id`)
**Status**: Fully Integrated

**Data Sources**:
- `useQuery(['engineer', id])` - Fetches single engineer by ID
- Transforms via `transformEngineerFromAPI`

**Features**:
- Full engineer profile details
- GitHub stats display
- Compatibility breakdown
- Trust meter and evidence
- Explainability panel
- Loading state
- Error/Not Found state

**API Endpoints Used**:
- `GET /api/engineers/{id}`

---

### ✅ Add Engineer Page (`/add-engineer`)
**Status**: Fully Integrated

**Data Sources**:
- Form submission via `api.createEngineer()`

**Features**:
- Form for adding new engineers
- Real-time validation
- Success/Error feedback
- Auto-redirect to dashboard after creation
- GitHub username validation

**API Endpoints Used**:
- `POST /api/engineers`

---

### ✅ Compare Page (`/compare`)
**Status**: Fully Integrated

**Data Sources**:
- `useQuery(['engineers'])` - Fetches all engineers for selection
- URL params for persistent comparison state

**Features**:
- Select up to 3 engineers
- Side-by-side comparison
- Radar chart for compatibility breakdown
- Bar chart for GitHub stats
- Skill comparison matrix
- Loading state

**API Endpoints Used**:
- `GET /api/engineers?limit=100`

## 🛠️ Key Integration Components

### 1. API Service (`frontend/src/services/api.ts`)

**Purpose**: Centralized API client for all backend communication

**Key Functions**:
```typescript
// List all engineers
api.getEngineers({ limit: 100, skip: 0, search: "React" })

// Get single engineer
api.getEngineer("123")

// Create new engineer
api.createEngineer({
  name: "John Doe",
  github_username: "johndoe",
  skills: ["React", "Node.js"],
  experience: 5
})

// Update engineer
api.updateEngineer("123", { role: "Senior Engineer" })

// Delete engineer
api.deleteEngineer("123")

// Trigger GitHub sync
api.syncEngineer("123")
```

**Data Transformation**:
- Backend returns `snake_case` fields
- Frontend expects `camelCase` fields
- Automatic transformation via `transformEngineerFromAPI`

Example:
```typescript
// Backend response
{
  "github_username": "johndoe",
  "compatibility_score": 85,
  "total_repos": 42
}

// Frontend data after transformation
{
  "githubUsername": "johndoe",
  "compatibilityScore": 85,
  "totalRepos": 42
}
```

### 2. Data Transformer (`frontend/src/data/engineers.ts`)

**Function**: `transformEngineerFromAPI`

**Purpose**: Converts API response format to frontend format

**Key Transformations**:
- `snake_case` → `camelCase`
- Ensures all optional fields have default values
- Adds computed properties if needed

### 3. TanStack Query Configuration

**Location**: `frontend/src/App.tsx`

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

**Benefits**:
- Automatic caching
- Background refetching
- Deduplication of requests
- Loading and error states
- Optimistic updates support

## 🧪 Testing the Integration

### Test 1: Create Engineer via UI
1. Start backend: `cd ai-engine && python -m uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:5173/dashboard
4. Click "Add Engineer" button
5. Fill form with:
   - Name: "Test Engineer"
   - GitHub Username: "torvalds" (or any valid GitHub user)
   - Skills: "C, Linux, Git"
   - Experience: 10
6. Click "Create Engineer Profile"
7. Verify redirect to dashboard
8. Verify new engineer appears in list

**Expected Result**: ✅ Engineer appears immediately in dashboard

### Test 2: View Engineer Profile
1. From dashboard, click on any engineer card
2. Verify profile page loads with all data
3. Check GitHub stats are populated
4. Verify compatibility breakdown shows scores
5. Check trust evidence displays correctly

**Expected Result**: ✅ All data loads from API, no dummy data

### Test 3: Real-time Data Updates
1. Open dashboard in browser
2. Use Postman or API docs to create a new engineer:
   ```bash
   curl -X POST http://localhost:8000/api/engineers \
     -H "Content-Type: application/json" \
     -d '{
       "name": "API Test",
       "github_username": "gaearon",
       "skills": ["React", "JavaScript"],
       "experience": 10
     }'
   ```
3. Wait 30 seconds (stale time) or refresh page
4. Verify new engineer appears

**Expected Result**: ✅ New engineer shows up automatically

### Test 4: Compare Engineers
1. Navigate to http://localhost:5173/compare
2. Select 2-3 engineers from dropdown
3. Verify comparison charts render
4. Check radar chart shows different colored lines
5. Verify bar chart shows GitHub stats
6. Check skill matrix displays all unique skills

**Expected Result**: ✅ All comparison data loads from API

### Test 5: Search and Filter
1. Go to dashboard
2. Type in search box: "React"
3. Verify only engineers with React skill show up
4. Clear search
5. Select a skill filter
6. Verify filtering works

**Expected Result**: ✅ Filter works on real API data

### Test 6: Error Handling
1. Stop the backend server
2. Try to load dashboard
3. Verify error message displays
4. Start backend again
5. Click retry or refresh
6. Verify data loads successfully

**Expected Result**: ✅ Graceful error handling

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution**:
1. Check backend is running: http://localhost:8000/health
2. Verify CORS is configured in `ai-engine/app/main.py`:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Issue: Engineers not showing up

**Checklist**:
1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 5173
3. ✅ Database has data (check via API docs: http://localhost:8000/docs)
4. ✅ No console errors in browser dev tools

**Quick Fix**:
```bash
# Seed database with sample data
cd D:\Elite\ai-engine
python seed_data.py
```

### Issue: Data not updating in real-time

**Solution**:
- TanStack Query caches for 30 seconds
- Either wait 30s or force refresh:
  ```typescript
  // In browser console
  queryClient.invalidateQueries(['engineers'])
  ```

### Issue: GitHub API rate limit

**Symptoms**: Error creating engineers or syncing data

**Solution**:
1. Check your GitHub token is set in `.env`
2. GitHub allows 5000 requests/hour with token
3. Wait an hour or use a different token

## 🔐 Environment Variables

### Backend (`.env` in `ai-engine/`)
```env
# Database
DATABASE_URL=sqlite:///./elite.db

# GitHub API
GITHUB_TOKEN=your_github_personal_access_token_here

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

### Frontend (`.env` in `frontend/`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📈 Performance Optimization

### Current Optimizations

1. **Query Caching**: Data cached for 30s to reduce API calls
2. **Parallel Requests**: Multiple engineers fetched in single request
3. **Lazy Loading**: Profile data loaded only when needed
4. **Debounced Search**: Search input debounced to avoid excessive queries

### Future Optimizations

1. **Pagination**: Implement cursor-based pagination for large datasets
2. **Virtual Scrolling**: For engineer lists with 100+ items
3. **Image Optimization**: Lazy load avatars
4. **WebSocket**: For real-time updates instead of polling

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `CORS_ORIGINS` to include production domain
- [ ] Set `API_RELOAD=False` in production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Add rate limiting to API
- [ ] Enable HTTPS
- [ ] Add authentication/authorization
- [ ] Configure proper error logging (Sentry, etc.)
- [ ] Add monitoring (New Relic, DataDog, etc.)
- [ ] Update `VITE_API_BASE_URL` to production API URL
- [ ] Build frontend with `npm run build`
- [ ] Serve frontend via CDN or Nginx
- [ ] Set up CI/CD pipeline
- [ ] Add database migrations
- [ ] Configure backup strategy

## ✨ Summary

The Elite Engineer Discovery Platform is now **100% integrated** with:

✅ **No dummy data** - All data comes from backend API  
✅ **Real-time updates** - TanStack Query handles caching and refetching  
✅ **Proper error handling** - Loading states, error messages, retry logic  
✅ **Full CRUD operations** - Create, Read, Update, Delete engineers  
✅ **GitHub integration** - Real GitHub stats and data  
✅ **AI scoring** - Automated compatibility and trust scores  
✅ **Type safety** - TypeScript throughout with proper interfaces  
✅ **Modern architecture** - React + FastAPI + SQLite  

All pages are connected to the backend and functioning with real data!
