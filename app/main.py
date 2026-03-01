from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import time
import logging
import traceback
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
from app.api.v1 import (
    ideas_api, research_api, builder_api, orchestration_api, 
    projects_api, monitoring_api, compliance_api, resources_api, 
    memory_api, preferences_api, settings_api, mvp_builder, editor,
    deployment_api, analytics_api, founder_api, billing_api, paystack_webhook,
    opportunity_api, market_signals_api, opportunity_engine_api, opportunity_scoring_api,
    startup_api, blueprint_api, ai_cofounder_api, verdict_api
)

app = FastAPI(
    title="Smartbuilder API",
    description="Deterministic FSM-based MVP builder",
    version="1.0.0",
    redirect_slashes=False
)

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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Clone request body for logging (careful with large bodies)
    try:
        # body = await request.body() # This consumes the body, need to re-read or handle carefully
        logger.info(f"Incoming Request: {request.method} {request.url}")
        logger.info(f"Headers: {request.headers}")
        # logger.info(f"Body: {body.decode()}") 
    except Exception:
        pass
        
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response Status: {response.status_code} (took {process_time:.4f}s)")
        return response
    except Exception as e:
        logger.error(f"UNHANDLED EXCEPTION: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(e)}
        )

app.include_router(ideas_api.router, prefix="/api/v1/ideas", tags=["Ideas"])
app.include_router(opportunity_api.router, prefix="/api/v1/opportunity", tags=["Opportunities"])
app.include_router(opportunity_engine_api.router, prefix="/api/v1", tags=["Opportunity Engine"])
app.include_router(opportunity_scoring_api.router, prefix="/api/v1", tags=["Opportunity Scoring"])
app.include_router(opportunity_scoring_api.intelligence_router, prefix="/api", tags=["Opportunity Intelligence"])

app.include_router(market_signals_api.router, prefix="/api/v1", tags=["Market Signals"])
app.include_router(startup_api.router, prefix="/api/v1", tags=["Startup Pipeline"])
app.include_router(blueprint_api.router, prefix="/api", tags=["Blueprint"])
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
app.include_router(billing_api.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(ai_cofounder_api.router, prefix="/api/v1/cofounder", tags=["AI Co-Founder"])
app.include_router(verdict_api.router, prefix="/api/v1", tags=["Verdict"])
app.include_router(paystack_webhook.router, prefix="/api/paystack", tags=["Webhooks"])

@app.get("/")
async def root():
    return {"message": "Smartbuilder API is running", "docs_url": "/docs"}
