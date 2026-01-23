"""Engineer API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import logging

from app.database import get_db
from app.models.engineer import Engineer
from app.schemas.engineer import (
    EngineerCreate,
    EngineerResponse,
    EngineerList,
    EngineerUpdate,
)
from app.services.github_service import github_service
from app.services.scoring_service import scoring_service
from app.services.ai_engine_service import ai_engine_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/engineers", tags=["engineers"])


@router.get("", response_model=EngineerList)
async def get_engineers(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum records to return"),
    search: Optional[str] = Query(None, description="Search by name, role, or GitHub username"),
    skills: Optional[str] = Query(None, description="Comma-separated skills to filter by"),
    min_trust_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum trust score"),
    min_compatibility_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum compatibility score"),
    db: Session = Depends(get_db)
):
    """
    Get all engineers with optional filtering and pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    - **search**: Search term for name, role, or GitHub username
    - **skills**: Filter by specific skills (comma-separated)
    - **min_trust_score**: Filter by minimum trust score
    - **min_compatibility_score**: Filter by minimum compatibility score
    """
    # Start with base query for active engineers
    query = db.query(Engineer).filter(Engineer.is_active == True)
    
    # Apply search filter
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (Engineer.name.ilike(search_term)) |
            (Engineer.role.ilike(search_term)) |
            (Engineer.github_username.ilike(search_term))
        )
    
    # Apply trust score filter
    if min_trust_score is not None:
        query = query.filter(Engineer.trust_score >= min_trust_score)
    
    # Apply compatibility score filter
    if min_compatibility_score is not None:
        query = query.filter(Engineer.compatibility_score >= min_compatibility_score)
    
    # Note: Skills filtering with JSON requires database-specific queries
    # For PostgreSQL, you'd use: Engineer.skills.contains([skill])
    # For now, we'll handle it in application logic
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and fetch results
    engineers = query.offset(skip).limit(limit).all()
    
    # Filter by skills in application if needed
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        engineers = [
            eng for eng in engineers
            if any(skill in [s.lower() for s in eng.skills] for skill in skill_list)
        ]
        total = len(engineers)
    
    return EngineerList(
        total=total,
        skip=skip,
        limit=limit,
        engineers=engineers
    )


@router.get("/{engineer_id}", response_model=EngineerResponse)
async def get_engineer(
    engineer_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific engineer by ID.
    
    - **engineer_id**: Unique identifier of the engineer
    """
    engineer = db.query(Engineer).filter(
        Engineer.id == engineer_id,
        Engineer.is_active == True
    ).first()
    
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    return engineer


