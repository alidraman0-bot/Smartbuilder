import uuid
import logging
from pathlib import Path
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List

logger = logging.getLogger("smartbuilder.deploy_engine")

# In‑memory job store (deployment_id -> dict)
JOB_STORE: Dict[str, Dict[str, Any]] = {}

# Mock provider SDKs – in real code replace with Vercel/Cloudflare SDK calls
async def vercel_deploy(project_name: str, config: Dict[str, Any]) -> str:
    await asyncio.sleep(1)  # simulate network delay
    return f"https://{project_name.lower().replace(' ', '-')}.vercel.app"

async def cloudflare_deploy(project_name: str, config: Dict[str, Any]) -> str:
    await asyncio.sleep(1)
    return f"https://{project_name.lower().replace(' ', '-')}.pages.dev"

# Simple step messages – can be extended
STAGE_MESSAGES = [
    "Preparing deployment...",
    "Analyzing framework...",
    "Installing dependencies...",
    "Building application...",
    "Optimizing assets...",
    "Deploying to edge network...",
    "Configuring CDN...",
    "Generating SSL certificates...",
    "Activating monitoring...",
    "Deployment successful...",
]

async def run_deployment_pipeline(project_name: str, source_code: str, env_vars: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the full deployment pipeline and store status updates.
    This is a mock implementation – each stage just sleeps and updates JOB_STORE.
    """
    deployment_id = f"dep_{uuid.uuid4().hex[:8]}"
    JOB_STORE[deployment_id] = {
        "project_name": project_name,
        "status": "running",
        "stages": [],
        "url": None,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
    }

    # Stage 1: Prepare (no real work)
    for idx, msg in enumerate(STAGE_MESSAGES):
        JOB_STORE[deployment_id]["stages"].append({"stage": msg, "progress": int((idx / len(STAGE_MESSAGES)) * 100)})
        logger.info(f"[{deployment_id}] {msg}")
        await asyncio.sleep(0.5)  # simulate work
        # Simple provider decision – alternate between Vercel and Cloudflare
        if idx == len(STAGE_MESSAGES) - 2:  # just before success, perform deploy
            provider = "vercel" if idx % 2 == 0 else "cloudflare"
            if provider == "vercel":
                url = await vercel_deploy(project_name, {})
            else:
                url = await cloudflare_deploy(project_name, {})
            JOB_STORE[deployment_id]["url"] = url
            logger.info(f"[{deployment_id}] Deployed to {provider} – {url}")

    JOB_STORE[deployment_id]["status"] = "success"
    JOB_STORE[deployment_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
    # Final stage progress 100
    JOB_STORE[deployment_id]["stages"].append({"stage": "Deployment successful...", "progress": 100})
    return {
        "deployment_id": deployment_id,
        "project_name": project_name,
        "status": "success",
        "url": JOB_STORE[deployment_id]["url"],
        "started_at": JOB_STORE[deployment_id]["started_at"],
        "completed_at": JOB_STORE[deployment_id]["completed_at"],
    }

# Expose helper for API router
async def start_deployment(payload: Dict[str, Any]) -> Dict[str, Any]:
    project_name = payload.get("project_name", f"proj_{uuid.uuid4().hex[:6]}")
    source_code = payload.get("source_code", "")
    env_vars = payload.get("env_vars", {})
    # Fire and forget – run in background task
    asyncio.create_task(run_deployment_pipeline(project_name, source_code, env_vars))
    # Return immediate deployment_id for polling/streaming
    deployment_id = list(JOB_STORE.keys())[-1]
    return {"deployment_id": deployment_id, "status": "queued", "project_name": project_name}

def get_deployment_status(deployment_id: str) -> Dict[str, Any]:
    return JOB_STORE.get(deployment_id, {"error": "Deployment not found"})


class DeployEngine:
    """Thin wrapper that uses the mock deployment pipeline.
    It matches the interface expected by LaunchOrchestrator.
    """
    def __init__(self, framework: str):
        self.framework = framework

    async def deploy(self, workspace: Path) -> str:
        # Use the workspace name as project identifier
        project_name = workspace.name
        payload = {"project_name": project_name, "source_code": "", "env_vars": {}}
        # Kick off deployment (background task)
        result = await start_deployment(payload)
        deployment_id = result.get("deployment_id")
        # Poll until deployment succeeds
        while True:
            status = get_deployment_status(deployment_id)
            if status.get("status") == "success":
                return status.get("url")
            await asyncio.sleep(0.5)


async def stream_deployment_status(deployment_id: str):
    """Yield Server‑Sent Events JSON objects for the given deployment.
    In a real implementation this would be a proper SSE generator.
    """
    last_len = 0
    while True:
        job = JOB_STORE.get(deployment_id)
        if not job:
            yield {"error": "Deployment not found"}
            break
        # Send new stages only
        stages = job["stages"]
        if len(stages) > last_len:
            for stage in stages[last_len:]:
                yield {"stage": stage["stage"], "progress": stage["progress"], "status": job["status"], "url": job.get("url")}
            last_len = len(stages)
        if job["status"] in ("success", "failed"):
            break
        await asyncio.sleep(0.5)
