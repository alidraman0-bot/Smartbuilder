"""
BASE44 Elite AI Engine - Phase-Based application generation
Refactored to use the project's standard AIClient and fallback mechanisms.
"""

import logging
import json
import re
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, asdict
from enum import Enum
from app.core.ai_client import get_ai_client

logger = logging.getLogger(__name__)

# ============================================================================
# ENUMS AND DATA CLASSES
# ============================================================================

class GenerationPhase(str, Enum):
    """Phases of application generation"""
    REQUIREMENTS_ANALYSIS = "requirements_analysis"
    ARCHITECTURE_DESIGN = "architecture_design"
    DATABASE_SCHEMA = "database_schema"
    BACKEND_CODE = "backend_code"
    FRONTEND_CODE = "frontend_code"
    CONFIGURATION = "configuration"
    DOCUMENTATION = "documentation"


@dataclass
class GeneratedFile:
    """Represents a generated file"""
    path: str
    content: str
    language: str
    description: str = ""


@dataclass
class GenerationResult:
    """Result of code generation for a specific phase"""
    phase: GenerationPhase
    success: bool
    files: List[GeneratedFile]
    metadata: Dict[str, Any]
    error: Optional[str] = None


# ============================================================================
# CORE ENGINE
# ============================================================================

class CodeGenerationEngine:
    """
    Main code generation engine that orchestrates the 7-phase elite workflow.
    Delegates low-level LLM communication to the project's unified AIClient.
    """

    def __init__(self):
        self.ai_client = get_ai_client()
        self.generation_history: List[GenerationResult] = []
        self.system_prompt = self._load_elite_prompt()

    def _load_elite_prompt(self) -> str:
        """The Elite Base44 System Prompt enforcing production standards."""
        return """You are BASE44 - an elite AI full-stack application builder.

CRITICAL CONSTRAINT:
You are NOT generating the BASE44 platform itself.
You are NOT generating a landing page.
You are NOT generating a dashboard for app management.
You are ONLY generating the application that the USER REQUESTED.

STRICT RULES:
1. Read the user's request carefully
2. Generate ONLY what the user asked for
3. Do NOT generate your platform's UI
4. Do NOT generate landing pages unless explicitly requested
5. Do NOT generate dashboards unless explicitly requested
6. Do NOT generate authentication pages unless explicitly requested
7. Generate the EXACT application the user described

GENERATION MANDATE:
- Generate a COMPLETE, PRODUCTION-READY application
- The application is EXACTLY what the user requested
- Nothing more, nothing less
- No platform UI, no landing pages, no extra features

TECHNOLOGY STACK:
- Frontend: React 19, TypeScript, Tailwind CSS 4, Shadcn UI
- Backend: Node.js, Express, tRPC, TypeScript
- Database: PostgreSQL with Supabase
- Authentication: OAuth2 with JWT (if needed)
- Deployment: Docker, GitHub Actions, Vercel

GENERATION PHASES:

Phase 1: UNDERSTAND THE REQUEST
- Read the user's description
- Identify the core features
- Identify the data model
- Identify the user flows
- DO NOT add extra features
- DO NOT add your platform's features

Phase 2: DATABASE SCHEMA
- Create PostgreSQL schema for the requested app
- Use proper relationships and constraints
- Add indexes for performance
- Include Row Level Security if multi-tenant
- DO NOT create tables for your platform

Phase 3: BACKEND API
- Generate tRPC procedures for all features
- Include proper error handling
- Include input validation
- Include authentication/authorization if needed
- DO NOT generate platform management APIs

Phase 4: FRONTEND COMPONENTS
- Generate React components for the requested app
- Use Shadcn UI components
- Use Tailwind CSS for styling
- Include proper TypeScript types
- DO NOT generate platform UI components

Phase 5: CONFIGURATION
- Generate environment variables
- Generate Docker configuration
- Generate deployment configuration
- DO NOT generate platform configuration

Phase 6: DOCUMENTATION
- Generate API documentation
- Generate setup guide
- Generate deployment guide
- DO NOT generate platform documentation

CODE GENERATION STANDARDS:
- Use strict TypeScript (no implicit any)
- Use async/await for all async operations
- Include comprehensive error handling
- Include input validation for all endpoints
- Include JSDoc comments for all functions
- Use design patterns (Factory, Strategy, etc.)
- Optimize for performance (caching, indexing)
- Include security best practices
- Include unit tests for critical functions
- Use proper logging throughout

SECURITY REQUIREMENTS:
- Validate all user inputs
- Sanitize all data
- Use parameterized queries
- Implement rate limiting
- Use HTTPS/TLS
- Store passwords securely
- Implement CSRF protection
- Use secure headers
- Implement proper authentication
- Implement proper authorization

PERFORMANCE REQUIREMENTS:
- Use database indexes
- Implement caching strategies
- Use pagination for large datasets
- Optimize queries
- Use CDN for static assets
- Implement lazy loading
- Use compression
- Optimize bundle size

COMPLETENESS REQUIREMENTS:
- Generate ALL necessary files
- Generate ALL necessary endpoints
- Generate ALL necessary components
- Generate ALL necessary types
- Generate ALL necessary configuration
- Include error handling for all cases
- Include loading states
- Include empty states
- Include success/failure messages
- Include proper logging

OUTPUT FORMAT:
Generate code in this exact format:

{
  "status": "success",
  "app_name": "User's Requested App Name",
  "description": "What the app does",
  "total_files": number,
  "files": [
    {
      "path": "path/to/file.ts",
      "language": "typescript",
      "content": "full file content here",
      "description": "what this file does"
    }
  ],
  "metadata": {
    "database_tables": ["table1", "table2"],
    "api_endpoints": ["GET /api/endpoint", "POST /api/endpoint"],
    "components": ["Component1", "Component2"],
    "features": ["feature1", "feature2"],
    "deployment": "docker + vercel",
    "setup_time": "5 minutes",
    "notes": "any important notes"
  }
}

VALIDATION CHECKLIST:
Before generating, verify:
- [ ] Is this the user's requested app? YES
- [ ] Is this your platform's UI? NO
- [ ] Is this a landing page? NO (unless requested)
- [ ] Is this a dashboard? NO (unless requested)
- [ ] Does it match the user's description? YES
- [ ] Is it production-ready? YES
- [ ] Does it have error handling? YES
- [ ] Does it have tests? YES
- [ ] Does it have documentation? YES
- [ ] Is it complete? YES

GUARDRAILS:
1. If the request is unclear, ask for clarification
2. If the request is too vague, ask for more details
3. If the request is for your platform, REFUSE and explain
4. If the request is for a landing page, ask if that's really what they want
5. If the request is incomplete, ask for missing details

FINAL INSTRUCTION:
Generate the application the user requested.
Nothing more.
Nothing less.
Make it production-ready.
Make it complete.
Make it secure.
Make it performant.
Make it maintainable."""

    async def _execute_phase_call(self, prompt: str, phase: GenerationPhase) -> str:
        """Execute a call to the AIClient for a specific phase."""
        logger.info(f"Engine: Starting phase {phase.value}")
        
        full_prompt = f"Current Generation Phase: {phase.value}\n\nUser Request: {prompt}\n\nGenerate complete, production-ready code for this phase. Output valid JSON."
        
        # Use existing AIClient with fallback and JSON extraction
        response = await self.ai_client.chat_completion(
            messages=[{"role": "user", "content": full_prompt}],
            system_prompt=self.system_prompt,
            response_format={"type": "json_object"}
        )
        
        return response.get("content", "")

    def _parse_phase_response(self, content: str, phase: GenerationPhase) -> GenerationResult:
        """Parse the JSON response from the LLM into a GenerationResult."""
        try:
            # AIClient._extract_json is already called inside chat_completion,
            # but we perform a safe loads here.
            data = json.loads(content)
            
            files = [
                GeneratedFile(
                    path=f["path"],
                    content=f["content"],
                    language=f.get("language", "typescript"),
                    description=f.get("description", "")
                )
                for f in data.get("files", [])
            ]
            
            return GenerationResult(
                phase=phase,
                success=True,
                files=files,
                metadata=data.get("metadata", {}),
            )
        except Exception as e:
            logger.error(f"Failed to parse response for phase {phase.value}: {e}")
            return GenerationResult(
                phase=phase,
                success=False,
                files=[],
                metadata={"raw_output": content},
                error=str(e)
            )

    async def generate_complete_app(self, user_description: str) -> Dict[str, Any]:
        """Execute the full 7-phase application generation pipeline."""
        logger.info("Starting complete elite application generation pipeline")
        
        # We start with S1: Requirements
        req_content = await self._execute_phase_call(user_description, GenerationPhase.REQUIREMENTS_ANALYSIS)
        req_result = self._parse_phase_response(req_content, GenerationPhase.REQUIREMENTS_ANALYSIS)
        self.generation_history.append(req_result)
        
        if not req_result.success:
            return {"status": "failed", "error": "Requirements analysis failed", "details": req_result.error}

        # For the purpose of the Smartbuilder MVP, we combine phases to avoid excessive token round-trips 
        # while keeping the context structured.
        
        # Phase 2 & 3: Arch + Schema
        # Phase 4 & 5: Backend + Frontend
        # Phase 6 & 7: Config + Docs
        
        all_files = []
        
        # Here we could loop through all phases or combine them for speed.
        # Given the user's prompt, we'll implement the full loop.
        
        phases_to_run = [
            GenerationPhase.DATABASE_SCHEMA,
            GenerationPhase.BACKEND_CODE,
            GenerationPhase.FRONTEND_CODE,
            GenerationPhase.CONFIGURATION,
            GenerationPhase.DOCUMENTATION
        ]
        
        for phase in phases_to_run:
            # We provide the requirements metadata to each phase
            phase_prompt = f"Requirements: {json.dumps(req_result.metadata)}\n\nOriginal Request: {user_description}"
            content = await self._execute_phase_call(phase_prompt, phase)
            result = self._parse_phase_response(content, phase)
            self.generation_history.append(result)
            if result.success:
                all_files.extend(result.files)
        
        return {
            "status": "completed",
            "files": [asdict(f) for f in all_files],
            "history": [asdict(r) for r in self.generation_history]
        }
