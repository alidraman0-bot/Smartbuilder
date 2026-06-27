from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uuid
import logging

from app.services.launch_orchestrator import LaunchOrchestrator
from app.services.status_registry import get_status, add_status

logger = logging.getLogger(__name__)

router = APIRouter()

templates = Jinja2Templates(directory=Path(__file__).parents[2] / "templates")

@router.get("/deploy", response_class=HTMLResponse)
async def deploy_page(request: Request):
    """Render the deployment UI page.
    The UI allows users to upload an MVP bundle (as a JSON payload) and monitors real‑time status.
    """
    return templates.TemplateResponse("deploy.html", {"request": request})

class DeployRequest(BaseModel):
    project_name: str
    files: list[dict]  # {filename: str, content: str (base64)}
    env: dict = {}
    db_schema: str | None = None

@router.post("/api/v1/deploy/launch", status_code=202)
async def launch_deploy(req: DeployRequest, background_tasks: BackgroundTasks):
    launch_id = str(uuid.uuid4())
    try:
        orchestrator = LaunchOrchestrator(launch_id)
        background_tasks.add_task(orchestrator.start_pipeline, req)
        return {"launch_id": launch_id}
    except Exception as exc:
        logger.exception("Launch failed")
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("/api/v1/deploy/status/{launch_id}")
async def get_deploy_status(launch_id: str):
    """Return the accumulated status messages for a given launch ID."""
    msgs = await get_status(launch_id)
    return {"launch_id": launch_id, "messages": msgs}

# Simple SSE endpoint – streams new status messages as they arrive
@router.get("/api/v1/deploy/stream/{launch_id}")
async def stream_deploy_status(request: Request, launch_id: str):
    from sse_starlette.sse import EventSourceResponse
    async def event_generator():
        last_len = 0
        while True:
            if await request.is_disconnected():
                break
            msgs = await get_status(launch_id)
            if len(msgs) > last_len:
                for msg in msgs[last_len:]:
                    yield {"event": "status", "data": msg}
                last_len = len(msgs)
            await asyncio.sleep(0.5)
    return EventSourceResponse(event_generator())
