"""Engineer database model."""

from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base


class Engineer(Base):
    """
    Engineer model representing software engineers in the platform.
    
    This model stores both basic engineer information and calculated metrics
    like compatibility scores, trust scores, and GitHub statistics.
    """
    
    __tablename__ = "engineers"
    
    # Primary Key
    id = Column(String, primary_key=True, index=True)
    
    # Basic Information
    name = Column(String(255), nullable=False)
    avatar = Column(String(500))
    role = Column(String(255))
    location = Column(String(255))
    github_username = Column(String(100), unique=True, index=True, nullable=False)
    bio = Column(Text)
    job_roles = Column(Text)  # Job roles the engineer is looking for
    
    # Calculated Scores (0-100)
    compatibility_score = Column(Float, default=0.0)
    trust_score = Column(Float, default=0.0)
    
    # Experience
    experience = Column(Integer, default=0)  # Years of experience
    
    # GitHub Statistics
    total_repos = Column(Integer, default=0)
    total_commits = Column(Integer, default=0)
    total_stars = Column(Integer, default=0)
    total_forks = Column(Integer, default=0)
    
    # Complex Data (stored as JSON)
    # PostgreSQL has better JSONB support, but JSON works across databases
    skills = Column(JSON, default=list)  # List of skill strings
    top_languages = Column(JSON, default=list)  # [{"name": "Python", "percentage": 45, "color": "#3776AB"}]
    recent_activity = Column(JSON, default=list)  # [{"date": "2024-01-15", "commits": 12}]
    compatibility_breakdown = Column(JSON, default=dict)  # {"skillMatch": 96, "projectRelevance": 92, ...}
    trust_evidence = Column(JSON, default=dict)  # {"recentCommits": 156, "popularRepos": [...], ...}
    highlights = Column(JSON, default=list)  # List of highlight strings
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_synced_at = Column(DateTime(timezone=True))  # Last GitHub sync
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        """String representation of Engineer."""
        return f"<Engineer(id={self.id}, name={self.name}, github={self.github_username})>"
