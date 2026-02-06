"""
Editor WebSocket API

Handles real-time code synchronization using WebSockets.
Manages connections and broadcasts updates between clients.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from typing import List, Dict, Set
import json
import logging
from app.services.editor_service import editor_service

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # app_id -> List of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, app_id: str):
        await websocket.accept()
        if app_id not in self.active_connections:
            self.active_connections[app_id] = []
        self.active_connections[app_id].append(websocket)
        logger.info(f"New client connected to app {app_id}. Total: {len(self.active_connections[app_id])}")

    def disconnect(self, websocket: WebSocket, app_id: str):
        if app_id in self.active_connections:
            self.active_connections[app_id].remove(websocket)
            if not self.active_connections[app_id]:
                del self.active_connections[app_id]
        logger.info(f"Client disconnected from app {app_id}")

    async def broadcast(self, message: dict, app_id: str, exclude: WebSocket = None):
        if app_id not in self.active_connections:
            return
        
        for connection in self.active_connections[app_id]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client in {app_id}: {e}")

manager = ConnectionManager()

@router.websocket("/ws/{client_id}/{app_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, app_id: str):
    await manager.connect(websocket, app_id)
    try:
        while True:
            # Receive text/json from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            action = message.get("action")
            
            if action == "CODE_UPDATE":
                file_path = message.get("file_path")
                new_content = message.get("content")
                
                # 1. Update the filesystem
                success = editor_service.write_file(file_path, new_content)
                
                if success:
                    # 2. Broadcast to all clients in the same app (except sender)
                    sync_message = {
                        "type": "PUSH_CONTENT",
                        "file_path": file_path,
                        "content": new_content,
                        "sender_id": client_id
                    }
                    await manager.broadcast(sync_message, app_id, exclude=websocket)
                else:
                    await websocket.send_json({"type": "SYNC_ERROR", "message": "Failed to write file to disk"})

            elif action == "PING":
                await websocket.send_json({"type": "PONG"})

    except WebSocketDisconnect:
        manager.disconnect(websocket, app_id)
    except Exception as e:
        logger.error(f"WebSocket error for {client_id} in {app_id}: {e}")
        manager.disconnect(websocket, app_id)

# REST endpoints for initial load
@router.get("/files")
async def list_files(path: str = ""):
    return editor_service.list_files(path)

@router.get("/file/content")
async def get_file_content(path: str):
    content = editor_service.read_file(path)
    if content is None:
        raise HTTPException(status_code=404, detail="File not found")
    return {"content": content}
