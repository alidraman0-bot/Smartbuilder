import logging
import json
import re
import asyncio
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

# ============================================================================
# Utility
# ============================================================================

def safe_json_parse(text: str) -> Dict[str, Any]:
    if not text:
        return {}
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    m = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except json.JSONDecodeError:
            pass
    start, end = text.find('{'), text.rfind('}')
    if start != -1 and end > start:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass
    return {}

# get_openrouter_client removed in favor of get_ai_client()

# ============================================================================
# 1. Planner Agent  —  Step 1: ANALYZE
# ============================================================================

PLANNER_SYSTEM_PROMPT = """You are an elite product strategist.  Your job is to
convert a raw startup idea into a structured Product Requirements Document (PRD).

CRITICAL RULES:
- Output ONLY valid JSON. No preamble, no explanation, no markdown blocks.
- You MUST use the EXACT keys defined in the schema below.
- Do NOT rename "core_features" to "features" or anything else.
- Be specific: real feature names, concrete data models, clear user flows.
- Keep the MVP lean — maximum 6 core features.
- Output the JSON object and NOTHING ELSE.

OUTPUT SCHEMA:
{
  "product_name": "string",
  "tagline": "one-liner",
  "problem_statement": "string",
  "target_users": ["user persona 1", ...],
  "core_features": [
    {"name": "Feature Name", "description": "what it does", "priority": "P0|P1|P2"}
  ],
  "data_model": [
    {"entity": "User", "fields": ["id UUID PK", "email TEXT", ...]}
  ],
  "user_flows": ["Flow 1 description", ...],
  "success_metrics": ["Metric 1", ...],
  "tech_stack_suggestion": "string"
}"""

class OpenAIPlannerAgent:
    """Step 1 — Generates PRD."""
    def __init__(self):
        self.ai_client = get_ai_client()

    async def execute(self, idea: str) -> Dict[str, Any]:
        logger.info("PlannerAgent: Generating PRD via AI client")
        prompt = f"Generate a detailed Product Requirements Document for this idea:\n\n{idea}"
        
        response = await self.ai_client.routed_completion(
            task="idea_generation",
            messages=[{"role": "user", "content": prompt}],
            system_prompt=PLANNER_SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=settings.MAX_TOKENS,
            response_format={"type": "json_object"}
        )
        
        raw = response.get("content", "")
        # If ai_client didn't already parse it (it does if response_format is set)
        result_json = raw if isinstance(raw, dict) else safe_json_parse(raw)
        
        # Robustness: Map common mislabeled fields
        if result_json:
            if "features" in result_json and "core_features" not in result_json:
                result_json["core_features"] = result_json["features"]
            if "name" in result_json and "product_name" not in result_json:
                result_json["product_name"] = result_json["name"]

        if not result_json or "core_features" not in result_json:
            logger.error("PlannerAgent: Invalid PRD structure. Raw response: %s", raw)
            raise ValueError("Invalid PRD structure - missing core_features")
            
        return result_json

# ============================================================================
# 2. Architect Agent  —  Step 2: DESIGN
# ============================================================================

ARCHITECT_SYSTEM_PROMPT = """You are a senior systems architect.  Given a PRD,
produce a complete technical architecture for an MVP application.

RULES:
- Design a monolithic but modular architecture (no microservices for MVP)
- Use PostgreSQL schemas with proper relationships
- Design RESTful API endpoints with clear input/output schemas
- Specify a component tree for the frontend
- Output ONLY valid JSON, no prose

OUTPUT SCHEMA:
{
  "architecture_summary": "string",
  "validation_notes": ["note1", ...],
  "database_schema": [
    {
      "table": "table_name",
      "columns": ["id UUID PRIMARY KEY DEFAULT gen_random_uuid()", ...],
      "indexes": ["CREATE INDEX ..."],
      "rls": true
    }
  ],
  "api_endpoints": [
    {"method": "GET|POST|PUT|DELETE", "path": "/api/...", "description": "...", "request_body": {}, "response": {}}
  ],
  "frontend_components": [
    {"name": "ComponentName", "path": "src/components/...", "description": "...", "props": []}
  ],
  "state_management": "zustand",
  "tech_stack": {
    "frontend": "Next.js 14 + Tailwind CSS + shadcn/ui",
    "backend": "FastAPI + Pydantic",
    "database": "PostgreSQL via `@base44/sdk`",
    "auth": "`@base44/sdk` Auth"
  },
  "project_structure": ["src/app/page.tsx", "src/components/...", ...]
}"""

