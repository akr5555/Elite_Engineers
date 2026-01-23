import asyncpg
import json
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    async def connect(self):
        try:
            return await asyncpg.connect(settings.DATABASE_URL)
        except Exception as e:
            logger.error(f"❌ DB Connection Failed: {e}")
            return None

    async def init_db(self):
        conn = await self.connect()
        if not conn: return
        try:
            # Enable Vector Extension
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            
            # Create the 'engineers' table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS engineers (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    full_name VARCHAR(255),
                    location VARCHAR(255),
                    trust_score FLOAT,
                    compatibility_score FLOAT,
                    skills_embedding vector(384),
                    raw_data JSONB,
                    ai_explanation TEXT,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            logger.info("✅ Database & Table Ready!")
        except Exception as e:
            logger.error(f"Database Init Error: {e}")
        finally:
            await conn.close()

    async def save_engineer(self, profile, trust, match, explanation, embedding):
        conn = await self.connect()
        if not conn: return
        try:
            raw_json = json.dumps(profile)
            await conn.execute("""
                INSERT INTO engineers (username, full_name, location, trust_score, compatibility_score, skills_embedding, raw_data, ai_explanation)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (username) 
                DO UPDATE SET 
                    trust_score = EXCLUDED.trust_score,
                    compatibility_score = EXCLUDED.compatibility_score,
                    skills_embedding = EXCLUDED.skills_embedding,
                    ai_explanation = EXCLUDED.ai_explanation,
                    last_updated = CURRENT_TIMESTAMP;
            """, profile['username'], profile['full_name'], profile['location'], 
               trust, match, embedding, raw_json, explanation)
            
            logger.info(f"💾 Saved {profile['username']} to Database!")
        except Exception as e:
            logger.error(f"Save Error: {e}")
        finally:
            await conn.close()