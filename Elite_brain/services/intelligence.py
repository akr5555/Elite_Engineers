import logging
import numpy as np
import google.generativeai as genai
from groq import Groq
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from config import settings

logger = logging.getLogger(__name__)

# Load Local Vector Model (Fast & Free) - Runs on CPU
try:
    logger.info("⏳ Loading Vector Model...")
    vector_model = SentenceTransformer('all-MiniLM-L6-v2')
    logger.info("✅ Vector Model Loaded!")
except Exception as e:
    logger.error(f"❌ Failed to load vector model: {e}")
    vector_model = None

class AIJudge:
    def __init__(self):
        # 1. Setup Groq (Primary High-Speed AI)
        self.groq_client = None
        if settings.GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
            except Exception as e:
                logger.error(f"⚠️ Groq Init Failed: {e}")

        # 2. Setup Gemini (Backup AI)
        self.gemini_model = None
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                logger.error(f"⚠️ Gemini Init Failed: {e}")

    def calc_match(self, job_desc: str, candidate_text: str) -> float:
        """
        Calculates Compatibility Score (0-100) using Vector Math.
        This finds hidden connections (e.g. 'Flask' matches 'Python' contextually).
        """
        if not vector_model or not job_desc or not candidate_text:
            return 0.0
        
        # Turn text into numbers (Vectors)
        vec1 = vector_model.encode(job_desc).reshape(1, -1)
        vec2 = vector_model.encode(candidate_text).reshape(1, -1)
        
        # Compare the angle between vectors (Cosine Similarity)
        similarity = cosine_similarity(vec1, vec2)[0][0]
        return round(float(similarity) * 100, 1)

    def calc_trust(self, stats: dict) -> float:
        """
        Calculates Trust Score using Rule-Based Heuristics (Fast).
        We don't waste AI tokens on simple math.
        """
        score = 0
        
        # 1. Activity Volume (Consistency)
        commits = stats.get('commits_last_year', 0)
        if commits > 500: score += 25
        elif commits > 100: score += 15
        elif commits > 20: score += 5
        
        # 2. Community Validation (Social Proof)
        if stats.get('stars', 0) > 10: score += 20
        if stats.get('forks', 0) > 5: score += 10
        if stats.get('followers', 0) > 10: score += 10
        
        # 3. Professional Signals
        if stats.get('is_pro'): score += 15
        if stats.get('email_verified'): score += 10
        if stats.get('company'): score += 5
        if stats.get('repos', 0) > 5: score += 5

        return min(score, 100.0)

    def explain_and_verify(self, trust_score, match_score, profile_data, job_desc):
        """
        Uses Groq (or Gemini) to:
        1. Judge 'Authenticity' from the code snippets.
        2. Generate a human-readable explanation.
        """
        
        # We feed the AI the raw code/readme text we fetched
        code_snippets = profile_data.get('raw_text_for_ai', '')[:2000] # Limit context
        
        prompt = f"""
        Act as a Senior Technical Recruiter.
        
        Candidate: {profile_data.get('username')}
        Stats: {profile_data.get('stats')}
        Calculated Trust Score: {trust_score}/100
        Calculated Match Score: {match_score}/100
        Job Description: {job_desc[:200]}...
        
        Code/Profile Context:
        "{code_snippets}"
        
        TASK:
        1. Analyze the 'Code/Profile Context'. Does this look like real, authentic engineering work or just tutorials?
        2. Write a 2-sentence summary explaining WHY they are a good or bad fit for the job.
        3. Mention one specific strength (e.g., "Strong Python history").
        
        Output format: Just the text explanation.
        """

        try:
            # Try Groq First (Speed)
            if self.groq_client:
                chat = self.groq_client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model="llama3-8b-8192"
                )
                return chat.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq failed: {e}. Trying Gemini...")

        try:
            # Fallback to Gemini
            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return response.text
        except Exception as e:
            logger.error(f"All AI failed: {e}")
            return "AI Analysis unavailable. Scores based on raw metrics."