import httpx
import random
import logging
from config import settings

logger = logging.getLogger(__name__)

class GitHubScanner:
    def _get_headers(self):
        if not settings.GITHUB_TOKENS:
            raise ValueError("No GitHub Tokens found in .env!")
        token = random.choice(settings.GITHUB_TOKENS)
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    async def scan_profile(self, username: str):
        # 1. THE LOOSE QUERY (No filters, just data)
        query = """
        query($login: String!) {
          user(login: $login) {
            login, name, bio, location, avatarUrl, email
            followers { totalCount }
            
            # Fetch Repos (Including Forks)
            repositories(first: 10, orderBy: {field: PUSHED_AT, direction: DESC}, privacy: PUBLIC) {
              totalCount
              nodes {
                name
                description
                isFork               # <--- WE NEED THIS TO JUDGE THEM
                stargazerCount
                primaryLanguage { name }
                
                # Check for Authenticity (Commits)
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 1) { totalCount } 
                    }
                  }
                }
                
                object(expression: "HEAD:README.md") {
                  ... on Blob { text }
                }
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
                data = response.json().get("data", {}).get("user")
                
                # 2. THE HARD FILTER (Reject 0 Repos/Ghost Accounts)
                if not data: return None
                repo_count = data.get("repositories", {}).get("totalCount", 0)
                if repo_count == 0:
                    logger.warning(f"❌ {username} rejected: 0 Repositories.")
                    return None
                
                return self._normalize(data)
                
            except Exception as e:
                logger.error(f"Scan Error: {e}")
                return None

    def _normalize(self, data):
        repos = data.get("repositories", {}).get("nodes", [])
        
        # Calculate Real Commits (Ignore empty repos)
        total_commits = 0
        repo_summaries = []
        
        for r in repos:
            if not r: continue
            commits = r.get("defaultBranchRef", {}).get("target", {}).get("history", {}).get("totalCount", 0) if r.get("defaultBranchRef") else 0
            total_commits += commits
            
            # Tag the repo for the AI Rule Book
            type_tag = "[FORK/TUTORIAL]" if r.get("isFork") else "[ORIGINAL]"
            readme = r.get("object", {}).get("text", "")[:300] if r.get("object") else "No Readme"
            
            repo_summaries.append(
                f"Repo: {r.get('name')} {type_tag}\n"
                f"Commits: {commits} | Stars: {r.get('stargazerCount')}\n"
                f"Desc: {r.get('description')}\n"
                f"Context: {readme}...\n"
            )

        # 3. REJECT IF TOTAL COMMITS ARE ZERO (The "Do Nothing" Rule)
        if total_commits == 0:
             logger.warning(f"❌ {data.get('login')} rejected: 0 Commits total.")
             return None

        return {
            "username": data.get("login"),
            "full_name": data.get("name"),
            "avatar": data.get("avatarUrl"),
            "location": data.get("location"),
            "stats": {
                "followers": data.get("followers", {}).get("totalCount", 0),
                "repos": len(repos),
                "total_commits": total_commits, # <--- Used for Trust Score
            },
            "raw_text_for_ai": "\n".join(repo_summaries)
        }