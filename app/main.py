from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import (
    ideas_api, research_api, builder_api, orchestration_api, 
    projects_api, monitoring_api, compliance_api, resources_api, 
    memory_api, preferences_api, settings_api, mvp_builder, editor,
    deployment_api, analytics_api, founder_api
)

app = FastAPI(
    title="Smartbuilder API",
    description="Deterministic FSM-based MVP builder",
    version="1.0.0",
    redirect_slashes=False
)

import os

# Configure CORS
# In development, you might use ["*"]
# In production, this should be restricted to known origins via ALLOWED_ORIGINS env var.
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ideas_api.router, prefix="/api/v1/ideas", tags=["Ideas"])
app.include_router(research_api.router, prefix="/api/v1/research", tags=["Research"])
app.include_router(builder_api.router, prefix="/api/v1/builder", tags=["Builder"])
app.include_router(orchestration_api.router, prefix="/api/v1", tags=["Orchestration"])
app.include_router(projects_api.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(monitoring_api.router, prefix="/api/v1/monitor", tags=["Monitoring"])
app.include_router(compliance_api.router, prefix="/api/v1/compliance", tags=["Compliance"])
app.include_router(resources_api.router, prefix="/api/v1/resources", tags=["Resources"])
app.include_router(memory_api.router, prefix="/api/v1/memory", tags=["Memory"])
app.include_router(preferences_api.router, prefix="/api/v1/preferences", tags=["Preferences"])
app.include_router(settings_api.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(mvp_builder.router, prefix="/api/v1", tags=["MVP Builder"])
app.include_router(editor.router, prefix="/api/v1/editor", tags=["Code Editor"])
app.include_router(deployment_api.router, prefix="/api/v1/deployments", tags=["Deployments"])
app.include_router(analytics_api.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(founder_api.router, prefix="/api/v1/founder", tags=["Founder Intelligence"])

@app.get("/")
async def root():
    return {"message": "Smartbuilder API is running", "docs_url": "/docs"}
