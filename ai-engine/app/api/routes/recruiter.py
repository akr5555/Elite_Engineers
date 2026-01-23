"""Recruiter API endpoints for AI-powered search and candidate management."""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Dict, Any
import logging

from app.services.ai_engine_service import ai_engine_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


@router.get("/candidates")
async def get_candidates():
    """
    Get all candidates sorted by compatibility score from AI Engine.
    
    This endpoint is used on the recruiter dashboard to show top talent
    automatically without requiring any search input.
    
    Returns:
        List of candidates with their scores and profiles
    """
    try:
        logger.info("Fetching candidates from AI Engine")
        candidates = await ai_engine_service.get_candidates()
        
        if not candidates:
            logger.warning("No candidates found in AI Engine")
            return []
        
        logger.info(f"Retrieved {len(candidates)} candidates from AI Engine")
        return candidates
        
    except Exception as e:
        logger.error(f"Error fetching candidates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch candidates from AI Engine"
        )


@router.post("/search")
async def search_candidates(
    query: str = Query(..., description="Natural language search query (e.g., 'Need a Node.js backend dev')"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """
    Search candidates using natural language query powered by AI.
    
    This endpoint converts the recruiter's text into vectors and finds
    engineers whose skills mathematically match the request.
    
    Args:
        query: Natural language search query
        limit: Maximum number of results to return
        
    Returns:
        List of matching candidates with match confidence scores
    """
    try:
        logger.info(f"Searching candidates with query: '{query}'")
        results = await ai_engine_service.search_candidates(query, limit)
        
        if not results:
            logger.info("No matching candidates found")
            return []
        
        logger.info(f"Found {len(results)} matching candidates")
        return results
        
    except Exception as e:
        logger.error(f"Error searching candidates: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search candidates using AI Engine"
        )
