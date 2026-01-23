"""AI Engine Service for Elite Brain integration."""

import httpx
import logging
import asyncio
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class AIEngineService:
    """Service to interact with Elite Brain AI Engine."""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        """Initialize AI Engine service with base URL.
        
        Args:
            base_url: Base URL of the Elite Brain AI Engine
        """
        self.base_url = base_url
        self.timeout = 90.0  # AI processing can take longer
        self.max_retries = 2
        self.retry_delay = 2  # seconds
    
    async def check_health(self) -> bool:
        """Check if Elite Brain AI Engine is responding.
        
        Returns:
            True if Elite Brain is healthy, False otherwise
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.base_url}/docs")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Elite Brain health check failed: {e}")
            return False
        
    async def analyze_engineer(self, username: str, job_description: str) -> Optional[Dict[str, Any]]:
        """Analyze an engineer's profile and get AI scores with retry logic.
        
        Args:
            username: GitHub username
            job_description: Job roles the engineer is looking for
            
        Returns:
            Dict containing trust_score, compatibility_score, and other AI analysis
        """
        logger.info(f"🤖 [AI ENGINE] Starting analysis for {username}")
        logger.info(f"🤖 [AI ENGINE] Job description: {job_description[:100]}...")
        logger.info(f"🤖 [AI ENGINE] Elite Brain URL: {self.base_url}")
        
        # Check if Elite Brain is healthy first
        is_healthy = await self.check_health()
        if not is_healthy:
            logger.error(f"🤖 [AI ENGINE] Elite Brain is not responding - health check failed")
            return None
        
        logger.info(f"🤖 [AI ENGINE] Elite Brain health check passed ✓")
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"🤖 [AI ENGINE] Attempt {attempt + 1}/{self.max_retries}...")
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        f"{self.base_url}/analyze",
                        json={
                            "username": username,
                            "job_description": job_description
                        }
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    # Extract scores from the response
                    scores = data.get("scores", {})
                    result = {
                        "trust_score": scores.get("trust_score", 0),
                        "compatibility_score": scores.get("compatibility_score", 0),
                        "ai_explanation": data.get("ai_explanation", ""),
                        "full_data": data  # Store complete response for debugging
                    }
                    
                    logger.info(f"🤖 [AI ENGINE] ✅ SUCCESS - Trust: {result['trust_score']}, Compatibility: {result['compatibility_score']}")
                    return result
                    
            except httpx.TimeoutException as e:
                logger.error(f"🤖 [AI ENGINE] Timeout on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    logger.info(f"🤖 [AI ENGINE] Retrying in {self.retry_delay} seconds...")
                    await asyncio.sleep(self.retry_delay)
                    continue
            except httpx.HTTPError as e:
                logger.error(f"🤖 [AI ENGINE] HTTP error on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
            except Exception as e:
                logger.error(f"🤖 [AI ENGINE] Unexpected error on attempt {attempt + 1}: {e}")
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay)
                    continue
        
        logger.error(f"🤖 [AI ENGINE] ❌ FAILED after {self.max_retries} attempts")
        return None
    
    async def get_candidates(self) -> List[Dict[str, Any]]:
        """Get all candidates sorted by compatibility score.
        
        Returns:
            List of candidates with their scores
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/candidates")
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error while fetching candidates: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error while fetching candidates: {e}")
            return []
    
    async def search_candidates(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search candidates using natural language query.
        
        Args:
            query: Natural language search query (e.g., "Need a Node.js backend dev")
            limit: Maximum number of results to return
            
        Returns:
            List of matching candidates
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
            logger.error(f"HTTP error while searching candidates: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error while searching candidates: {e}")
            return []


# Create a singleton instance
ai_engine_service = AIEngineService()
