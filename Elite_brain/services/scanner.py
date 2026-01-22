import httpx
import random
import logging
from config import settings

logger = logging.getLogger(__name__)

class GitHubScanner:
    def _get_headers(self):
        """Rotates tokens to avoid rate limits."""
        if not settings.GITHUB_TOKENS:
            raise ValueError("No GitHub Tokens found in .env!")
        token = random.choice(settings.GITHUB_TOKENS)
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async def scan_profile(self, username: str):
        """
        Fetches:
        1. Profile Stats (Trust)
        2. Top Repositories (Compatibility)
        3. README & Language Data (Content for AI)
        """
        # GraphQL Query: Optimized for Speed (1 Request)
        query = """
        query($login: String!) {
          user(login: $login) {
            login, name, bio, company, location, createdAt, avatarUrl, email
            followers { totalCount }
            following { totalCount }
            # Trust Signal: Is the account flagged?
            isBountyHunter
            isCampusExpert
            isDeveloperProgramMember
            
            # Fetch Top 6 Repos (Quality over Quantity)
            repositories(first: 6, orderBy: {field: PUSHED_AT, direction: DESC}, isFork: false, privacy: PUBLIC) {
              totalCount
              nodes {
                name
                description
                stargazerCount
                forkCount
                primaryLanguage { name }
                diskUsage # Size in KB
                
                # Code Quality Signal: Default Branch & Recent Commits
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 1) { totalCount } # Total Commits
                      authoredDate
                    }
                  }
                }
                
                # Authenticity Signal: Fetch README for AI analysis
                object(expression: "HEAD:README.md") {
                  ... on Blob {
                    text
                  }
                }
              }
            }
            
            # Trust Signal: Contribution Calendar
            contributionsCollection {
              contributionCalendar {
                totalContributions
              }
            }
          }
        }
        """
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.github.com/graphql",
                    json={"query": query, "variables": {"login": username}},
                    headers=self._get_headers(),
                    timeout=15.0
                )
                
                if response.status_code != 200:
                    logger.error(f"GitHub API Error: {response.text}")
                    return None
                
                data = response.json().get("data", {}).get("user")
                return self._normalize(data) if data else None
                
            except Exception as e:
                logger.error(f"Network Error: {e}")
                return None

    def _normalize(self, data):
        """Cleans up the messy JSON into a flat structure for the Brain."""
        if not data: return None
        
        repos = data.get("repositories", {}).get("nodes", [])
        
        # 1. Calculate Stats
        languages = list({r["primaryLanguage"]["name"] for r in repos if r.get("primaryLanguage")})
        total_stars = sum(r.get("stargazerCount", 0) for r in repos)
        total_forks = sum(r.get("forkCount", 0) for r in repos)
        
        # 2. Extract Code/Readme Text for AI (Limit length to save tokens)
        profile_context = f"Bio: {data.get('bio') or ''}. "
        for r in repos:
            readme = r.get("object", {}).get("text", "")[:500] if r.get("object") else ""
            profile_context += f"Repo {r['name']}: {r['description'] or ''}. Tools: {r.get('primaryLanguage', {}).get('name')}. Context: {readme} ... "

        return {
            "username": data.get("login"),
            "full_name": data.get("name"),
            "avatar": data.get("avatarUrl"),
            "email_verified": bool(data.get("email")), # Trust Signal
            "location": data.get("location"),
            "company": data.get("company"),
            "stats": {
                "followers": data.get("followers", {}).get("totalCount", 0),
                "repos": data.get("repositories", {}).get("totalCount", 0),
                "stars": total_stars,
                "forks": total_forks,
                "languages": languages,
                "commits_last_year": data.get("contributionsCollection", {}).get("contributionCalendar", {}).get("totalContributions", 0),
                "account_created": data.get("createdAt"),
                "is_pro": data.get("isDeveloperProgramMember") or data.get("isCampusExpert")
            },
            "raw_text_for_ai": profile_context  # This goes to Vector DB & Groq
        }