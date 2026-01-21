# Elite Engineer Discovery Platform - System Architecture

## 🏗️ Complete System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                      │
│                         http://localhost:5173                                  │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                          REACT FRONTEND (Vite)                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  PAGES                                                                  │  │
│  │  • Landing.tsx          → Static marketing page                        │  │
│  │  • Dashboard.tsx        → Engineer listing (useQuery)                  │  │
│  │  • EngineerProfile.tsx  → Single engineer detail (useQuery)            │  │
│  │  • AddEngineer.tsx      → Create engineer form (useMutation)           │  │
│  │  • Compare.tsx          → Side-by-side comparison (useQuery)           │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  TANSTACK QUERY (React Query)                                          │  │
│  │  • Query Client with 30s stale time                                    │  │
│  │  • Automatic caching & refetching                                      │  │
│  │  • Loading & error state management                                    │  │
│  │  • Query keys: ['engineers'], ['engineer', id]                         │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  API SERVICE LAYER (src/services/api.ts)                               │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │  const api = {                                                  │   │  │
│  │  │    getEngineers(),     // GET /api/engineers                   │   │  │
│  │  │    getEngineer(id),    // GET /api/engineers/{id}              │   │  │
│  │  │    createEngineer(),   // POST /api/engineers                  │   │  │
│  │  │    updateEngineer(),   // PUT /api/engineers/{id}              │   │  │
│  │  │    deleteEngineer(),   // DELETE /api/engineers/{id}           │   │  │
│  │  │    syncEngineer()      // POST /api/engineers/{id}/sync        │   │  │
│  │  │  }                                                              │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  DATA TRANSFORMER (src/data/engineers.ts)                              │  │
│  │  transformEngineerFromAPI()                                            │  │
│  │  • snake_case → camelCase conversion                                   │  │
│  │  • Type safety enforcement                                             │  │
│  │  • Default value handling                                              │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST
                                      │ fetch() requests
                                      ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND (Uvicorn)                               │
