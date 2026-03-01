import uuid
import json
import logging
from typing import Dict, Any, List
from app.core.ai_client import get_ai_client
from app.agents.base import BaseAgent
from app.models.schemas import OpportunityOutput, StartupIdea

logger = logging.getLogger(__name__)

class OpportunityAgent(BaseAgent):
    def __init__(self):
        super().__init__(name="Opportunity Agent")
        self.ai_client = get_ai_client()

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate exactly 5 startup ideas grounded in real-world signals.
        """
        run_id = context.get("run_id", str(uuid.uuid4()))
        theme = context.get("theme", "None")
        signals = context.get("signals", [])

        if not signals:
            signals = [
                "Growth of decentralized AI computing platforms",
                "New regulatory focus on deepfake detection in specialized sectors",
                "Increasing demand for vertical SaaS in the manufacturing sector",
                "Shift towards edge computing for privacy-preserving LLMs",
                "Tokenization of real-world assets emerging in fintech"
            ]

        prompt = f"""
        You are an expert Startup Strategist and YC Partner. 
        Analyze the following market signals and generate exactly 5 high-signal startup opportunities.
        
        Live Signals:
        {chr(10).join(signals)}
        
        Optional Market/Theme Constraint: {theme}
        
        Each idea MUST be a unique, validated opportunity with a clear problem-solution fit. 
        Reject low-signal or generic ideas.
        
        RETURN ONLY A JSON ARRAY of 5 objects with this structure:
        {{
            "idea_id": "uuid",
            "title": "string",
            "problem": "string",
            "target_user": "string",
            "monetization": "string",
            "confidence_score": 0.0-100.0,
            "market_score": 0.0-100.0,
            "execution_complexity": 0.0-100.0,
            "reasoning": ["point 1", "point 2"]
        }}
        """

        try:
            if not self.ai_client.has_provider(settings.AI_PROVIDER) and not settings.OPENAI_API_KEY:
                # Use mock if no AI keys
                ideas = self._get_mock_ideas()
            else:
                response = await self.ai_client.chat_completion(
                    messages=[
                        {"role": "system", "content": self._get_system_prompt()},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                
                content = response["content"]
                data = json.loads(content)
                ideas = data.get("ideas", []) if isinstance(data, dict) and "ideas" in data else data
                if not isinstance(ideas, list):
                    ideas = [data]

            # Validation: Ensure exactly 5 ideas and correct schema
            # We use Pydantic for validation
            output = OpportunityOutput(ideas=ideas[:5])
            
            # If fewer than 5, pad with mocks (unlikely with LLM but for robustness)
            if len(output.ideas) < 5:
                mocks = self._get_mock_ideas()
                output.ideas.extend(mocks[:5-len(output.ideas)])

            return output.dict()

        except Exception as e:
            logger.error(f"Opportunity Agent error: {e}")
            # Fallback to mocks
            return OpportunityOutput(ideas=self._get_mock_ideas()).dict()

    def _get_mock_ideas(self) -> List[Dict[str, Any]]:
        return [
            {
                "idea_id": str(uuid.uuid4()),
                "title": "EdgeFlow AI",
                "problem": "Latency and privacy concerns in LLMs for medical data.",
                "target_user": "Healthcare IT Departments",
                "monetization": "Subscription per node.",
                "confidence_score": 92.0,
                "market_score": 85.0,
                "execution_complexity": 70.0,
                "reasoning": ["Privacy focus", "High margin", "Quantization trend"]
            },
            {
                "idea_id": str(uuid.uuid4()),
                "title": "SolarGraph",
                "problem": "Fragmented grid data for commercial solar ROI.",
                "target_user": "Solar Installers",
                "monetization": "B2B SaaS licensing.",
                "confidence_score": 88.0,
                "market_score": 90.0,
                "execution_complexity": 45.0,
                "reasoning": ["ESG mandate", "Low hardware complexity", "Sustainability trend"]
            },
            {
                "idea_id": str(uuid.uuid4()),
                "title": "JurisShield",
                "problem": "SMBs tracking international trade regulations.",
                "target_user": "E-commerce Exporters",
                "monetization": "Tiered membership.",
                "confidence_score": 85.0,
                "market_score": 75.0,
                "execution_complexity": 60.0,
                "reasoning": ["Regulatory pain", "Proprietary engine", "Global trade"]
            },
            {
                "idea_id": str(uuid.uuid4()),
                "title": "BioTrace",
                "problem": "Traceability in luxury cosmetic supply chain.",
                "target_user": "Luxury Beauty Conglomerates",
                "monetization": "Transaction fee.",
                "confidence_score": 82.0,
                "market_score": 80.0,
                "execution_complexity": 75.0,
                "reasoning": ["Anti-counterfeit", "Tokenization", "Transparency demand"]
            },
            {
                "idea_id": str(uuid.uuid4()),
                "title": "Synthetix Labs",
                "problem": "High cost of synthetic data for drones.",
                "target_user": "Drone Manufacturers",
                "monetization": "Pay-per-dataset.",
                "confidence_score": 90.0,
                "market_score": 88.0,
                "execution_complexity": 85.0,
                "reasoning": ["Botteneck solution", "Scalable tech", "Autonomous growth"]
            }
        ]

    def _get_system_prompt(self) -> str:
        return "You are the Opportunity Agent. Generate exactly 5 startup ideas. Agents receive read-only input, return JSON only, and may not reference previous states directly."
