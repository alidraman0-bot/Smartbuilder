from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.project_service import project_service

router = APIRouter()

# --- Request Models ---
class AddDomainRequest(BaseModel):
    domain: str

class InviteMemberRequest(BaseModel):
    email: str
    role: str

class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    root_directory: Optional[str] = None
    framework: Optional[str] = None

class EnvVarRequest(BaseModel):
    key: str
    value: str
    target: List[str]

# --- Projects ---
@router.get("/")
async def list_projects():
    return project_service.list_projects()

@router.get("/{project_id}")
async def get_project(project_id: str):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.patch("/{project_id}")
async def update_project(project_id: str, request: UpdateProjectRequest):
    updates = request.dict(exclude_unset=True)
    updated_project = project_service.update_project(project_id, updates)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project

@router.delete("/{project_id}")
async def delete_project(project_id: str):
    project_service.delete_project(project_id)
    return {"status": "success"}

# --- Environment Variables ---
@router.get("/{project_id}/env")
async def list_env_vars(project_id: str):
    return project_service.get_env_vars(project_id)

@router.post("/{project_id}/env")
async def save_env_var(project_id: str, request: EnvVarRequest):
    try:
        return project_service.save_env_var(project_id, request.key, request.value, request.target)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{project_id}/env/{env_id}")
async def remove_env_var(project_id: str, env_id: str):
    project_service.remove_env_var(project_id, env_id)
    return {"status": "success"}

# --- Domains ---
@router.get("/{project_id}/domains")
async def list_domains(project_id: str):
    return project_service.get_domains(project_id)

@router.post("/{project_id}/domains")
async def add_domain(project_id: str, request: AddDomainRequest):
    return project_service.add_domain(project_id, request.domain)

@router.post("/{project_id}/domains/{domain}/verify")
async def verify_domain(project_id: str, domain: str):
    try:
        return project_service.verify_dns(project_id, domain)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{project_id}/domains/{domain}")
async def remove_domain(project_id: str, domain: str):
    project_service.remove_domain(project_id, domain)
    return {"status": "success"}

# --- Team ---
@router.get("/{project_id}/team")
async def list_team_members(project_id: str):
    return project_service.get_team(project_id)

@router.post("/{project_id}/team/invite")
async def invite_member(project_id: str, request: InviteMemberRequest):
    return project_service.invite_member(project_id, request.email, request.role)

@router.delete("/{project_id}/team/{user_id}")
async def remove_member(project_id: str, user_id: str):
    project_service.remove_member(project_id, user_id)
    return {"status": "success"}

# --- Activity ---
@router.get("/{project_id}/activity")
async def get_activity_log(project_id: str):
    return project_service.get_activity_log(project_id)
