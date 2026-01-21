"""GitHub API integration service."""

import httpx
from app.config import settings
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class GitHubService:
    """
    Service for interacting with GitHub API.
    
    Handles fetching user profiles, repositories, commits, and other data
    needed for engineer scoring and profile creation.
    """
    
    def __init__(self):
        """Initialize GitHub service with API configuration."""
        self.base_url = settings.GITHUB_API_URL
        self.headers = {
            "Authorization": f"token {settings.GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.timeout = 30.0
    
    async def get_user_profile(self, username: str) -> Dict[str, Any]:
        """
        Fetch GitHub user profile.
        
        Args:
            username: GitHub username
            
        Returns:
            User profile data
            
        Raises:
            httpx.HTTPError: If API request fails
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/users/{username}",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch GitHub profile for {username}: {e}")
                raise
    
    async def get_user_repos(self, username: str, max_pages: int = 5) -> List[Dict[str, Any]]:
        """
        Fetch all user repositories with pagination.
        
        Args:
            username: GitHub username
            max_pages: Maximum number of pages to fetch (default: 5)
            
        Returns:
            List of repository data
        """
        repos = []
        page = 1
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while page <= max_pages:
                try:
                    response = await client.get(
                        f"{self.base_url}/users/{username}/repos",
                        params={
                            "page": page,
                            "per_page": 100,
                            "sort": "updated",
                            "direction": "desc"
                        },
                        headers=self.headers
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if not data:
                        break
                    
                    repos.extend(data)
                    page += 1
                    
                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch repos for {username} (page {page}): {e}")
                    break
        
        return repos
    
    async def get_repo_languages(self, owner: str, repo_name: str) -> Dict[str, int]:
        """
        Fetch programming languages used in a repository.
        
        Args:
            owner: Repository owner
            repo_name: Repository name
            
        Returns:
            Dictionary of language names to bytes of code
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/repos/{owner}/{repo_name}/languages",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch languages for {owner}/{repo_name}: {e}")
                return {}
    
    async def get_user_commits(
        self,
        username: str,
        repo_name: str,
        since: Optional[datetime] = None,
        max_commits: int = 100
    ) -> List[Dict]:
        """
        Fetch user commits for a specific repository.
        
        Args:
            username: GitHub username
            repo_name: Repository name
            since: Only commits after this date
            max_commits: Maximum number of commits to fetch
            
        Returns:
            List of commit data
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                params = {
                    "author": username,
                    "per_page": max_commits,
                }
                
                if since:
                    params["since"] = since.isoformat()
                
                response = await client.get(
                    f"{self.base_url}/repos/{username}/{repo_name}/commits",
                    params=params,
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch commits for {username}/{repo_name}: {e}")
                return []
    
    async def get_contribution_stats(self, username: str) -> Dict[str, Any]:
        """
        Calculate comprehensive contribution statistics.
        
        This aggregates data from repositories, commits, and other sources
        to create a complete picture of the engineer's GitHub activity.
        
        Args:
            username: GitHub username
            
        Returns:
            Dictionary with stats including:
            - total_repos: Total number of repositories
            - total_commits: Estimated total commits (last 90 days for sample repos)
            - total_stars: Total stars received
            - total_forks: Total forks
            - languages: Language usage statistics
            - popular_repos: List of popular repository names
        """
        # Fetch repositories
        repos = await self.get_user_repos(username)
        
        # Initialize statistics
        total_commits = 0
        total_stars = 0
        total_forks = 0
        languages = {}
        popular_repos = []
        
        # Calculate date for recent commits (last 90 days)
        since_date = datetime.now() - timedelta(days=90)
        
        # Process repositories
        for i, repo in enumerate(repos):
            # Aggregate stars and forks
            total_stars += repo.get("stargazers_count", 0)
            total_forks += repo.get("forks_count", 0)
            
            # Track popular repos (more than 10 stars)
            if repo.get("stargazers_count", 0) > 10:
                popular_repos.append(repo["name"])
            
            # Aggregate languages from top repos only (to avoid rate limits)
            if i < 10 and repo.get("language"):
                languages[repo["language"]] = languages.get(repo["language"], 0) + 1
            
            # Fetch commits for popular or recently updated repos (limit to avoid rate limits)
            if i < 5:  # Only check first 5 repos for commits
                commits = await self.get_user_commits(
                    username,
                    repo["name"],
                    since=since_date
                )
                total_commits += len(commits)
        
        return {
            "total_repos": len(repos),
            "total_commits": total_commits,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "languages": languages,
            "popular_repos": popular_repos[:10],  # Top 10 popular repos
        }
    
    async def check_user_exists(self, username: str) -> bool:
        """
        Check if a GitHub user exists.
        
        Args:
            username: GitHub username to check
            
        Returns:
            True if user exists, False otherwise
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(
                    f"{self.base_url}/users/{username}",
                    headers=self.headers
                )
                return response.status_code == 200
            except httpx.HTTPError:
                return False


# Create global instance
github_service = GitHubService()
