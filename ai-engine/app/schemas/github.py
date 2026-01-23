"""Pydantic schemas for GitHub API data."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class GitHubProfile(BaseModel):
    """GitHub user profile data."""
    login: str
    id: int
    avatar_url: str
    name: Optional[str] = None
    company: Optional[str] = None
    blog: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    bio: Optional[str] = None
    public_repos: int
    public_gists: int
    followers: int
    following: int
    created_at: datetime
    updated_at: datetime


class GitHubRepo(BaseModel):
    """GitHub repository data."""
    id: int
    name: str
    full_name: str
    private: bool
    description: Optional[str] = None
    fork: bool
    created_at: datetime
    updated_at: datetime
    pushed_at: Optional[datetime] = None
    size: int
    stargazers_count: int = Field(default=0, alias="stargazers_count")
    watchers_count: int = Field(default=0, alias="watchers_count")
    forks_count: int = Field(default=0, alias="forks_count")
    open_issues_count: int = Field(default=0, alias="open_issues_count")
    language: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    
    class Config:
        populate_by_name = True


class GitHubCommit(BaseModel):
    """GitHub commit data."""
    sha: str
    commit: Dict
    author: Optional[Dict] = None
    committer: Optional[Dict] = None


class GitHubStats(BaseModel):
    """Aggregated GitHub statistics."""
    total_repos: int
    total_commits: int
    total_stars: int
    total_forks: int
    languages: Dict[str, int]  # Language name -> count
    popular_repos: List[str]
    contribution_streak: int
    recent_activity_score: float


class GitHubSyncRequest(BaseModel):
    """Request to sync GitHub data for an engineer."""
    github_username: str
    force: bool = False  # Force refresh even if recently synced