│                         http://localhost:8000                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  MIDDLEWARE                                                             │  │
│  │  • CORS (allow http://localhost:5173)                                  │  │
│  │  • Request logging                                                     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  ROUTING (app/main.py)                                                 │  │
│  │  app.include_router(engineers_router, prefix="/api")                  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  API ROUTES (app/api/routes/engineers.py)                             │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │  @router.get("/engineers")          → list_engineers()          │   │  │
│  │  │  @router.post("/engineers")         → create_engineer()         │   │  │
│  │  │  @router.get("/engineers/{id}")     → get_engineer()            │   │  │
│  │  │  @router.put("/engineers/{id}")     → update_engineer()         │   │  │
│  │  │  @router.delete("/engineers/{id}")  → delete_engineer()         │   │  │
│  │  │  @router.post("/engineers/{id}/sync") → sync_engineer()         │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  PYDANTIC SCHEMAS (app/schemas/engineer.py)                           │  │
│  │  • Request validation                                                  │  │
│  │  • Response serialization                                              │  │
│  │  • Type coercion & checking                                            │  │
│  │  Classes: EngineerCreate, EngineerUpdate, EngineerResponse            │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  BUSINESS LOGIC SERVICES                                               │  │
│  │  ┌───────────────────────────────────────────────────────────────┐     │  │
│  │  │  GitHubService (app/services/github_service.py)              │     │  │
│  │  │  • Fetch user profile                                         │     │  │
│  │  │  • Get repositories                                           │     │  │
│  │  │  • Calculate stats (commits, stars, forks)                    │     │  │
│  │  │  • Extract top languages                                      │     │  │
│  │  │  • Build activity timeline                                    │     │  │
│  │  └───────────────────────────────────────────────────────────────┘     │  │
│  │  ┌───────────────────────────────────────────────────────────────┐     │  │
│  │  │  ScoringService (app/services/scoring_service.py)            │     │  │
│  │  │  • Calculate compatibility score                              │     │  │
│  │  │  • Calculate trust score                                      │     │  │
│  │  │  • Generate compatibility breakdown                           │     │  │
│  │  │  • Generate trust evidence                                    │     │  │
│  │  │  • Create AI highlights                                       │     │  │
│  │  └───────────────────────────────────────────────────────────────┘     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  SQLALCHEMY ORM (app/database.py)                                      │  │
│  │  • Session management                                                  │  │
│  │  • Connection pooling                                                  │  │
│  │  • Transaction handling                                                │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                         │
│                                      ↓                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  MODELS (app/models/engineer.py)                                       │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │  class Engineer(Base):                                          │   │  │
│  │  │    id, name, avatar, role, location                            │   │  │
│  │  │    github_username, bio                                         │   │  │
│  │  │    compatibility_score, trust_score, experience                │   │  │
│  │  │    total_repos, total_commits, total_stars, total_forks        │   │  │
│  │  │    skills (JSON), top_languages (JSON)                         │   │  │
│  │  │    recent_activity (JSON), compatibility_breakdown (JSON)      │   │  │
│  │  │    trust_evidence (JSON), highlights (JSON)                    │   │  │
│  │  │    created_at, updated_at, last_synced_at, is_active           │   │  │
│  │  └─────────────────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                         SQLITE DATABASE (elite.db)                             │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  engineers TABLE                                                        │  │
│  │  • Primary key: id (auto-increment)                                    │  │
│  │  • Indexed: github_username (unique)                                   │  │
│  │  • JSON fields: skills, top_languages, recent_activity, etc.           │  │
│  │  • Timestamps: created_at, updated_at, last_synced_at                  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ↓
┌───────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │  GitHub API (api.github.com)                                           │  │
│  │  • Rate limit: 5000 requests/hour with token                           │  │
│  │  • Endpoints used:                                                     │  │
│  │    GET /users/{username}                                               │  │
│  │    GET /users/{username}/repos                                         │  │
│  │    GET /repos/{owner}/{repo}/commits                                   │  │
│  │    GET /repos/{owner}/{repo}/languages                                 │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example: Create Engineer

```
┌──────────────────────────────────────────────────────────────────────┐
│ 1. USER FILLS FORM                                                   │
│    • Name: "Sarah Chen"                                              │
│    • GitHub: "torvalds"                                              │
│    • Skills: ["React", "TypeScript", "Python"]                       │
│    • Experience: 8                                                   │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 2. REACT COMPONENT (AddEngineer.tsx)                                │
│    const handleSubmit = async (e) => {                              │
│      await api.createEngineer(formData)                             │
│    }                                                                 │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 3. API SERVICE (api.ts)                                             │
│    createEngineer: async (data) => {                                │
│      const response = await fetch(                                  │
│        'http://localhost:8000/api/engineers',                       │
│        { method: 'POST', body: JSON.stringify(data) }               │
│      )                                                               │
│      return response.json()                                         │
│    }                                                                 │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP POST Request
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 4. FASTAPI ROUTE (@router.post("/engineers"))                      │
│    def create_engineer(                                             │
│      engineer: EngineerCreate,                                      │
│      db: Session = Depends(get_db)                                  │
│    ):                                                                │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 5. PYDANTIC VALIDATION (EngineerCreate schema)                      │
│    • Validates all required fields                                  │
│    • Converts types if needed                                       │
│    • Raises 422 if invalid                                          │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 6. GITHUB SERVICE (fetch_user_data)                                 │
│    github_data = GitHubService.fetch_user_data("torvalds")          │
│    • GET https://api.github.com/users/torvalds                      │
│    • GET https://api.github.com/users/torvalds/repos                │
│    • Calculate: total_repos, total_commits, stars, forks            │
│    • Extract: top_languages, recent_activity                        │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 7. SCORING SERVICE (calculate_scores)                               │
│    scores = ScoringService.calculate_all_scores(github_data, ...)   │
│    • compatibility_score = calculate_compatibility(...)             │
│    • trust_score = calculate_trust(...)                             │
│    • compatibility_breakdown = {...}                                │
│    • trust_evidence = {...}                                         │
│    • highlights = generate_highlights(...)                          │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 8. DATABASE INSERT (SQLAlchemy)                                     │
│    db_engineer = Engineer(                                          │
│      name="Sarah Chen",                                             │
│      github_username="torvalds",                                    │
│      compatibility_score=92,                                        │
│      trust_score=95,                                                │
│      ...all other fields...                                         │
│    )                                                                 │
│    db.add(db_engineer)                                              │
│    db.commit()                                                       │
│    db.refresh(db_engineer)  # Get ID                                │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 9. RESPONSE SERIALIZATION (EngineerResponse schema)                 │
│    return EngineerResponse.from_orm(db_engineer)                    │
│    • Converts SQLAlchemy model to Pydantic model                    │
│    • Serializes to JSON                                             │
│    • Returns snake_case fields                                      │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP 201 Created
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 10. API SERVICE RECEIVES RESPONSE                                   │
│     Response JSON: {                                                │
│       "id": 6,                                                       │
│       "name": "Sarah Chen",                                         │
│       "github_username": "torvalds",                                │
│       "compatibility_score": 92,                                    │
│       ...                                                            │
│     }                                                                │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 11. REACT COMPONENT UPDATES                                         │
│     • setSuccess(true)                                              │
│     • Show success message                                          │
│     • setTimeout(() => navigate("/dashboard"), 2000)                │
└──────────────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌──────────────────────────────────────────────────────────────────────┐
│ 12. DASHBOARD REFETCHES DATA                                        │
│     • TanStack Query sees route change                              │
│     • Or refetches after stale time (30s)                           │
│     • New engineer appears in list                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE engineers (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Info
    name VARCHAR(200) NOT NULL,
    avatar VARCHAR(500),
    role VARCHAR(200),
    location VARCHAR(200),
    github_username VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT,
    
    -- Scores
    compatibility_score FLOAT DEFAULT 0,
    trust_score FLOAT DEFAULT 0,
    experience INTEGER DEFAULT 0,
    
    -- GitHub Stats
    total_repos INTEGER DEFAULT 0,
    total_commits INTEGER DEFAULT 0,
    total_stars INTEGER DEFAULT 0,
    total_forks INTEGER DEFAULT 0,
    
    -- JSON Fields
    skills JSON,  -- Array of strings
    top_languages JSON,  -- Array of {name, percentage, color}
    recent_activity JSON,  -- Array of {date, commits}
    compatibility_breakdown JSON,  -- {skill_match, project_relevance, ...}
    trust_evidence JSON,  -- {recent_commits, popular_repos, ...}
    highlights JSON,  -- Array of strings
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_synced_at DATETIME,
    is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_github_username ON engineers(github_username);
CREATE INDEX idx_compatibility_score ON engineers(compatibility_score);
CREATE INDEX idx_created_at ON engineers(created_at);
```

---

## 📦 Tech Stack Details

### Frontend Dependencies
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "typescript": "^5.x",
  "@tanstack/react-query": "^5.x",
  "tailwindcss": "^3.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x"
}
```

### Backend Dependencies
```txt
fastapi==0.128.0
uvicorn==0.40.0
sqlalchemy==2.0.45
pydantic==2.12.5
pydantic-settings==2.7.1
python-dotenv==1.0.1
requests==2.31.0
```

---

This architecture ensures:
- ✅ Clear separation of concerns
- ✅ Type safety end-to-end
- ✅ Scalable and maintainable
- ✅ Real-time data flow
- ✅ Proper error handling
- ✅ Caching for performance
- ✅ Easy to test and debug
