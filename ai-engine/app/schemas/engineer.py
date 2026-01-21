"""Pydantic schemas for Engineer API."""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class Language(BaseModel):
    """Programming language with usage statistics."""
    name: str
    percentage: float = Field(..., ge=0, le=100)
    color: str


class Activity(BaseModel):
    """Daily commit activity."""
    date: str
    commits: int = Field(..., ge=0)


class CompatibilityBreakdown(BaseModel):
    """Detailed breakdown of compatibility score components."""
    skillMatch: float = Field(..., ge=0, le=100, alias="skill_match")
    projectRelevance: float = Field(..., ge=0, le=100, alias="project_relevance")
    experience: float = Field(..., ge=0, le=100)
    activityConsistency: float = Field(..., ge=0, le=100, alias="activity_consistency")
    
    class Config:
        populate_by_name = True


class TrustEvidence(BaseModel):
    """Evidence supporting the trust score."""
    recentCommits: int = Field(..., ge=0, alias="recent_commits")
    popularRepos: List[str] = Field(default_factory=list, alias="popular_repos")
    contributionStreak: int = Field(..., ge=0, alias="contribution_streak")
    verifiedEmail: bool = Field(..., alias="verified_email")
    profileComplete: bool = Field(..., alias="profile_complete")
    
    class Config:
        populate_by_name = True


class EngineerBase(BaseModel):
    """Base engineer schema with common fields."""
    name: str = Field(..., min_length=1, max_length=255)
    github_username: str = Field(..., min_length=1, max_length=100)
    role: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    avatar: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: int = Field(default=0, ge=0, le=50)


class EngineerCreate(EngineerBase):
    """Schema for creating a new engineer."""
    
    @field_validator('github_username')
    @classmethod
    def validate_github_username(cls, v: str) -> str:
        """Validate GitHub username format."""
        if not v or not v.strip():
            raise ValueError('GitHub username cannot be empty')
        # Remove @ if present
        v = v.strip().lstrip('@')
        # Basic validation - alphanumeric and hyphens only
        if not all(c.isalnum() or c == '-' for c in v):
            raise ValueError('GitHub username can only contain letters, numbers, and hyphens')
        return v


class EngineerUpdate(BaseModel):
    """Schema for updating an engineer (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = Field(None, max_length=255)
    location: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[int] = Field(None, ge=0, le=50)


class EngineerResponse(EngineerBase):
    """Complete engineer response schema."""
    id: str
    compatibility_score: float = Field(..., ge=0, le=100)
    trust_score: float = Field(..., ge=0, le=100)
    total_repos: int = Field(..., ge=0)
    total_commits: int = Field(..., ge=0)
    total_stars: int = Field(default=0, ge=0)
    total_forks: int = Field(default=0, ge=0)
    top_languages: List[Language]
    recent_activity: List[Activity]
    compatibility_breakdown: CompatibilityBreakdown
    trust_evidence: TrustEvidence
    highlights: List[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_synced_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # Allows creation from ORM models


class EngineerList(BaseModel):
    """Paginated list of engineers."""
    total: int = Field(..., ge=0)
    skip: int = Field(..., ge=0)
    limit: int = Field(..., ge=1)
    engineers: List[EngineerResponse]


class EngineerSummary(BaseModel):
    """Lightweight engineer summary for lists."""
    id: str
    name: str
    avatar: Optional[str]
    role: Optional[str]
    github_username: str
    compatibility_score: float
    trust_score: float
    skills: List[str]
    
    class Config:
        from_attributes = True
