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
            - total_commits: Total commits across all repositories
            - total_stars: Total stars received
            - total_forks: Total forks
            - languages: Language usage statistics
            - popular_repos: List of popular repository names
        """
        # Fetch user profile first
        profile = await self.get_user_profile(username)
        
        # Fetch repositories
        repos = await self.get_user_repos(username)
        
        # Initialize statistics
        total_stars = 0
        total_forks = 0
        total_commits = 0
        languages = {}
        popular_repos = []
        
        # Get total commits by searching across all repositories
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                # Use GitHub search API to count total commits by this author
                response = await client.get(
                    f"{self.base_url}/search/commits",
                    params={
                        "q": f"author:{username}",
                        "per_page": 1  # We only need the count
                    },
                    headers={
                        **self.headers,
                        "Accept": "application/vnd.github.cloak-preview+json"  # Required for commit search
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    total_commits = data.get("total_count", 0)
                    logger.info(f"Found {total_commits} total commits for {username} via search API")
            except Exception as e:
                logger.warning(f"Failed to fetch commit count from search API: {e}")
        
        # If search API didn't work, try the statistics endpoint
        if total_commits == 0:
            try:
                response = await client.get(
                    f"{self.base_url}/users/{username}/events/public",
                    params={"per_page": 100},
                    headers=self.headers
                )
                if response.status_code == 200:
                    events = response.json()
                    # Count push events and sum up commits
                    for event in events:
                        if event.get("type") == "PushEvent":
                            commits_in_push = event.get("payload", {}).get("size", 0)
                            total_commits += commits_in_push
                    
                    # Multiply by estimate since we only get recent events
                    if total_commits > 0:
                        total_commits = total_commits * 3  # Rough estimate
                    logger.info(f"Estimated {total_commits} commits from recent events")
            except Exception as e:
                logger.warning(f"Failed to fetch events for commit estimation: {e}")
        
        # Last resort: count commits from repositories directly
        if total_commits == 0 and repos:
            logger.info(f"Counting commits directly from repositories for {username}")
            commit_count_from_repos = 0
            
            # Count commits from top repositories
            for repo in repos[:15]:  # Check top 15 repos
                try:
                    response = await client.get(
                        f"{self.base_url}/repos/{username}/{repo['name']}/commits",
                        params={
                            "author": username,
                            "per_page": 1  # Just need count from headers
                        },
                        headers=self.headers
                    )
                    
                    if response.status_code == 200:
                        # Try to get total count from Link header
                        link_header = response.headers.get("Link", "")
                        if "last" in link_header:
                            # Extract page number from last link
                            import re
                            match = re.search(r'page=(\d+)>; rel="last"', link_header)
                            if match:
                                commit_count_from_repos += int(match.group(1)) * 100
                        else:
                            # Small repo, just count what we got
                            commits = response.json()
                            commit_count_from_repos += len(commits)
                            
                except Exception as e:
                    logger.debug(f"Could not count commits for {repo['name']}: {e}")
                    continue
            
            total_commits = commit_count_from_repos
            logger.info(f"Counted {total_commits} commits from top repositories")
        
        # Process repositories for other stats
        for i, repo in enumerate(repos):
            # Aggregate stars and forks
            total_stars += repo.get("stargazers_count", 0)
            total_forks += repo.get("forks_count", 0)
            
            # Track popular repos (more than 5 stars)
            if repo.get("stargazers_count", 0) > 5:
                popular_repos.append(repo["name"])
            
            # Aggregate languages from repos
            if repo.get("language"):
                lang = repo["language"]
                languages[lang] = languages.get(lang, 0) + 1
        
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
