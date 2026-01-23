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
        Calculates Trust strictly based on COMMITS (The 'Grind') and Social Proof.
        We penalized 'Collector' accounts that just fork repos but don't commit.
        """
        score = 0
        commits = stats.get('total_commits', 0)
        
        # 1. The "Grind" Score (Hard Work) - Max 60 pts
        if commits > 1000: score += 60
        elif commits > 500: score += 40
        elif commits > 100: score += 20
        elif commits > 10: score += 5
        
        # 2. The "Clout" Score (Community Validation) - Max 40 pts
        # Stars count heavily because strangers don't star junk code.
        stars = stats.get('stars', 0)
        followers = stats.get('followers', 0)
        
        if stars > 50: score += 20
        elif stars > 10: score += 10
        
        if followers > 50: score += 20
        elif followers > 10: score += 10
        
        return min(score, 100.0)

    def explain_and_verify(self, trust_score, match_score, profile_data, job_desc):
        """
        The AI Rule Book: Enforces strict judgement on forks and bots.
        """
        
        # 📜 THE RULE BOOK 📜
        system_rules = """
        You are an Elite Technical Judge. Analyze this engineer strictly.
        
        RULES:
        1. FORKS: If a repo is tagged [FORK/TUTORIAL], do NOT count it as a skill strength. Explicitly mention "Reliance on forks" in the summary if they lack original work.
        2. BOTS: If the commit messages look repetitive or the code looks auto-generated without human nuance, Flag it as "Suspected AI/Bot Activity".
        3. ZERO EFFORT: If they have high repo count but low commits (Trust Score < 20), call them a "Collector, not a Creator".
        4. MATCHING: Compare their 'Original' work to the Job Description.
        
        OUTPUT FORMAT:
        "Verdict: [One Sentence Summary]. Analysis: [2 sentences on strengths/weaknesses]."
        """
        
        # Prepare the context for the AI
        user_content = f"""
        Candidate: {profile_data.get('username')}
        Total Commits (Last Year): {profile_data.get('stats', {}).get('total_commits')}
        Trust Score: {trust_score}/100
        Match Score: {match_score}/100
        Job Description: {job_desc}
        
        Repositories Data:
        {profile_data.get('raw_text_for_ai', '')[:2500]} 
        """

        try:
            # Try Groq First (Speed)
            if self.groq_client:
                chat = self.groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_rules},
                        {"role": "user", "content": user_content}
                    ],
                    model="llama3-8b-8192"
                )
                return chat.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq failed: {e}. Trying Gemini...")

        try:
            # Fallback to Gemini
            if self.gemini_model:
                # Gemini doesn't support 'system' roles as easily in this SDK version, so we combine prompts
                combined_prompt = f"{system_rules}\n\nDATA:\n{user_content}"
                response = self.gemini_model.generate_content(combined_prompt)
                return response.text
        except Exception as e:
            logger.error(f"All AI failed: {e}")
            return "AI Analysis unavailable. Scores based on raw metrics."