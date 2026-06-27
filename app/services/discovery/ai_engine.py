import json
import logging
from typing import List, Dict, Any, Optional
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

class AIEngine:
    """
    Intelligence & Reasoning Engine for startup discovery.
    Transforms structured signals into high-value ideas.
    """
    def __init__(self):
        self.client = get_ai_client()

    async def generate_ideas_from_signals(self, signals: List[Dict[str, Any]], idea_prompt: Optional[str] = None, mode: str = "basic") -> Dict[str, Any]:
        """
        Analyze ALL signals and produce startup ideas, market gaps, and pain points.
        """
        import random
        import time
        
        diversity_seed = f"{time.time()}-{random.random()}"
        
        system_prompt = f"""
        You are a Principal AI Systems Architect and a legendary Venture Capitalist with a specialty in finding "Unicorn" opportunities.
        Analyze the provided internet signals and generate high-value, real-world startup opportunities.
        
        Diversity Seed (Force creative divergence): {diversity_seed}
        
        OUTPUT SCHEMA (STRICT JSON):
        {{
          "ideas": [
            {{
              "title": "...",
              "thesis": "...",
              "problem": "...",
              "solution": "...",
              "target_market": "...",
              "why_now": "...",
              "monetization": "...",
              "market_size": "...",
              "trend_strength": "low | medium | high",
              "competition_level": "low | medium | high",
              "validation_score": 0-100,
              "signals_used": [
                {{ "source": "Reddit | HN | News", "title": "Reference to the specific signal title" }}
              ]
            }}
          ],
          "market_gaps": ["..."],
          "pain_points": ["..."],
          "trends": ["..."]
        }}

        INSTRUCTIONS:
        1. BE CONTINGENT: Do not suggest generic "AI for X" unless it solves a deeply specific, high-value problem.
        2. BE REAL: Focus on physical-world industries (logistics, energy, manufacturing, health) or complex B2B workflows.
        3. BE DIVERSE: Every time you are called, explore a different angle of the signals.
        4. BE CRITICAL: Only generate exactly 4 ideas that you would personally invest $1M in.
        
        Return ALL responses as valid JSON only.
        """
        
        # Defensively truncate signals if they are too large
        signals_text = json.dumps(signals, indent=2)
        if len(signals_text) > 15000:
            logger.info(f"Signals text too large ({len(signals_text)} chars), sampling first 10 signals...")
            signals_text = json.dumps(signals[:10], indent=2)
            if len(signals_text) > 15000:
                 signals_text = signals_text[:15000] + "\n... (truncated for token limits)"

        user_prompt = f"Internet Signals:\n{signals_text}\n\nUser Context/Idea: {idea_prompt or 'None'}"
        
        # Explore Signals vs Drive Deep Routing
        task = "explore_signals" if mode == "deep" else "drive_deep"
        logger.info(f"Routing to AI task={task} (mode={mode})")

        try:
            response = await self.client.routed_completion(
                task=task,
                messages=[{"role": "user", "content": user_prompt}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"},
                max_tokens=2000
            )
            from app.utils.json_helper import safe_json_parse
            parsed = safe_json_parse(response.get('content', ''))
            # Ensure essential keys exist
            if not isinstance(parsed, dict):
                parsed = {}
            return {
                "ideas": parsed.get("ideas", []),
                "market_gaps": parsed.get("market_gaps", []),
                "pain_points": parsed.get("pain_points", []),
                "trends": parsed.get("trends", [])
            }
        except Exception as e:
            logger.error(f"AI Engine failed to generate ideas for task {task}: {e}")
            return {"ideas": [], "market_gaps": [], "pain_points": [], "trends": []}

    async def detect_growth_signals(self, signals: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect growth signals from raw data.
        """
        system_prompt = """
        You are a Trend Detection System. Identify the strongest growth signals from the data.
        Return the response in valid JSON format only.
        The response must contain a key "signals" with a list of objects.
        """
        
        if not signals:
            return []
            
        signals_text = json.dumps(signals, indent=2)
        
        try:
            response = await self.client.routed_completion(
                task="live_signals",
                messages=[{"role": "user", "content": f"Signals:\n{signals_text}"}],
                system_prompt=system_prompt,
                response_format={"type": "json_object"}
            )
            content = response.get('content', '{}')
            from app.utils.json_helper import safe_json_parse
            data = safe_json_parse(content)
            processed = data.get("signals", [])
            
            if not processed and signals:
                logger.warning("AI returned no growth signals, using raw signals as fallback")
                return signals[:10]
                
            return processed
        except Exception as e:
            logger.error(f"AI Engine failed to detect growth signals: {e}")
            if signals:
                logger.info("Returning raw signals as fallback due to AI failure")
                return signals[:10]
            return []

ai_engine = AIEngine()
