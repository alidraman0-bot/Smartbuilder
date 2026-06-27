import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any

logger = logging.getLogger("smartbuilder.launch_service")

# Simple framework detection based on keywords in source code
FRAMEWORK_KEYWORDS = {
    "nextjs": "Next.js",
    "react": "React",
    "vue": "Vue",
    "express": "Express",
    "fastapi": "FastAPI",
    "node": "Node.js",
}

def detect_framework(source_code: str) -> str:
    """Very naive framework detection.
    In a real system this would call an AI Router model.
    """
    lowered = source_code.lower()
    for kw, name in FRAMEWORK_KEYWORDS.items():
        if kw in lowered:
            logger.info(f"Detected framework {name} via keyword '{kw}'.")
            return name
    logger.info("Framework detection fallback to 'Generic'.")
    return "Generic"

def generate_deployment_config(framework: str, env_vars: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a mock deployment config based on the detected framework.
    Returns a dict with build, install commands and output dir.
    """
    if framework == "Next.js":
        config = {
            "install_cmd": "npm ci",
            "build_cmd": "npm run build",
            "output_dir": ".next",
        }
    elif framework == "React":
        config = {
            "install_cmd": "npm ci",
            "build_cmd": "npm run build",
            "output_dir": "build",
        }
    elif framework == "Vue":
        config = {
            "install_cmd": "npm ci",
            "build_cmd": "npm run build",
            "output_dir": "dist",
        }
    elif framework == "Express":
        config = {
            "install_cmd": "npm ci",
            "build_cmd": "node server.js",
            "output_dir": "",
        }
    elif framework == "FastAPI":
        config = {
            "install_cmd": "pip install -r requirements.txt",
            "build_cmd": "uvicorn main:app --host 0.0.0.0 --port 8000",
            "output_dir": "",
        }
    else:
        config = {
            "install_cmd": "npm ci || pip install -r requirements.txt",
            "build_cmd": "npm run build || echo 'No build step',",
            "output_dir": "dist",
        }
    # Merge env vars into config for later use
    config["env"] = env_vars
    return config

def start_mock_deployment(project_name: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """Pretend toem this would interact with Vercel/Cloudflare SDKs.
    """
    deployment_id = f"dep_{uuid.uuid4().hex[:8]}"
    url = f"https://{project_name.lower().replace(' ', '-')}.{deployment_id}.smartbuilder.app"
    logger.info(f"Mock deployment started: {deployment_id} -> {url}")
    # Simulate instant success for the mock
    return {
        "deployment_id": deployment_id,
        "status": "live",
        "url": url,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }

def process_mvp(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Main entry point: receive MVP payload, run detection, config generation, and mock deployment.
    Returns a summary dict for the API response.
    """
    project_name = payload.get("project_name", f"proj_{uuid.uuid4().hex[:6]}")
    source_code = payload.get("source_code", "")
    env_vars = payload.get("env_vars", {})

    logger.info(f"Processing MVP for project '{project_name}'.")
    framework = detect_framework(source_code)
    config = generate_deployment_config(framework, env_vars)
    deployment = start_mock_deployment(project_name, config)

    return {
        "project_name": project_name,
        "framework": framework,
        "deployment": deployment,
        "config": config,
    }
