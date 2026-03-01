from pydantic import BaseModel, Field
from typing import List, Optional

class VerdictRequest(BaseModel):
    opportunity_score: float = Field(..., description="The composite opportunity score (1-10)")
    trend_growth: float = Field(..., description="Google Trends growth percentage or score")
    competitor_count: int = Field(..., description="Number of detected competitors")
    funding_activity: str = Field(..., description="Qualitative or quantitative funding activity level")
    market_size: str = Field(..., description="Estimated market size (TAM/SAM/SOM)")
    idea: Optional[str] = Field(None, description="The startup idea text for context")

class VerdictResponse(BaseModel):
    verdict: str = Field(..., description="VC-style outcome (e.g., 'Promising Opportunity')")
    success_probability: str = Field(..., description="Estimated probability of success (e.g., '68%')")
    confidence_score: float = Field(..., description="AI's confidence in this verdict (0-1)")
    reasons: List[str] = Field(..., description="Key drivers behind the verdict")
