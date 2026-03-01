from pydantic import BaseModel, Field
from typing import Literal, Dict, Any, Optional
import json
import logging
from app.core.config import settings
from app.core.supabase import get_service_client

logger = logging.getLogger(__name__)

class OpportunityExtraction(BaseModel):
    demand: int = Field(..., ge=1, le=10)
    market_size: Literal["small", "medium", "large"]
    competition: Literal["low", "medium", "high"]
    monetization: Literal["weak", "medium", "strong"]
    difficulty: Literal["easy", "medium", "hard"]
    trend: Literal["falling", "stable", "rising"]

class OpportunityService:
    def __init__(self):
        from app.core.ai_client import get_ai_client
        self.client = get_ai_client()

    async def extract_signals(self, idea_title: str, idea_description: str, market_data: Optional[str] = None) -> OpportunityExtraction:
        """
        Use OpenAI to analyze the startup idea and return structured signals.
        """
        prompt = f"""
        Analyze this startup idea and return structured signals.
        
        Title: {idea_title}
        Description: {idea_description}
        Market Data: {market_data or "None provided"}
        
        IMPORTANT: You must return ONLY a JSON object matching this exact structure:
        {{
            "demand": <integer 1-10>,
            "market_size": <"small" | "medium" | "large">,
            "competition": <"low" | "medium" | "high">,
            "monetization": <"weak" | "medium" | "strong">,
            "difficulty": <"easy" | "medium" | "hard">,
            "trend": <"falling" | "stable" | "rising">
        }}
        """
        
        try:
            response = await self.client.chat_completion(
                messages=[
                    {"role": "system", "content": "You are an expert startup analyst. Analyze the idea and extract signals strictly following the requested JSON schema."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            content = response["content"]
            if isinstance(content, str):
                data = json.loads(content)
            else:
                data = content
            return OpportunityExtraction(**data)
            
        except Exception as e:
            logger.error(f"Failed to extract signals: {str(e)}")
            raise

    def calculate_score(self, signals: OpportunityExtraction) -> float:
        """
        Calculate score out of 10 based on component metrics.
        
        Logic:
        trend_score (0-2)
        + market_size_score (0-2)
        + competition_inverse_score (0-2)
        + monetization_score (0-2)
        + build_difficulty_inverse (0-2)
        """
        
        # Maps for scoring components
        trend_map = {"falling": 0, "stable": 1, "rising": 2}
        market_map = {"small": 0, "medium": 1, "large": 2}
        
        # Inverse mapping: low competition is good (2), high is bad (0)
        comp_map = {"high": 0, "medium": 1, "low": 2}
        
        monetization_map = {"weak": 0, "medium": 1, "strong": 2}
        
        # Inverse mapping: hard difficulty is bad (0), easy is good (2)
        diff_map = {"hard": 0, "medium": 1, "easy": 2}
        
        score = (
            trend_map[signals.trend] +
            market_map[signals.market_size] +
            comp_map[signals.competition] +
            monetization_map[signals.monetization] +
            diff_map[signals.difficulty]
        )
        
        # It's out of 10. The prompt requested: Return final score out of 10.
        return float(score)

    async def process_opportunity(self, idea_title: str, idea_description: str, market_data: Optional[str] = None) -> Dict[str, Any]:
        """
        Full pipeline: extract -> score -> store -> return
        """
        # 1 & 2. Send context to AI and extract structured signals
        signals = await self.extract_signals(idea_title, idea_description, market_data)
        
        # 3. Calculate numeric score
        score = self.calculate_score(signals)
        
        # 4. Store in Supabase
        supabase = get_service_client()
        
        record = {
            "title": idea_title,
            "description": idea_description,
            "problem": "", # Could be extracted if needed, default empty
            "target_customer": "", # Default empty
            "market_size": signals.market_size,
            "competition_level": signals.competition,
            "monetization_model": signals.monetization,
            "trend_signal": signals.trend,
            "build_difficulty": signals.difficulty,
            "opportunity_score": score
        }
        
        try:
            response = supabase.table("opportunities").insert(record).execute()
            data = response.data[0] if response.data else record
            
            # Combine signals with the DB record
            result = {
                **data,
                "signals": signals.dict()
            }
            return result
            
        except Exception as e:
            logger.error(f"Failed to store opportunity in Supabase: {str(e)}")
            # Even if DB storage fails, return the computed score so the app can function
            return {
                **record,
                "signals": signals.dict(),
                "error": "Failed to save to database"
            }

opportunity_service = OpportunityService()
