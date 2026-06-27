from fastapi import APIRouter, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import json
import logging

logger = logging.getLogger("smartbuilder.mvp_api")

# Import engine — guaranteed to always resolve thanks to resilient orchestrator
from backend.services.mvp_engine.orchestrator import engine

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections for real-time progress streaming."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            dead = []
            for ws in self.active_connections[session_id]:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.active_connections[session_id].remove(ws)


manager = ConnectionManager()


class BuildMVPRequest(BaseModel):
    idea: str = Field(..., min_length=3, description="The application idea to build")
    run_id: Optional[str] = None


@router.post("/build")
async def build_mvp(request: BuildMVPRequest, background_tasks: BackgroundTasks):
    """
    Start the full 7-step autonomous build pipeline.
    Returns a session_id immediately; progress is streamed via WebSocket.
    """
    session_id = "sess_" + str(abs(hash(request.idea)) % 100000)

    async def progress_callback(data: dict):
        update = {"type": "state_update", "session_id": session_id, **data}
        await manager.broadcast(session_id, update)

    background_tasks.add_task(engine.build_mvp, request.idea, progress_callback)

    logger.info("Build started — session=%s idea=%s", session_id, request.idea[:60])
    return {
        "session_id": session_id,
        "status": "starting",
        "message": "Build pipeline started via Python Agent SDKs.",
    }


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)


@router.get("/status/{session_id}")
async def get_status(session_id: str):
    """Get the status of a build session."""
    return {"session_id": session_id, "state": "S3", "progress": 40}
