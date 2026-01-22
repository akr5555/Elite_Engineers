from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.scanner import GitHubScanner
from services.intelligence import AIJudge
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elite Brain API", version="1.0")

# Input Model
class AnalyzeRequest(BaseModel):
    username: str
    job_description: str

@app.get("/")
def home():
    return {"status": "Brain is Online 🧠"}

@app.post("/analyze")
async def analyze_engineer(req: AnalyzeRequest):
    logger.info(f"🧠 Analyzing Candidate: {req.username}")

    # 1. SCAN: Fetch Data from GitHub (The Eyes)
    scanner = GitHubScanner()
    profile_data = await scanner.scan_profile(req.username)
    
    if not profile_data:
        raise HTTPException(status_code=404, detail="User not found or GitHub API error")

    # 2. THINK: Calculate Scores (The Logic)
    judge = AIJudge()
    
    # Calculate Trust (Rules)
    trust_score = judge.calc_trust(profile_data['stats'])
    
    # Calculate Match (Vectors)
    match_score = judge.calc_match(req.job_description, profile_data['raw_text_for_ai'])
    
    # 3. EXPLAIN: Generate Reasoning (The Voice)
    explanation = judge.explain_and_verify(
        trust_score, 
        match_score, 
        profile_data, 
        req.job_description
    )

    # 4. RESPOND: Return the JSON
    return {
        "candidate": {
            "username": profile_data['username'],
            "full_name": profile_data['full_name'],
            "avatar": profile_data['avatar'],
            "location": profile_data['location'],
            "stats": profile_data['stats']
        },
        "scores": {
            "trust_score": trust_score,
            "compatibility_score": match_score
        },
        "ai_explanation": explanation
    }