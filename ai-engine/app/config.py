"""Configuration settings for the Elite AI Engine."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    DATABASE_URL: str
    
    # GitHub API Configuration
    GITHUB_TOKEN: str
    GITHUB_API_URL: str = "https://api.github.com"
    
    # API Configuration
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Elite - Engineer Discovery Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-powered engineer discovery and matching platform"
    
    # Security Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Configuration
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