@router.post("", response_model=EngineerResponse, status_code=status.HTTP_201_CREATED)
async def create_engineer(
    engineer_data: EngineerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new engineer profile by syncing with GitHub.
    
    This endpoint:
    1. Validates the GitHub username
    2. Fetches GitHub profile and statistics
    3. Calculates trust and compatibility scores
    4. Creates the engineer profile in the database
    
    - **engineer_data**: Engineer information including GitHub username
    """
    # Check if engineer already exists
    existing = db.query(Engineer).filter(
        Engineer.github_username == engineer_data.github_username
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Engineer with GitHub username '{engineer_data.github_username}' already exists"
        )
    
    # Fetch GitHub data
    try:
        logger.info(f"Fetching GitHub data for {engineer_data.github_username}")
        github_profile = await github_service.get_user_profile(engineer_data.github_username)
        github_stats = await github_service.get_contribution_stats(engineer_data.github_username)
        logger.info(f"Successfully fetched GitHub data for {engineer_data.github_username}")
    except Exception as e:
        logger.error(f"Failed to fetch GitHub data: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch GitHub data for username '{engineer_data.github_username}'. "
                   f"Please ensure the username is correct and the profile is public."
        )
    
    # Calculate scores using Elite_brain AI
    trust_score = 0.0
    compatibility_score = 0.0
    ai_explanation = ""
    used_ai = False
    
    # Always use Elite_brain AI for scoring
    logger.info(f"\n{'='*80}")
    logger.info(f"🚀 USING ELITE_BRAIN AI FOR PROFILE CREATION")
    logger.info(f"📝 GitHub Username: {engineer_data.github_username}")
    logger.info(f"💼 Job Roles: {engineer_data.job_roles or 'General Full-Stack'}")
    logger.info(f"{'='*80}\n")
    
    try:
        # Call Elite_brain AI for real-time scoring
        job_desc = engineer_data.job_roles or "Full-stack developer with strong problem-solving skills"
        ai_result = await scoring_service.calculate_scores_with_ai(
            engineer_data.github_username,
            job_desc
        )
        
        if ai_result.get("source") == "elite_brain_ai":
            trust_score = float(ai_result.get("trust_score", 0.0))
            compatibility_score = float(ai_result.get("compatibility_score", 0.0))
            ai_explanation = ai_result.get("ai_explanation", "")
            used_ai = True
            
            logger.info(f"\n{'='*80}")
            logger.info(f"✅ ELITE_BRAIN AI SUCCESS!")
            logger.info(f"🎯 Trust Score: {trust_score}")
            logger.info(f"🎯 Compatibility Score: {compatibility_score}")
            logger.info(f"📊 AI Explanation: {ai_explanation[:100]}..." if ai_explanation else "📊 No explanation")
            logger.info(f"{'='*80}\n")
        else:
            logger.warning(f"\n{'='*80}")
            logger.warning(f"⚠️  Elite_brain AI unavailable: {ai_result.get('error', 'Unknown')}")
            logger.warning(f"🔄 Using fallback scoring")
            logger.warning(f"{'='*80}\n")
            
            trust_score = scoring_service.calculate_trust_score(github_stats)
            compatibility_score = scoring_service.calculate_compatibility_score(
                engineer_data.skills,
                [],
                github_stats
            )
            ai_explanation = "AI analysis temporarily unavailable. Scores calculated locally."
    except Exception as e:
        logger.error(f"❌ AI Engine Error: {e}")
        logger.warning(f"🔄 Using fallback scoring")
        
        trust_score = scoring_service.calculate_trust_score(github_stats)
        compatibility_score = scoring_service.calculate_compatibility_score(
            engineer_data.skills,
            [],
            github_stats
        )
        ai_explanation = "AI analysis failed. Scores calculated locally."
    
    # Generate detailed breakdown and highlights
    # Log final decision
    logger.info(f"\n📊 FINAL SCORES - Using {'AI Engine 🤖' if used_ai else 'Traditional Algorithm 📖'}")
    logger.info(f"   Trust: {trust_score} | Compatibility: {compatibility_score}\n")
    
    # Generate activity data
    recent_activity = scoring_service.generate_recent_activity(days=7)
    
    # Generate compatibility breakdown
    compatibility_breakdown = scoring_service.generate_compatibility_breakdown(
        compatibility_score,
        engineer_data.skills,
        [],
        github_stats
    )
    
    # Generate top languages
    top_languages = scoring_service.generate_top_languages(
        github_stats.get("languages", {}),
        limit=5
    )
    
    # Calculate contribution streak
    contribution_streak = scoring_service.calculate_contribution_streak(recent_activity)
    
    # Generate highlights
    highlights = scoring_service.generate_highlights(
        github_stats,
        trust_score,
        compatibility_score,
        engineer_data.skills
    )
    
    # Extract name with fallback chain
    profile_name = github_profile.get("name") or engineer_data.name or engineer_data.github_username
    
    # Extract location from GitHub profile
    github_location = github_profile.get("location") or ""
    final_location = engineer_data.location or github_location or "Not specified"
    
    # Extract bio from GitHub profile
    github_bio = github_profile.get("bio") or ""
    final_bio = engineer_data.bio or github_bio or f"Software engineer - {engineer_data.github_username}"
    
    # Get avatar URL
    avatar_url = github_profile.get("avatar_url") or ""
    
    # Get role with fallback
    final_role = engineer_data.role or "Software Engineer"
    
    # Create engineer record
    engineer = Engineer(
        id=str(uuid.uuid4()),
        name=profile_name,
        avatar=avatar_url,
        role=final_role,
        location=final_location,
        github_username=engineer_data.github_username,
        bio=final_bio,
        job_roles=engineer_data.job_roles,
        skills=engineer_data.skills,
        experience=engineer_data.experience,
        
        # Calculated scores
        compatibility_score=round(compatibility_score, 2),
        trust_score=round(trust_score, 2),
        
        # GitHub statistics
        total_repos=github_stats.get("total_repos", 0),
        total_commits=github_stats.get("total_commits", 0),
        total_stars=github_stats.get("total_stars", 0),
        total_forks=github_stats.get("total_forks", 0),
        
        # Complex data
        top_languages=top_languages,
        recent_activity=recent_activity,
        compatibility_breakdown=compatibility_breakdown,
        trust_evidence={
            "recent_commits": github_stats.get("total_commits", 0),
            "popular_repos": github_stats.get("popular_repos", []),
            "contribution_streak": contribution_streak,
            "verified_email": True,  # GitHub requires verified email for all accounts
            "profile_complete": bool(github_profile.get("bio") and github_profile.get("location"))
        },
        highlights=highlights,
        
        # Metadata
        last_synced_at=datetime.utcnow()
    )
    
    # Save to database
    try:
        db.add(engineer)
        db.commit()
        db.refresh(engineer)
        logger.info(f"Created engineer profile for {engineer_data.github_username}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save engineer to database: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save engineer profile"
        )
    
    return engineer


@router.patch("/{engineer_id}", response_model=EngineerResponse)
async def update_engineer(
    engineer_id: str,
    engineer_data: EngineerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing engineer profile.
    
    Only updates the fields that are provided in the request.
    
    - **engineer_id**: Unique identifier of the engineer
    - **engineer_data**: Fields to update
    """
    engineer = db.query(Engineer).filter(
        Engineer.id == engineer_id,
        Engineer.is_active == True
    ).first()
    
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    # Update only provided fields
    update_data = engineer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(engineer, field, value)
    
    try:
        db.commit()
        db.refresh(engineer)
        logger.info(f"Updated engineer {engineer_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update engineer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update engineer profile"
        )
    
    return engineer


@router.post("/{engineer_id}/sync", response_model=EngineerResponse)
async def sync_engineer_github(
    engineer_id: str,
    db: Session = Depends(get_db)
):
    """
    Resync engineer data from GitHub.
    
    This will fetch the latest GitHub statistics and recalculate scores.
    
    - **engineer_id**: Unique identifier of the engineer
    """
    engineer = db.query(Engineer).filter(
        Engineer.id == engineer_id,
        Engineer.is_active == True
    ).first()
    
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    # Fetch fresh GitHub data
    try:
        logger.info(f"Syncing GitHub data for {engineer.github_username}")
        github_profile = await github_service.get_user_profile(engineer.github_username)
        github_stats = await github_service.get_contribution_stats(engineer.github_username)
    except Exception as e:
        logger.error(f"Failed to sync GitHub data: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to sync GitHub data: {str(e)}"
        )
    
    # Recalculate scores using Elite_brain AI
    logger.info(f"Syncing {engineer.github_username} with Elite_brain AI")
    try:
        job_desc = engineer.job_roles or "Full-stack developer with strong problem-solving skills"
        ai_result = await scoring_service.calculate_scores_with_ai(
            engineer.github_username,
            job_desc
        )
        
        if ai_result.get("source") == "elite_brain_ai":
            trust_score = float(ai_result.get("trust_score", 0.0))
            compatibility_score = float(ai_result.get("compatibility_score", 0.0))
            ai_explanation = ai_result.get("ai_explanation", "")
            logger.info(f"✅ Elite_brain AI sync: Trust={trust_score}, Match={compatibility_score}")
        else:
            # Fallback to local calculation
            logger.warning(f"Elite_brain unavailable, using local scoring")
            trust_score = scoring_service.calculate_trust_score(github_stats)
            compatibility_score = scoring_service.calculate_compatibility_score(
                engineer.skills,
                [],
                github_stats
            )
            ai_explanation = "AI temporarily unavailable during sync."
    except Exception as e:
        logger.error(f"Elite_brain sync error: {e}, using fallback")
        trust_score = scoring_service.calculate_trust_score(github_stats)
        compatibility_score = scoring_service.calculate_compatibility_score(
            engineer.skills,
            [],
            github_stats
        )
        ai_explanation = "AI temporarily unavailable during sync."
    
    # Generate updated data structures
    recent_activity = scoring_service.generate_recent_activity(days=7)
    compatibility_breakdown = scoring_service.generate_compatibility_breakdown(
        compatibility_score,
        engineer.skills,
        [],
        github_stats
    )
    top_languages = scoring_service.generate_top_languages(
        github_stats.get("languages", {}),
        limit=5
    )
    contribution_streak = scoring_service.calculate_contribution_streak(recent_activity)
    highlights = scoring_service.generate_highlights(
        github_stats,
        trust_score,
        compatibility_score,
        engineer.skills
    )
    
    # Update profile data from GitHub
    if not engineer.name or engineer.name == engineer.github_username:
        engineer.name = github_profile.get("name") or engineer.github_username
    
    if github_profile.get("avatar_url"):
        engineer.avatar = github_profile.get("avatar_url")
    
    if github_profile.get("location") and engineer.location == "Not specified":
        engineer.location = github_profile.get("location")
    
    if github_profile.get("bio"):
        engineer.bio = github_profile.get("bio")
    
    # Update engineer data
    engineer.trust_score = round(trust_score, 2)
    engineer.compatibility_score = round(compatibility_score, 2)
    engineer.total_repos = github_stats.get("total_repos", 0)
    engineer.total_commits = github_stats.get("total_commits", 0)
    engineer.total_stars = github_stats.get("total_stars", 0)
    engineer.total_forks = github_stats.get("total_forks", 0)
    engineer.top_languages = top_languages
    engineer.recent_activity = recent_activity
    engineer.compatibility_breakdown = compatibility_breakdown
    engineer.trust_evidence = {
        "recent_commits": github_stats.get("total_commits", 0),
        "popular_repos": github_stats.get("popular_repos", []),
        "contribution_streak": contribution_streak,
        "verified_email": True,  # GitHub requires verified email for all accounts
        "profile_complete": bool(github_profile.get("bio") and github_profile.get("location"))
    }
    engineer.highlights = highlights
    engineer.last_synced_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(engineer)
        logger.info(f"Synced engineer {engineer_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update engineer after sync: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save synced data"
        )
    
    return engineer


@router.delete("/{engineer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_engineer(
    engineer_id: str,
    db: Session = Depends(get_db)
):
    """
    Soft delete an engineer profile.
    
    The engineer is marked as inactive but not removed from the database.
    
    - **engineer_id**: Unique identifier of the engineer
    """
    engineer = db.query(Engineer).filter(Engineer.id == engineer_id).first()
    
    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineer with ID {engineer_id} not found"
        )
    
    engineer.is_active = False
    
    try:
        db.commit()
        logger.info(f"Deleted engineer {engineer_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete engineer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete engineer"
        )
    
    return None


@router.get("/compare/", response_model=List[EngineerResponse])
async def compare_engineers(
    ids: str = Query(..., description="Comma-separated engineer IDs to compare"),
    db: Session = Depends(get_db)
):
    """
    Compare multiple engineers side-by-side.
    
    - **ids**: Comma-separated list of engineer IDs (e.g., "id1,id2,id3")
    """
    engineer_ids = [id.strip() for id in ids.split(",") if id.strip()]
    
    if not engineer_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one engineer ID must be provided"
        )
    
    if len(engineer_ids) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot compare more than 5 engineers at once"
        )
    
    engineers = db.query(Engineer).filter(
        Engineer.id.in_(engineer_ids),
        Engineer.is_active == True
    ).all()
    
    if len(engineers) != len(engineer_ids):
        found_ids = {e.id for e in engineers}
        missing_ids = set(engineer_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engineers not found: {', '.join(missing_ids)}"
        )
    
    return engineers
