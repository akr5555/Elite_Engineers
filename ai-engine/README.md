# Elite AI Engine - FastAPI Backend

Backend API service for the Elite Engineer Discovery Platform. This service handles GitHub data fetching, AI-powered scoring, and engineer profile management.

## Features

- 🚀 FastAPI-powered REST API
- 🤖 AI-based engineer scoring and matching
- 🔗 GitHub API integration
- 📊 PostgreSQL database with SQLAlchemy ORM
- 🔒 Secure authentication and authorization
- 📝 Automatic API documentation (Swagger/OpenAPI)

## Prerequisites

- Python 3.9 or higher
- PostgreSQL 14 or higher
- GitHub Personal Access Token

## Quick Start

### 1. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DATABASE_URL`: Your PostgreSQL connection string
- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `SECRET_KEY`: Generate using `openssl rand -hex 32`

### 4. Setup Database

```bash
# Create database (in PostgreSQL)
createdb elite_db

# The tables will be created automatically when you run the app
```

### 5. Run the Application

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Engineers

- `GET /api/engineers` - List all engineers (with pagination and filters)
- `GET /api/engineers/{id}` - Get specific engineer details
- `POST /api/engineers` - Create new engineer profile
- `DELETE /api/engineers/{id}` - Delete engineer profile

### Query Parameters

**GET /api/engineers**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 50, max: 100)
- `search`: Search by name, role, or GitHub username
- `skills`: Comma-separated list of skills to filter by

## Project Structure

```
ai-engine/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection & session
│   ├── models/
│   │   ├── __init__.py
│   │   └── engineer.py         # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── engineer.py         # Pydantic schemas
│   │   └── github.py           # GitHub-related schemas
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── engineers.py    # Engineer endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── github_service.py   # GitHub API integration
│   │   ├── scoring_service.py  # AI scoring algorithms
│   │   └── engineer_service.py # Business logic
│   └── utils/
│       ├── __init__.py
│       └── helpers.py          # Utility functions
├── .env                        # Environment variables (not in git)
├── .env.example                # Environment template
├── .gitignore
├── requirements.txt            # Python dependencies
└── README.md
```

## Development

### Adding Dependencies

```bash
pip install package-name
pip freeze > requirements.txt
```

### Database Migrations (Future)

For production, use Alembic for database migrations:

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head
```

## GitHub Personal Access Token

To create a GitHub token:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `user`, `read:org`
4. Copy token and add to `.env` file

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| GITHUB_TOKEN | GitHub API token | - |
| API_V1_PREFIX | API route prefix | /api |
| SECRET_KEY | JWT secret key | - |
| ALGORITHM | JWT algorithm | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiration | 30 |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |
| ENVIRONMENT | Environment mode | development |

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Production Deployment

1. Set `ENVIRONMENT=production` in `.env`
2. Use a production-grade server (Gunicorn + Uvicorn workers)
3. Set up proper database connection pooling
4. Configure SSL/TLS
5. Use environment-specific configuration
6. Set up logging and monitoring

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## License

Proprietary - Elite Platform
