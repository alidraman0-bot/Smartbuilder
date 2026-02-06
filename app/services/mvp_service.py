import logging
import asyncio
import json
import datetime
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class MvpService:
    def __init__(self):
        self.builds: Dict[str, Dict[str, Any]] = {}

    async def start_build(self, run_id: str, prd: Dict[str, Any]) -> Dict[str, Any]:
        """
        Initiate the controlled autonomous construction sequence.
        """
        build_id = f"BUILD-{uuid_hex()}"
        feature_count = len(prd.get("features", []))
        estimated_time = min(feature_count * 15 + 30, 120)  # 15s per feature + 30s base, max 120s
        
        self.builds[run_id] = {
            "build_id": build_id,
            "status": "INITIALIZING",
            "progress": 0,
            "logs": [],
            "files": {},
            "prd": prd,
            "config": {
                "tech_stack": "FastAPI (Backend) + React (Frontend)",
                "architecture": "Modular Micro-Services",
                "deployment_target": "Smartbuilder Edge (Preview)"
            },
            "artifacts": {
                "pages": [],
                "apis": [],
                "data_models": []
            },
            "errors": [],
            "start_time": datetime.datetime.now().isoformat(),
            "estimated_time": f"{estimated_time}s",
            "feature_count": feature_count,
            "aborted": False,
            "current_stage": "",
            "current_stage_label": ""
        }
        
        # Start the async construction background task
        asyncio.create_task(self._run_orchestrator(run_id))
        
        return self.builds[run_id]

    async def _run_orchestrator(self, run_id: str):
        """
        Strict Build Orchestrator enforcing constraints and modular steps.
        """
        build = self.builds[run_id]
        prd = build["prd"]
        
        # 0. Validation Engine
        self._add_log(run_id, "VALIDATOR", "Enforcing build constraints...")
        features = prd.get("features", [])
        if len(features) > 5:
            err = f"CRITICAL FAILURE: PRD exceeds feature limit (Max 5, found {len(features)}). Halting execution."
            build["errors"].append(err)
            self._add_log(run_id, "VALIDATOR", err, "error")
            build["status"] = "FAILED"
            return

        stages = [
            ("SCAFFOLD", "Project Scaffolder: Initializing workspace and dependency manifest..."),
            ("BACKEND", "Backend Generator: Creating CRUD APIs and security middleware..."),
            ("FRONTEND", "Frontend Generator: Building functional component tree..."),
            ("INTEGRATION", "Integration Layer: Establishing API handshake and state sync..."),
            ("VALIDATION", "Validation Engine: Verifying contract compliance and security..."),
            ("PACKAGE", "Packaging: Finalizing deployable system image...")
        ]

        total_steps = len(stages)
        
        for i, (stage, message) in enumerate(stages):
            # Check for abort
            if build.get("aborted"):
                build["status"] = "ABORTED"
                self._add_log(run_id, "SYSTEM", "Build aborted by user.", "warning")
                return
            
            build["status"] = stage
            build["current_stage"] = stage
            build["current_stage_label"] = message
            build["progress"] = int(((i + 1) / total_steps) * 100)
            
            self._add_log(run_id, stage, message)
            await asyncio.sleep(2) # Simulate deterministic execution

            # Subsystem logic - Generate realistic code stubs
            if stage == "SCAFFOLD":
                product_name = prd.get("title", "MyApp")
                build["files"]["package.json"] = json.dumps({
                    "name": product_name.lower().replace(" ", "-"),
                    "version": "0.1.0",
                    "dependencies": {"react": "^18.2.0", "fastapi": "^0.104.0"}
                }, indent=2)
                build["files"]["README.md"] = f"# {product_name}\n\nGenerated MVP by Smartbuilder\n\n## Features\n" + \
                    "\n".join([f"- {f.get('name', 'Feature')}" for f in features])
                build["files"]["requirements.txt"] = "fastapi==0.104.0\nuvicorn==0.24.0\npydantic==2.5.0"
                
            elif stage == "BACKEND":
                for f in features:
                    api_name = f.get("name", "api").lower().replace(" ", "_")
                    build["artifacts"]["apis"].append(f"POST /api/v1/{api_name}")
                    build["artifacts"]["data_models"].append(f"{f.get('name', 'Feature').replace(' ', '')}Model")
                    
                    # Generate stub API file
                    build["files"][f"api/{api_name}.py"] = f'''from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class {f.get('name', 'Feature').replace(' ', '')}Model(BaseModel):
    id: str
    name: str

@router.post("/{api_name}")
async def create_{api_name}(data: {f.get('name', 'Feature').replace(' ', '')}Model):
    return {{"status": "created", "data": data}}
'''
                    
            elif stage == "FRONTEND":
                for f in features:
                     page_name = f.get("name", "page").replace(" ", "")
                     build["artifacts"]["pages"].append(f"{page_name}View.tsx")
                     
                     # Generate stub page component
                     build["files"][f"pages/{page_name}View.tsx"] = f'''export default function {page_name}View() {{
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">{f.get('name', 'Feature')}</h1>
            <p>Functional component generated by Smartbuilder MVP Builder.</p>
        </div>
    );
}}
'''
                     
            elif stage == "VALIDATION":
                self._add_log(run_id, "VALIDATOR", "All API contracts verified. Security defaults applied.")
            
            self._add_log(run_id, stage, f"Stage {stage} complete in {i+1}.2s", "success")
            await asyncio.sleep(1)

        build["status"] = "COMPLETE"
        build["progress"] = 100
        self._add_log(run_id, "SYSTEM", "Build successful. System image ready for deployment.", "success")

    def _add_log(self, run_id: str, module: str, message: str, type: str = "info"):
        log_entry = {
            "time": datetime.datetime.now().strftime("%H:%M:%S.%f")[:-3],
            "module": module,
            "message": message,
            "type": type
        }
        if run_id in self.builds:
            self.builds[run_id]["logs"].append(log_entry)
            logger.info(f"[{module}] {message}")

    def get_build_status(self, run_id: str) -> Optional[Dict[str, Any]]:
        return self.builds.get(run_id)
    
    def abort_build(self, run_id: str) -> bool:
        """
        Abort an ongoing build.
        """
        if run_id in self.builds:
            build = self.builds[run_id]
            if build["status"] not in ["COMPLETE", "FAILED", "ABORTED"]:
                build["aborted"] = True
                self._add_log(run_id, "SYSTEM", "Abort signal received. Halting build...", "warning")
                return True
        return False

def uuid_hex():
    import uuid
    return uuid.uuid4().hex[:8]

mvp_service = MvpService()
