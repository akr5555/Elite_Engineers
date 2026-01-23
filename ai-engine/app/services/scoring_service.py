"""AI-powered scoring and matching service with Elite_brain integration."""

from typing import Dict, List, Any, Optional
import random
from datetime import datetime, timedelta
import math
import logging
from app.services.elite_brain_client import elite_brain_client

logger = logging.getLogger(__name__)


class ScoringService:
    """
    Service for calculating engineer scores and compatibility metrics.
    
    This service implements AI-powered algorithms to:
    - Calculate trust scores based on GitHub activity
    - Calculate compatibility scores based on skills and requirements
    - Generate detailed score breakdowns
    - Create activity reports and highlights
    """
    
    # Color palette for programming languages
    LANGUAGE_COLORS = {
        "Python": "#3776AB",
        "JavaScript": "#F7DF1E",
        "TypeScript": "#3178C6",
        "Java": "#007396",
        "Go": "#00ADD8",
        "Rust": "#DEA584",
        "C++": "#00599C",
        "C#": "#239120",
        "Ruby": "#CC342D",
        "PHP": "#777BB4",
        "Swift": "#FA7343",
        "Kotlin": "#7F52FF",
        "Scala": "#DC322F",
        "R": "#276DC3",
        "Shell": "#89E051",
        "HTML": "#E34C26",
        "CSS": "#1572B6",
        "Other": "#6B7280",
    }
    
    async def calculate_scores_with_ai(
        self,
        github_username: str,
        job_description: str = "Full-stack developer with strong problem-solving skills"
    ) -> Dict[str, Any]:
        """
        Calculate trust and compatibility scores using Elite_brain AI.
        
        This is the PRIMARY scoring method that uses real AI analysis.
        Falls back to local calculation if Elite_brain is unavailable.
        
        Args:
            github_username: GitHub username to analyze
            job_description: Job requirements for compatibility matching
            
        Returns:
            Dictionary containing:
            - trust_score: AI-calculated trust score (0-100)
            - compatibility_score: AI-calculated compatibility (0-100)
            - ai_explanation: Detailed AI judgment
            - candidate_data: Full GitHub profile data
        """
        try:
            # Call Elite_brain AI for real-time analysis
            logger.info(f"Requesting AI analysis for {github_username} from Elite_brain")
            result = await elite_brain_client.analyze_engineer(
                github_username,
                job_description
            )
            
            scores = result.get("scores", {})
            return {
                "trust_score": scores.get("trust_score", 0.0),
                "compatibility_score": scores.get("compatibility_score", 0.0),
                "ai_explanation": result.get("ai_explanation", ""),
                "candidate_data": result.get("candidate", {}),
                "github_stats": result.get("candidate", {}).get("stats", {}),
                "source": "elite_brain_ai"
            }
            
        except Exception as e:
            logger.warning(f"Elite_brain AI unavailable for {github_username}: {e}. Using fallback.")
            # Fallback to local calculation
            return {
                "trust_score": 0.0,
                "compatibility_score": 0.0,
                "ai_explanation": "AI analysis temporarily unavailable. Please sync profile later.",
                "candidate_data": {},
                "github_stats": {},
                "source": "fallback",
                "error": str(e)
            }
    
    def calculate_trust_score(self, github_stats: Dict[str, Any]) -> float:
        """
        Calculate trust score based on GitHub activity and reputation.
        
        Algorithm components:
        1. Commit volume (30 points max) - More commits indicate active development
        2. Repository count (20 points max) - Variety of projects
        3. Popular repositories (25 points max) - Community recognition
        4. Language diversity (15 points max) - Breadth of skills
        5. Stars and forks (10 points max) - Code quality indicators
        
        Args:
            github_stats: Dictionary containing GitHub statistics
            
        Returns:
            Trust score from 0-100
        """
        score = 0.0
        
        # Factor 1: Commit volume (max 30 points)
        # More than 300 commits gets full points
        commits = github_stats.get("total_commits", 0)
        score += min((commits / 300) * 30, 30)
        
        # Factor 2: Repository count (max 20 points)
        # 20+ repos gets full points
        repos = github_stats.get("total_repos", 0)
        score += min((repos / 20) * 20, 20)
        
        # Factor 3: Popular repositories (max 25 points)
        # Having 5+ popular repos gets full points
        popular_repos = len(github_stats.get("popular_repos", []))
        score += min((popular_repos / 5) * 25, 25)
        
        # Factor 4: Language diversity (max 15 points)
        # Knowing 5+ languages gets full points
        languages = len(github_stats.get("languages", {}))
        score += min((languages / 5) * 15, 15)
        
        # Factor 5: Stars and forks (max 10 points)
        # 100+ stars gets full points
        stars = github_stats.get("total_stars", 0)
        forks = github_stats.get("total_forks", 0)
        reputation = stars + (forks * 2)  # Forks are weighted more
        score += min((reputation / 100) * 10, 10)
        
        return min(score, 100.0)
    
    def calculate_compatibility_score(
        self,
        engineer_skills: List[str],
        required_skills: List[str],
        github_stats: Dict[str, Any]
    ) -> float:
        """
        Calculate compatibility score based on skills match and activity.
        
        If no required skills are provided, returns a score based on
        general engineering excellence metrics.
        
        Args:
            engineer_skills: List of engineer's skills
            required_skills: List of required skills for matching
            github_stats: GitHub statistics
            
        Returns:
            Compatibility score from 0-100
        """
        # If no required skills, use general excellence scoring
        if not required_skills:
            return self._calculate_general_excellence(github_stats)
        
        # Calculate skill match percentage (70% weight)
        engineer_skills_lower = {s.lower() for s in engineer_skills}
        required_skills_lower = {s.lower() for s in required_skills}
        matching_skills = engineer_skills_lower & required_skills_lower
        
        skill_match_ratio = len(matching_skills) / len(required_skills)
        skill_match_score = skill_match_ratio * 70
        
        # Activity bonus (15% weight)
        commits = github_stats.get("total_commits", 0)
        activity_score = min((commits / 200) * 15, 15)
        
        # Language relevance (15% weight)
        languages = github_stats.get("languages", {})
        language_names = {lang.lower() for lang in languages.keys()}
        matching_languages = language_names & required_skills_lower
        language_score = (len(matching_languages) / max(len(required_skills), 1)) * 15
        
        total_score = skill_match_score + activity_score + language_score
        
        return min(total_score, 100.0)
    
    def _calculate_general_excellence(self, github_stats: Dict[str, Any]) -> float:
        """Calculate general engineering excellence score."""
        score = 0.0
        
        # High commit count
        commits = github_stats.get("total_commits", 0)
        score += min((commits / 200) * 40, 40)
        
        # Multiple repositories
        repos = github_stats.get("total_repos", 0)
        score += min((repos / 15) * 30, 30)
        
        # Community recognition (stars/forks)
        stars = github_stats.get("total_stars", 0)
        score += min((stars / 50) * 30, 30)
        
        # Add some randomness for variation
        score += random.uniform(0, 10)
        
        return min(score, 100.0)
    
    def generate_compatibility_breakdown(
        self,
        overall_score: float,
        engineer_skills: List[str],
        required_skills: List[str],
        github_stats: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Generate detailed breakdown of compatibility score components.
        
        Args:
            overall_score: Overall compatibility score
            engineer_skills: Engineer's skills
            required_skills: Required skills
            github_stats: GitHub statistics
            
        Returns:
            Dictionary with breakdown components
        """
        base = overall_score
        variance = 8  # Allow some variation from overall score
        
        # Skill match component
        if required_skills:
            matching = len(set(s.lower() for s in engineer_skills) & set(s.lower() for s in required_skills))
            skill_match = (matching / len(required_skills)) * 100
        else:
            skill_match = base + random.uniform(-variance, variance)
        
        # Project relevance based on popular repos
        popular_count = len(github_stats.get("popular_repos", []))
        project_relevance = min((popular_count / 3) * 100, 100)
        if project_relevance == 0:
            project_relevance = base + random.uniform(-variance, variance)
        
        # Experience based on repo age and variety
        repos = github_stats.get("total_repos", 0)
        experience = min((repos / 20) * 100, 100)
        if experience < 50:
            experience = base + random.uniform(-variance, variance)
        
        # Activity consistency based on commits
        commits = github_stats.get("total_commits", 0)
        activity_consistency = min((commits / 200) * 100, 100)
        if activity_consistency < 50:
            activity_consistency = base + random.uniform(-variance, variance)
        
        return {
            "skill_match": min(max(skill_match, 0), 100),
            "project_relevance": min(max(project_relevance, 0), 100),
            "experience": min(max(experience, 0), 100),
            "activity_consistency": min(max(activity_consistency, 0), 100),
        }
    
    def generate_recent_activity(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        Generate simulated recent activity data.
        
        In production, this would fetch actual commit data from GitHub.
        
        Args:
            days: Number of days of activity to generate
            
        Returns:
            List of activity data points
        """
        activity = []
        today = datetime.now()
        
        for i in range(days):
            date = today - timedelta(days=days - i - 1)
            
            # Simulate realistic commit patterns
            # Weekdays: 5-25 commits, Weekends: 0-15 commits
            is_weekend = date.weekday() >= 5
            if is_weekend:
                commits = random.randint(0, 15)
            else:
                commits = random.randint(5, 25)
            
            activity.append({
                "date": date.strftime("%Y-%m-%d"),
                "commits": commits
            })
        
        return activity
    
    def generate_top_languages(
        self,
        languages: Dict[str, int],
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Convert language statistics to formatted list with colors.
        
        Args:
            languages: Dictionary of language names to usage counts
            limit: Maximum number of languages to return
            
        Returns:
            List of language objects with name, percentage, and color
        """
        if not languages:
            return []
        
        # Sort by usage
        sorted_languages = sorted(
            languages.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        # Calculate total for percentages
        total = sum(count for _, count in sorted_languages)
        
        # Format with colors
        result = []
        for lang, count in sorted_languages:
            percentage = (count / total * 100) if total > 0 else 0
            color = self.LANGUAGE_COLORS.get(lang, self.LANGUAGE_COLORS["Other"])
            
            result.append({
                "name": lang,
                "percentage": round(percentage, 1),
                "color": color
            })
        
        return result
    
    def generate_highlights(
        self,
        github_stats: Dict[str, Any],
        trust_score: float,
        compatibility_score: float,
        skills: List[str]
    ) -> List[str]:
        """
        Generate highlight statements for an engineer.
        
        Args:
            github_stats: GitHub statistics
            trust_score: Calculated trust score
            compatibility_score: Calculated compatibility score
            skills: Engineer's skills
            
        Returns:
            List of highlight strings
        """
        highlights = []
        
        # Commit-based highlights
        commits = github_stats.get("total_commits", 0)
        if commits > 500:
            highlights.append(f"Over {commits} commits demonstrating consistent contribution")
        elif commits > 200:
            highlights.append(f"{commits} commits showing active development")
        
        # Repository highlights
        repos = github_stats.get("total_repos", 0)
        if repos > 30:
            highlights.append(f"Maintains {repos}+ repositories across various domains")
        
        # Popular repos
        popular_repos = github_stats.get("popular_repos", [])
        if len(popular_repos) > 3:
            highlights.append(f"Creator/maintainer of {len(popular_repos)} popular open-source projects")
        elif len(popular_repos) > 0:
            highlights.append(f"Contributed to {len(popular_repos)} community-recognized projects")
        
        # Trust score highlights
        if trust_score >= 95:
            highlights.append("Elite-tier trust score with verified long-term activity")
        elif trust_score >= 85:
            highlights.append("Highly trusted profile with consistent contributions")
        
        # Compatibility highlights
        if compatibility_score >= 90:
            highlights.append("Exceptional match for project requirements")
        elif compatibility_score >= 80:
            highlights.append("Strong alignment with required skillset")
        
        # Language/skill highlights
        languages = list(github_stats.get("languages", {}).keys())
        if len(languages) >= 5:
            highlights.append(f"Polyglot engineer proficient in {len(languages)}+ languages")
        elif len(languages) >= 3:
            top_langs = ", ".join(languages[:3])
            highlights.append(f"Expert in {top_langs}")
        
        # Stars/community recognition
        stars = github_stats.get("total_stars", 0)
        if stars > 100:
            highlights.append(f"Earned {stars}+ GitHub stars from the community")
        
        # Skill-based highlights
        if len(skills) >= 8:
            highlights.append(f"Versatile skillset spanning {len(skills)} technologies")
        
        return highlights[:6]  # Return top 6 highlights
    
    def calculate_contribution_streak(self, recent_activity: List[Dict[str, Any]]) -> int:
        """
        Calculate contribution streak from activity data.
        
        Args:
            recent_activity: List of daily activity data
            
        Returns:
            Number of consecutive days with commits
        """
        streak = 0
        for day in reversed(recent_activity):
            if day.get("commits", 0) > 0:
                streak += 1
            else:
                break
        return streak


# Create global instance
scoring_service = ScoringService()
