"""Client service for Elite_brain AI integration."""

import httpx
import logging
from typing import Dict, Any, Optional, List
import os

logger = logging.getLogger(__name__)


class EliteBrainClient:
    """
    Client for interacting with the Elite_brain AI service.
    
    Elite_brain provides:
    - AI-powered trust score calculation
    - Compatibility matching using vector embeddings
    - Explainable AI judgments with fork/bot detection
    - Real-time GitHub profile analysis
    """
    
    def __init__(self, base_url: str = None):
        """
        Initialize Elite_brain client.
        
        Args:
            base_url: Base URL for Elite_brain API (default: http://localhost:8001)
        """
        self.base_url = base_url or os.getenv("ELITE_BRAIN_URL", "http://localhost:8001")
        self.timeout = 60.0  # AI operations can take time
        
    async def analyze_engineer(
        self,
        github_username: str,
        job_description: str = "Full-stack developer with strong problem-solving skills"
    ) -> Dict[str, Any]:
        """
        Analyze a single engineer using Elite_brain AI.
        
        This performs:
        1. GitHub profile scanning
        2. Trust score calculation (commit volume, social proof)
        3. Compatibility matching using vector embeddings
        4. AI-powered explanation with fork/bot detection
        
        Args:
            github_username: GitHub username to analyze
            job_description: Job requirements for compatibility matching
            
        Returns:
            Dictionary containing:
            - candidate: GitHub profile data
            - scores: {trust_score, compatibility_score}
            - ai_explanation: Detailed AI judgment
            
        Raises:
            httpx.HTTPError: If Elite_brain service is unavailable
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/analyze",
                    json={
                        "username": github_username,
                        "job_description": job_description
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                logger.info(
                    f"Elite_brain analyzed {github_username}: "
                    f"Trust={result.get('scores', {}).get('trust_score')}, "
                    f"Match={result.get('scores', {}).get('compatibility_score')}"
                )
                
                return result
                
        except httpx.HTTPError as e:
            logger.error(f"Elite_brain analysis failed for {github_username}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error calling Elite_brain: {e}")
            raise
    
    async def analyze_bulk(
        self,
        github_usernames: List[str],
        job_description: str = "Full-stack developer with strong problem-solving skills"
    ) -> Dict[str, Any]:
        """
        Analyze multiple engineers in parallel using Elite_brain AI.
        
        Args:
            github_usernames: List of GitHub usernames
            job_description: Job requirements for compatibility matching
            
        Returns:
            Dictionary with 'results' key containing list of analysis results
            
        Raises:
            httpx.HTTPError: If Elite_brain service is unavailable
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout * 2) as client:
                response = await client.post(
                    f"{self.base_url}/analyze/bulk",
                    json={
                        "usernames": github_usernames,
                        "job_description": job_description
                    }
                )
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPError as e:
            logger.error(f"Elite_brain bulk analysis failed: {e}")
            raise
    
    async def search_candidates(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search for engineers using vector similarity search.
        
        Args:
            query: Natural language search query (e.g., "React expert")
            limit: Maximum number of results
            
        Returns:
            List of matching engineers with match confidence scores
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/search",
                    json={
                        "query": query,
                        "limit": limit
                    }
                )
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPError as e:
            logger.error(f"Elite_brain search failed: {e}")
            return []
    
    async def get_all_candidates(self) -> List[Dict[str, Any]]:
        """
        Get all analyzed candidates from Elite_brain database.
        
        Returns:
            List of all engineer profiles with scores
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/candidates")
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch candidates from Elite_brain: {e}")
            return []
    
    async def health_check(self) -> bool:
        """
        Check if Elite_brain service is available.
        
        Returns:
            True if service is healthy, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/")
                return response.status_code == 200
        except Exception:
            return False


# Global instance
elite_brain_client = EliteBrainClient()
