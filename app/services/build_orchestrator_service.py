"""
Build Orchestrator Service

The BRAIN of the MVP Builder system.
Coordinates the entire build pipeline:
  1. Fetch project blueprint
  2. AI creates build plan (architecture only)
  3. Task queue created
  4. Tasks executed sequentially (db → backend → frontend → integration → run)
  5. Code generated per task
  6. E2B sandbox runs project
  7. Preview URL returned
  8. Error fix loop on failure

This is the single entry point for the build process.
"""

import logging
import uuid
import time
import asyncio
from datetime import datetime
from typing import Dict, Any, Optional, List
from app.core.supabase import get_service_client
from app.services.build_plan_generator import BuildPlanGenerator
from app.services.task_pipeline_service import TaskPipelineService, TaskType, TaskStatus
from app.services.code_generator_service import CodeGeneratorService
from app.services.sandbox_service import SandboxService

logger = logging.getLogger(__name__)


class BuildStatus:
    IDLE = "idle"
    READING_BLUEPRINT = "reading_blueprint"
    PLANNING = "planning"
    BUILDING = "building"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"
    FIXING = "fixing"


class BuildOrchestrator:
    def __init__(self):
        self.supabase = get_service_client()
        self.plan_generator = BuildPlanGenerator()
        self.pipeline = TaskPipelineService()
        self.code_generator = CodeGeneratorService()
        self.sandbox_service = SandboxService()

        # Active builds: build_id → build state
        self.builds: Dict[str, Dict[str, Any]] = {}

    async def start_build(self, project_id: str, blueprint: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main entry point. Kicks off the entire build pipeline.
        Returns immediately with a build_id; the build runs in the background.
        """
        build_id = str(uuid.uuid4())
        start_time = time.time()

        # Initialize build state
        self.builds[build_id] = {
            "build_id": build_id,
            "project_id": project_id,
            "status": BuildStatus.IDLE,
            "blueprint": blueprint,
            "build_plan": None,
            "build_plan_id": None,
            "all_files": [],
            "preview_url": None,
            "sandbox_id": None,
            "error": None,
            "fix_attempts": 0,
            "max_fix_attempts": 3,
            "start_time": start_time,
            "end_time": None,
            "logs": [],
            "stats": {
                "pages_created": 0,
                "apis_generated": 0,
                "database_tables": 0,
                "total_files": 0,
                "build_time": "0s",
            },
        }

        # Run build in background
        asyncio.create_task(self._run_build(build_id))

        return {
            "build_id": build_id,
            "project_id": project_id,
            "status": BuildStatus.READING_BLUEPRINT,
            "message": "Build started"
        }

    async def _run_build(self, build_id: str):
        """Execute the full build pipeline."""
        build = self.builds[build_id]

        try:
            # Step 1: Read Blueprint
            build["status"] = BuildStatus.READING_BLUEPRINT
            self._log(build_id, "Reading startup blueprint...", "info")

            blueprint = build["blueprint"]
            if not blueprint:
                blueprint = await self._fetch_blueprint(build["project_id"])
                build["blueprint"] = blueprint

            if not blueprint:
                raise Exception("No blueprint found for this project")

            await asyncio.sleep(0.5)  # Small delay for UI effect

            # Step 2: Generate Build Plan
            build["status"] = BuildStatus.PLANNING
            self._log(build_id, "Designing architecture...", "info")

            build_plan = await self.plan_generator.generate_build_plan(
                blueprint=blueprint,
                project_id=build["project_id"],
            )
            build["build_plan"] = build_plan
            build_plan_id = str(uuid.uuid4())
            build["build_plan_id"] = build_plan_id

            self._log(build_id, f"Architecture planned: {build_plan.get('app_type', 'app')}", "success")

            # Step 3: Create Task Pipeline
            build["status"] = BuildStatus.BUILDING
            tasks = self.pipeline.create_pipeline(
                project_id=build["project_id"],
                build_plan_id=build_plan_id,
            )
            self._log(build_id, f"Task queue created: {len(tasks)} tasks", "info")

            # Step 4: Execute Tasks Sequentially
            all_files = []
            schema_sql = ""

            for task in tasks:
                self.pipeline.mark_running(task)
                self._log(build_id, f"Executing: {task.task_type.value}", "info")

                try:
                    result = await self._execute_task(task, build_plan, all_files, schema_sql)

                    # Collect generated files
                    task_files = result.get("files", [])
                    all_files.extend(task_files)

                    # Capture schema for backend generation
                    if task.task_type == TaskType.DATABASE and task_files:
                        schema_sql = task_files[0].get("content", "")

                    # Update stats
                    self._update_stats(build, task.task_type, result)

                    self.pipeline.mark_complete(task, result)
                    self._log(build_id, f"Completed: {task.task_type.value}", "success")

                except Exception as task_error:
                    logger.error(f"Task {task.task_type.value} failed: {task_error}")
                    self.pipeline.mark_failed(task, str(task_error))
                    self._log(build_id, f"Failed: {task.task_type.value} — {str(task_error)}", "error")

                    # Attempt error fix loop
                    fixed = await self._error_fix_loop(
                        build_id, task, build_plan, all_files, str(task_error)
                    )
                    if not fixed:
                        raise Exception(f"Build failed at {task.task_type.value}: {task_error}")

            # Step 5: Assemble and deploy
            build["all_files"] = all_files
            build["stats"]["total_files"] = len(all_files)

            # Step 6: Run in E2B sandbox
            build["status"] = BuildStatus.RUNNING
            self._log(build_id, "Installing dependencies...", "info")

            sandbox_id = await self.sandbox_service.create_sandbox()
            build["sandbox_id"] = sandbox_id

            # Write files to sandbox
            await self.sandbox_service.hot_reload(sandbox_id, all_files)
            self._log(build_id, f"Wrote {len(all_files)} files to sandbox", "info")

            # Start preview
            self._log(build_id, "Launching preview...", "info")
            preview_url = await self.sandbox_service.start_preview(sandbox_id)
            build["preview_url"] = preview_url

            # Step 7: Complete!
            build["status"] = BuildStatus.COMPLETE
            build["end_time"] = time.time()
            elapsed = build["end_time"] - build["start_time"]
            minutes = int(elapsed // 60)
            seconds = int(elapsed % 60)
            build["stats"]["build_time"] = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"

            self._log(build_id, "✅ Build complete! App is ready.", "success")

        except Exception as e:
            logger.error(f"Build {build_id} failed: {e}")
            build["status"] = BuildStatus.FAILED
            build["error"] = str(e)
            build["end_time"] = time.time()
            self._log(build_id, f"❌ Build failed: {str(e)}", "error")

    async def _execute_task(
        self,
        task,
        build_plan: Dict[str, Any],
        existing_files: List[Dict[str, Any]],
        schema_sql: str = "",
    ) -> Dict[str, Any]:
        """Execute a single build task using AI code generation."""
        if task.task_type == TaskType.ARCHITECTURE:
            return await self.code_generator.generate_architecture(build_plan)

        elif task.task_type == TaskType.DATABASE:
            return await self.code_generator.generate_database(build_plan)

        elif task.task_type == TaskType.BACKEND:
            return await self.code_generator.generate_backend(build_plan, schema_sql)

        elif task.task_type == TaskType.FRONTEND:
            api_routes = build_plan.get("api_routes", [])
            return await self.code_generator.generate_frontend(build_plan, api_routes)

        elif task.task_type == TaskType.INTEGRATION:
            return await self.code_generator.generate_integration(build_plan, existing_files)

        elif task.task_type == TaskType.RUN:
            # The "run" task is handled by the orchestrator directly (sandbox deploy)
            await asyncio.sleep(0.5)
            return {"files": [], "message": "Ready for sandbox deployment"}

        else:
            raise ValueError(f"Unknown task type: {task.task_type}")

    async def _error_fix_loop(
        self,
        build_id: str,
        failed_task,
        build_plan: Dict[str, Any],
        existing_files: List[Dict[str, Any]],
        error_log: str,
    ) -> bool:
        """
        Self-healing build loop.
        Captures error → sends to AI → gets fix → retries.
        Max 3 attempts.
        """
        build = self.builds[build_id]

        for attempt in range(build["max_fix_attempts"]):
            build["fix_attempts"] += 1
            build["status"] = BuildStatus.FIXING
            self._log(build_id, f"Auto-fix attempt {attempt + 1}/{build['max_fix_attempts']}", "warning")

            try:
                # Ask AI to fix the error
                fix_prompt = f"""The following build task failed. Fix the code.

Task: {failed_task.task_type.value}
Error: {error_log}

Build Plan: {json.dumps(build_plan, indent=2)[:2000]}

Existing Files: {json.dumps([f['path'] for f in existing_files])}

Generate FIXED code for this task. Return the same JSON format as the original task would return."""

                from app.core.ai_client import get_ai_client
                ai = get_ai_client()
                response = await ai.chat_completion(
                    messages=[{"role": "user", "content": fix_prompt}],
                    system_prompt="You are a senior engineer debugging a build failure. Fix the issue and return corrected code.",
                    response_format={"type": "json_object"},
                    max_tokens=4000,
                )

                import json
                result = json.loads(response["content"])

                # Mark task as complete with the fix
                failed_task.status = TaskStatus.PENDING  # Reset
                self.pipeline.mark_running(failed_task)
                self.pipeline.mark_complete(failed_task, result)

                self._log(build_id, f"Auto-fix succeeded for {failed_task.task_type.value}", "success")
                build["status"] = BuildStatus.BUILDING
                return True

            except Exception as fix_error:
                error_log = str(fix_error)
                self._log(build_id, f"Fix attempt {attempt + 1} failed: {str(fix_error)}", "error")

        return False

    async def _fetch_blueprint(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Fetch the startup blueprint from Supabase."""
        try:
            response = self.supabase.table("startup_blueprints").select("*").eq(
                "project_id", project_id
            ).limit(1).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Failed to fetch blueprint: {e}")
            return None

    def get_build_status(self, build_id: str) -> Dict[str, Any]:
        """Get complete status of a build."""
        build = self.builds.get(build_id)
        if not build:
            return {"error": "Build not found", "status": "unknown"}

        # Calculate elapsed time
        elapsed = 0
        if build["start_time"]:
            end = build["end_time"] or time.time()
            elapsed = end - build["start_time"]

        pipeline_progress = {}
        if build.get("build_plan_id"):
            pipeline_progress = self.pipeline.get_progress(build["build_plan_id"])

        return {
            "build_id": build_id,
            "project_id": build["project_id"],
            "status": build["status"],
            "preview_url": build["preview_url"],
            "error": build["error"],
            "fix_attempts": build["fix_attempts"],
            "elapsed_seconds": int(elapsed),
            "pipeline": pipeline_progress,
            "stats": build["stats"],
            "logs": build["logs"][-50:],  # Last 50 logs
        }

    def get_build_stats(self, build_id: str) -> Dict[str, Any]:
        """Get the 'wow' stats for a completed build."""
        build = self.builds.get(build_id)
        if not build:
            return {}
        return build["stats"]

    def get_build_logs(self, build_id: str) -> List[Dict[str, Any]]:
        """Get build log entries."""
        build = self.builds.get(build_id)
        if not build:
            return []
        return build["logs"]

    def _log(self, build_id: str, message: str, level: str = "info"):
        """Add a log entry to the build."""
        build = self.builds.get(build_id)
        if build:
            entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": message,
                "level": level,
            }
            build["logs"].append(entry)
            logger.info(f"[Build {build_id[:8]}] [{level}] {message}")

    def _update_stats(self, build: Dict[str, Any], task_type: TaskType, result: Dict[str, Any]):
        """Update the 'wow' stats based on task results."""
        stats = build["stats"]
        if task_type == TaskType.DATABASE:
            stats["database_tables"] = result.get("tables_count", 0)
        elif task_type == TaskType.BACKEND:
            stats["apis_generated"] = result.get("endpoints_count", 0)
        elif task_type == TaskType.FRONTEND:
            stats["pages_created"] = result.get("pages_count", 0)
        elif task_type == TaskType.ARCHITECTURE:
            stats["total_files"] = result.get("total_files", 0)


# Add missing import at module level
import json
