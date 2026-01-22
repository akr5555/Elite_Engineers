import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # 1. Database (Local Docker)
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:admin@localhost:5435/elite_engineers")
    
    # 2. GitHub Tokens (Split by comma for rotation)
    GITHUB_TOKENS = os.getenv("GITHUB_TOKENS", "").split(",")
    
    # 3. AI Keys
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

settings = Settings()