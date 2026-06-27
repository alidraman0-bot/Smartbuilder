import os
import json
import logging
from pathlib import Path
from typing import Optional
from app.core.ai_client import get_ai_client

try:
    import httpx
except ImportError:
    httpx = None

logger = logging.getLogger(__name__)

# Simple heuristic + AI Router fallback for framework detection
async def detect_framework(project_path: Path) -> str:
    """Detect the web framework of the given project.

    1. Look for characteristic files (package.json, pyproject.toml, requirements.txt, etc.).
    2. If ambiguous, call the AI Router with a short prompt.
    """
    # Heuristic checks
    if (project_path / "package.json").exists():
        try:
            data = json.loads((project_path / "package.json").read_text())
            deps = data.get("dependencies", {})
            dev = data.get("devDependencies", {})
            if any(fr in deps for fr in ["next", "react", "nextjs"]):
                return "nextjs"
            if "nuxt" in deps:
                return "nuxt"
            if "vue" in deps:
                return "vue"
            if "express" in deps:
                return "express"
        except Exception as e:
            logger.warning("Failed to parse package.json: %s", e)
    if (project_path / "requirements.txt").exists():
        txt = (project_path / "requirements.txt").read_text().lower()
        if "django" in txt:
            return "django"
        if "fastapi" in txt:
            return "fastapi"
        if "flask" in txt:
            return "flask"
    if (project_path / "pyproject.toml").exists():
        toml_content = (project_path / "pyproject.toml").read_text().lower()
        if "[tool.poetry.dependencies]" in toml_content:
            if "fastapi" in toml_content:
                return "fastapi"
            if "django" in toml_content:
                return "django"
        # Fallback to AI model
        prompt = (
            f"You are a framework detection assistant. Given the file structure of a project located at {project_path}, "
            "determine which web framework it uses (e.g., nextjs, react, vue, express, django, fastapi, flask). "
            "Only output the framework name in lower‑case, no extra text."
        )
        try:
            client = get_ai_client()
            response = await client.chat_completion(
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                model="gpt-4.1-mini"
            )
            framework = response.get("content", "").strip().lower()
            if framework:
                return framework
        except Exception as e:
            logger.error("AI framework detection failed: %s", e)
        # Default fallback
        return "static"
