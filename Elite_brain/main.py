from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import asyncio
from services.scanner import GitHubScanner
from services.intelligence import AIJudge, vector_model
from services.database import Database
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elite Brain API", version="1.2 (Recruiter Ready)")
db = Database()

@app.on_event("startup")
async def startup_event():
    await db.init_db()

# --- Models ---
class AnalyzeRequest(BaseModel):
    username: str
    job_description: str

class BulkAnalyzeRequest(BaseModel):
    usernames: List[str]
    job_description: str

class SearchRequest(BaseModel):
    query: str # The Recruiter's search text (e.g. "React expert")
    limit: Optional[int] = 10

# --- Core Logic ---
async def process_candidate(username: str, job_description: str):
    """Scan -> Judge -> Save"""
    try:
        scanner = GitHubScanner()
        profile_data = await scanner.scan_profile(username)
        if not profile_data: return {"username": username, "error": "User not found"}

        judge = AIJudge()
        trust_score = judge.calc_trust(profile_data['stats'])
        match_score = judge.calc_match(job_description, profile_data['raw_text_for_ai'])
        explanation = judge.explain_and_verify(trust_score, match_score, profile_data, job_description)

        if vector_model:
            embedding = vector_model.encode(profile_data['raw_text_for_ai']).tolist()
            await db.save_engineer(profile_data, trust_score, match_score, explanation, embedding)

        return {
            "candidate": profile_data,
            "scores": {"trust_score": trust_score, "compatibility_score": match_score},
            "ai_explanation": explanation
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"username": username, "error": str(e)}

# --- 👷 ENGINEER SIDE (Ingestion) ---

@app.post("/analyze")
async def analyze_engineer(req: AnalyzeRequest):
    """Scan a single engineer from scratch."""
    return await process_candidate(req.username, req.job_description)

@app.post("/analyze/bulk")
async def analyze_bulk(req: BulkAnalyzeRequest):
    """Scan 50+ engineers at once."""
    tasks = [process_candidate(user, req.job_description) for user in req.usernames]
    results = await asyncio.gather(*tasks)
    return {"results": results}

# --- 🕵️‍♀️ RECRUITER SIDE (Dashboard) ---

@app.get("/candidates")
async def get_all_candidates():
    """
    Shows the Recruiter the 'Pipeline' (List of all saved profiles).
    """
    conn = await db.connect()
    try:
        # Fetch basic info for the dashboard card
        rows = await conn.fetch("""
            SELECT username, full_name, location, trust_score, compatibility_score, ai_explanation 
            FROM engineers 
            ORDER BY compatibility_score DESC 
            LIMIT 50
        """)
        return [dict(row) for row in rows]
    finally:
        await conn.close()

@app.post("/search")
async def search_candidates(req: SearchRequest):
    """
    The 'Magic' Search Bar. 
    Finds engineers in the DB who match the query (Vector Search).
    """
    if not vector_model:
        raise HTTPException(status_code=500, detail="Vector Model not loaded")

    # 1. Turn the Recruiter's query into numbers
    query_vector = vector_model.encode(req.query).tolist()
    
    # 2. Ask Database for nearest neighbors (The Vector Magic)
    conn = await db.connect()
    try:
        # This SQL uses the <=> operator (Cosine Distance)
        rows = await conn.fetch("""
            SELECT username, full_name, trust_score, ai_explanation,
                   (1 - (skills_embedding <=> $1)) as match_confidence
            FROM engineers
            ORDER BY skills_embedding <=> $1 
            LIMIT $2
        """, str(query_vector), req.limit)
        
        return [dict(row) for row in rows]
    finally:
        await conn.close()