class ClaudeArchitectAgent:
    """Step 2 — Architecture."""
    def __init__(self):
        self.ai_client = get_ai_client()

    async def execute(self, prd: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("ArchitectAgent: Designing architecture via AI client")
        prompt = f"Analyze this PRD and design the architecture:\n\n{json.dumps(prd, indent=2)}"
        
        response = await self.ai_client.routed_completion(
            task="architecture_design",
            messages=[{"role": "user", "content": prompt}],
            system_prompt=ARCHITECT_SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        raw = response.get("content", "")
        result = raw if isinstance(raw, dict) else safe_json_parse(raw)
        
        # Robustness: Map common architecture mislabels
        if result:
            if "schema" in result and "database_schema" not in result:
                result["database_schema"] = result["schema"]
            if "components" in result and "frontend_components" not in result:
                result["frontend_components"] = result["components"]

        if not result or "database_schema" not in result:
            logger.error("ArchitectAgent: Invalid architecture structure. Raw response: %s", raw)
            raise ValueError("Invalid architecture structure - missing database_schema")
        return result

# ============================================================================
# 3. Enhancer Agent  —  Step 5: OPTIMIZE
# ============================================================================

ENHANCER_SYSTEM_PROMPT = """You are a performance engineering specialist.  Given
generated application code, enhance it with performance optimizations, security hardening,
and UX improvements. 

OUTPUT SCHEMA:
Return the final optimization report as JSON in your final message.
{
  "optimization_report": {
    "performance": ["optimization 1", ...],
    "security": ["hardening 1", ...],
    "ux": ["improvement 1", ...]
  }
}"""

class GeminiEnhancerAgent:
    """Step 5 — Enhancer."""
    def __init__(self):
        self.ai_client = get_ai_client()

    async def execute(self, files: List[Dict[str, str]], architecture: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("EnhancerAgent: Optimizing files via AI client")
        
        file_summaries = []
        for f in files[:15]: 
            content = f.get("content", "")
            file_summaries.append({
                "path": f.get("path", "unknown"),
                "content": content[:3000] + ("..." if len(content) > 3000 else ""),
            })

        prompt = f"Optimize these files.\n\nFiles:\n{json.dumps(file_summaries, indent=2)}"

        try:
            response = await self.ai_client.routed_completion(
                task="code_optimization",
                messages=[{"role": "user", "content": prompt}],
                system_prompt=ENHANCER_SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            raw = response.get("content", "")
            result = raw if isinstance(raw, dict) else safe_json_parse(raw)
            return {"enhanced_files": files, **result}
        except Exception as e:
            logger.warning("EnhancerAgent failed: %s", e)
            return {"enhanced_files": files, "optimization_report": {}}

# ============================================================================
# 4. Debug Agent 
# ============================================================================

DEBUG_SYSTEM_PROMPT = """You are a senior debugging engineer.  Given build/runtime
error logs and the source files, diagnose the root cause and produce patches.

RULES:
- Analyze the error message and stack trace carefully
- Generate COMPLETE replacement file content
- Output ONLY valid JSON

OUTPUT SCHEMA:
{
  "diagnosis": "what went wrong and why",
  "root_cause": "specific technical cause",
  "patches": [
    {"path": "file/path.ts", "content": "full corrected file content"}
  ],
  "confidence": 0.0-1.0
}"""

class DebugAgent:
    """Step 7 — Debug."""
    MAX_RETRIES = 3

    def __init__(self):
        self.ai_client = get_ai_client()

    async def analyze_and_fix(self, error_logs: str, files: List[Dict[str, str]], attempt: int = 1) -> Dict[str, Any]:
        logger.info("DebugAgent: Attempt %d/%d via AI client", attempt, self.MAX_RETRIES)

        file_context = []
        for f in files[:10]:
            content = f.get("content", "")
            file_context.append({
                "path": f.get("path", "unknown"),
                "content": content[:2000] + ("..." if len(content) > 2000 else ""),
            })

        prompt = f"Fix this error.\n\nERROR LOGS:\n{error_logs[:3000]}\n\nSOURCE FILES:\n{json.dumps(file_context, indent=2)}"

        try:
            response = await self.ai_client.routed_completion(
                task="code_optimization",
                messages=[{"role": "user", "content": prompt}],
                system_prompt=DEBUG_SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=4000,
                response_format={"type": "json_object"}
            )
            
            raw = response.get("content", "")
            result = raw if isinstance(raw, dict) else safe_json_parse(raw)
            patches = result.get("patches", [])
            return {
                "success": len(patches) > 0,
                "patches": patches,
                "diagnosis": result.get("diagnosis", ""),
                "attempt": attempt,
            }
        except Exception as e:
            logger.error("DebugAgent attempt %d failed: %s", attempt, e)
            return {"success": False, "patches": [], "diagnosis": str(e), "attempt": attempt}

