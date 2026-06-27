"""
MVP Pipeline — Autonomous Build & Deploy Orchestrator

Implements the mandatory 8-step execution pipeline:
  1. ANALYZE    — OpenAI generates structured PRD
  2. DESIGN     — Claude refines architecture & validates logic
  3. GENERATE   — Base44 synthesises the codebase
  4. SCAFFOLD   — Base44 initialises the project directory
  5. OPTIMIZE   — Gemini injects perf patches & feature expansions
  6. DEPLOY     — E2B provisions sandbox & runs the app
  7. VERIFY     — Debug Agent intercepts failures, patches, retries (max 3)
  8. FINALIZE   — Returns live Preview URL & project state

Public API:
  buildMVP(user_idea)                → PipelineResult
  improveMVP(session_id, instruction) → PipelineResult
"""

import logging
import time
import asyncio
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, List, Optional, Callable
from enum import Enum

from app.agents.pipeline_agents import (
    OpenAIPlannerAgent,
    ClaudeArchitectAgent,
    GeminiEnhancerAgent,
    DebugAgent,
)
from app.services.base44_build_system import Base44BuildSystem, GeneratedFile
from app.services.sandbox_service import SandboxService

logger = logging.getLogger(__name__)


# ============================================================================
# Types
# ============================================================================

class PipelineStep(str, Enum):
    ANALYZE   = "analyze"
    DESIGN    = "design"
    GENERATE  = "generate"
    SCAFFOLD  = "scaffold"
    OPTIMIZE  = "optimize"
    DEPLOY    = "deploy"
    VERIFY    = "verify"
    FINALIZE  = "finalize"


class StepStatus(str, Enum):
    PENDING   = "pending"
    ACTIVE    = "active"
    COMPLETED = "completed"
    FAILED    = "failed"
    SKIPPED   = "skipped"


@dataclass
class StepResult:
    step: str
    status: str
    duration_ms: int = 0
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class PipelineContext:
    """Cross-step state container passed through the pipeline."""
    idea: str = ""
    plan: Optional[Dict[str, Any]] = None
    architecture: Optional[Dict[str, Any]] = None
    files: List[Dict[str, str]] = field(default_factory=list)
    scaffold: Optional[Dict[str, Any]] = None
    enhanced_files: List[Dict[str, str]] = field(default_factory=list)
    sandbox_id: Optional[str] = None
    preview_url: Optional[str] = None
    build_logs: str = ""
    step_results: List[StepResult] = field(default_factory=list)
    project_name: str = "My App"
    status: str = "running"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "idea": self.idea,
            "plan": self.plan,
            "architecture": self.architecture,
            "files_count": len(self.files),
            "scaffold": self.scaffold,
            "sandbox_id": self.sandbox_id,
            "preview_url": self.preview_url,
            "project_name": self.project_name,
            "status": self.status,
            "steps": [s.to_dict() for s in self.step_results],
        }


@dataclass
class PipelineResult:
    """Final output of the build pipeline."""
    plan: Optional[Dict[str, Any]] = None
    architecture: Optional[Dict[str, Any]] = None
    app: Optional[Dict[str, Any]] = None
    preview_url: Optional[str] = None
    status: str = "failed"
    steps: List[Dict[str, Any]] = field(default_factory=list)
    error: Optional[str] = None
    project_name: str = "My App"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "plan": self.plan,
            "architecture": self.architecture,
            "app": self.app,
            "preview_url": self.preview_url,
            "status": self.status,
            "steps": self.steps,
            "error": self.error,
            "project_name": self.project_name,
        }


# Type alias for event callbacks
EventCallback = Optional[Callable[[str, str, Optional[Dict[str, Any]]], None]]


# ============================================================================
# Pipeline Engine
# ============================================================================

class MVPPipeline:
    """
    Autonomous 8-step build pipeline.
    Each step is isolated and communicates via the PipelineContext.
    """

    def __init__(self, on_event: EventCallback = None):
        self.planner = OpenAIPlannerAgent()
        self.architect = ClaudeArchitectAgent()
        self.enhancer = GeminiEnhancerAgent()
        self.debug_agent = DebugAgent()
        self.build_system = Base44BuildSystem()
        self.sandbox_service = SandboxService()
        self.on_event = on_event or self._default_event

    def _default_event(self, step: str, message: str, data: Optional[Dict] = None):
        logger.info("[Pipeline:%s] %s", step, message)

    def _emit(self, step: str, message: str, data: Optional[Dict] = None):
        self.on_event(step, message, data)

    # -----------------------------------------------------------------------
    # Main Entry Points
    # -----------------------------------------------------------------------

    async def build_mvp(self, user_idea: str) -> PipelineResult:
        """
        Execute the full 8-step autonomous build pipeline.
        Returns: { plan, architecture, app, preview_url, status }
        """
        ctx = PipelineContext(idea=user_idea)
        self._emit("pipeline", "Starting autonomous MVP build pipeline")

        try:
            # Step 1: ANALYZE
            await self._step_analyze(ctx)

            # Step 2: DESIGN
            await self._step_design(ctx)

            # Step 3: GENERATE
            await self._step_generate(ctx)

            # Step 4: SCAFFOLD
            await self._step_scaffold(ctx)

            # Step 5: OPTIMIZE
            await self._step_optimize(ctx)

            # Step 6: DEPLOY
            await self._step_deploy(ctx)

            # Step 7: VERIFY (with self-healing retry loop)
            await self._step_verify(ctx)

            # Step 8: FINALIZE
            return await self._step_finalize(ctx)

        except Exception as e:
            logger.error("Pipeline FAILED: %s", e)
            self._emit("pipeline", f"Pipeline failed: {e}")
            ctx.status = "failed"
            return PipelineResult(
                plan=ctx.plan,
                architecture=ctx.architecture,
                app={"files": ctx.files, "files_count": len(ctx.files)},
                preview_url=ctx.preview_url,
                status="failed",
                steps=[s.to_dict() for s in ctx.step_results],
                error=str(e),
                project_name=ctx.project_name,
            )

    async def improve_mvp(
        self,
        instruction: str,
        existing_files: List[Dict[str, str]],
        architecture: Dict[str, Any],
        sandbox_id: Optional[str] = None,
    ) -> PipelineResult:
        """
        Targeted refinement pipeline.
        Triggers Gemini/Claude for changes, then re-runs steps 3–8.
        """
        ctx = PipelineContext(
            idea=instruction,
            architecture=architecture,
            files=existing_files,
            sandbox_id=sandbox_id,
        )

        self._emit("pipeline", f"Starting improvement pipeline: {instruction[:80]}")

        try:
            # Use Gemini to enhance with the new instruction
            ctx.enhanced_files = existing_files  # Start with existing
            await self._step_optimize(ctx)

            # Re-deploy
            if ctx.sandbox_id:
                await self._step_deploy(ctx)
                await self._step_verify(ctx)

            return await self._step_finalize(ctx)

        except Exception as e:
            logger.error("Improve pipeline failed: %s", e)
            return PipelineResult(
                app={"files": ctx.files},
                status="failed",
                error=str(e),
            )

    # -----------------------------------------------------------------------
    # Pipeline Steps
    # -----------------------------------------------------------------------

    async def _step_analyze(self, ctx: PipelineContext):
        """Step 1: OpenAI generates structured PRD."""
        step = PipelineStep.ANALYZE
        self._emit(step, "Analyzing idea and generating PRD...")
        start = time.time()

        try:
            ctx.plan = await self.planner.execute(ctx.idea)
            ctx.project_name = ctx.plan.get("product_name", "My App")
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"product_name": ctx.project_name}))
            self._emit(step, f"PRD generated: {ctx.project_name}")
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error=str(e)))
            raise RuntimeError(f"Step ANALYZE failed: {e}") from e

    async def _step_design(self, ctx: PipelineContext):
        """Step 2: Claude refines architecture and validates logic."""
        step = PipelineStep.DESIGN
        self._emit(step, "Designing system architecture...")
        start = time.time()

        try:
            ctx.architecture = await self.architect.execute(ctx.plan)
            elapsed = int((time.time() - start) * 1000)
            tables = len(ctx.architecture.get("database_schema", []))
            endpoints = len(ctx.architecture.get("api_endpoints", []))
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"tables": tables, "endpoints": endpoints}))
            self._emit(step, f"Architecture designed: {tables} tables, {endpoints} endpoints")
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error=str(e)))
            raise RuntimeError(f"Step DESIGN failed: {e}") from e

    async def _step_generate(self, ctx: PipelineContext):
        """Step 3: Base44 synthesises the codebase."""
        step = PipelineStep.GENERATE
        self._emit(step, "Generating application codebase...")
        start = time.time()

        try:
            generated_files = await self.build_system.generate_codebase(ctx.architecture, ctx.plan)
            ctx.files = [{"path": f.path, "content": f.content, "language": f.language, "description": f.description} for f in generated_files]
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"files_generated": len(ctx.files)}))
            self._emit(step, f"Codebase generated: {len(ctx.files)} files")
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error=str(e)))
            raise RuntimeError(f"Step GENERATE failed: {e}") from e

    async def _step_scaffold(self, ctx: PipelineContext):
        """Step 4: Base44 initialises the project directory."""
        step = PipelineStep.SCAFFOLD
        self._emit(step, "Scaffolding project structure...")
        start = time.time()

        try:
            # Init project
            init_result = await self.build_system.init_project(ctx.project_name)

            # Assemble scaffold
            generated_files = [GeneratedFile(**f) for f in ctx.files]
            scaffold = await self.build_system.scaffold_project(ctx.project_name, generated_files, ctx.architecture)
            ctx.scaffold = scaffold.to_dict()
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"total_files": scaffold.total_files, "directory": init_result.get("directory")}))
            self._emit(step, f"Project scaffolded: {scaffold.total_files} files in {init_result.get('directory')}")
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error=str(e)))
            raise RuntimeError(f"Step SCAFFOLD failed: {e}") from e

    async def _step_optimize(self, ctx: PipelineContext):
        """Step 5: Gemini injects advanced features and performance patches."""
        step = PipelineStep.OPTIMIZE
        self._emit(step, "Optimizing with performance and security enhancements...")
        start = time.time()

        try:
            result = await self.enhancer.execute(ctx.files, ctx.architecture or {})
            enhanced = result.get("enhanced_files", [])
            report = result.get("optimization_report", {})

            # Merge enhanced files back
            if enhanced:
                enhanced_map = {f.get("path"): f for f in enhanced if isinstance(f, dict) and "path" in f}
                for i, original in enumerate(ctx.files):
                    path = original.get("path", "")
                    if path in enhanced_map:
                        ctx.files[i]["content"] = enhanced_map[path].get("content", original.get("content", ""))

            elapsed = int((time.time() - start) * 1000)
            perf_count = len(report.get("performance", []))
            sec_count = len(report.get("security", []))
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"performance_patches": perf_count, "security_patches": sec_count}))
            self._emit(step, f"Optimization complete: {perf_count} perf, {sec_count} security patches")
        except Exception as e:
            # Optimization is non-fatal
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.SKIPPED, duration_ms=elapsed, error=str(e)))
            self._emit(step, f"Optimization skipped (non-fatal): {e}")

    async def _step_deploy(self, ctx: PipelineContext):
        """Step 6: E2B provisions the sandbox and runs the app."""
        step = PipelineStep.DEPLOY
        self._emit(step, "Provisioning sandbox and deploying application...")
        start = time.time()

        try:
            # Create sandbox if needed
            if not ctx.sandbox_id:
                ctx.sandbox_id = await self.sandbox_service.create_sandbox()
                self._emit(step, f"Sandbox created: {ctx.sandbox_id}")

            # Deploy files to sandbox
            deploy_result = await self.sandbox_service.run_project(ctx.sandbox_id, ctx.files)

            if not deploy_result.get("success"):
                error = deploy_result.get("error", "Unknown deployment error")
                ctx.build_logs = error
                raise RuntimeError(f"Deployment failed: {error}")

            ctx.preview_url = deploy_result.get("preview_url", "")
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"preview_url": ctx.preview_url, "sandbox_id": ctx.sandbox_id}))
            self._emit(step, f"Deployed! Preview: {ctx.preview_url}")

        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error=str(e)))
            raise RuntimeError(f"Step DEPLOY failed: {e}") from e

    async def _step_verify(self, ctx: PipelineContext):
        """Step 7: Debug Agent intercepts failures, fixes code, and retries."""
        step = PipelineStep.VERIFY
        self._emit(step, "Verifying deployment and checking for errors...")
        start = time.time()

        if not ctx.sandbox_id:
            ctx.step_results.append(StepResult(step=step, status=StepStatus.SKIPPED, duration_ms=0, error="No sandbox to verify"))
            return

        try:
            # Capture logs from sandbox
            logs = await self.sandbox_service.capture_logs(ctx.sandbox_id)
            ctx.build_logs = logs

            # Check for errors in logs
            error_keywords = ["error", "exception", "failed", "cannot find", "ENOENT", "SyntaxError", "TypeError"]
            has_errors = any(kw.lower() in logs.lower() for kw in error_keywords)

            if not has_errors:
                elapsed = int((time.time() - start) * 1000)
                ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"verified": True, "retries": 0}))
                self._emit(step, "Deployment verified — no errors detected")
                return

            # Self-healing retry loop
            self._emit(step, "Errors detected — activating Debug Agent...")
            for attempt in range(1, DebugAgent.MAX_RETRIES + 1):
                self._emit(step, f"Debug attempt {attempt}/{DebugAgent.MAX_RETRIES}...")

                fix_result = await self.debug_agent.analyze_and_fix(logs, ctx.files, attempt)

                if fix_result.get("success") and fix_result.get("patches"):
                    # Apply patches
                    patches = fix_result["patches"]
                    patch_map = {p["path"]: p["content"] for p in patches if "path" in p and "content" in p}
                    for i, f in enumerate(ctx.files):
                        if f.get("path") in patch_map:
                            ctx.files[i]["content"] = patch_map[f["path"]]

                    self._emit(step, f"Applied {len(patches)} patches, re-deploying...")

                    # Re-deploy
                    deploy_result = await self.sandbox_service.run_project(ctx.sandbox_id, ctx.files)
                    if deploy_result.get("success"):
                        ctx.preview_url = deploy_result.get("preview_url", ctx.preview_url)

                        # Re-check logs
                        logs = await self.sandbox_service.capture_logs(ctx.sandbox_id)
                        has_errors = any(kw.lower() in logs.lower() for kw in error_keywords)
                        if not has_errors:
                            elapsed = int((time.time() - start) * 1000)
                            ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, duration_ms=elapsed, data={"verified": True, "retries": attempt}))
                            self._emit(step, f"Fixed on attempt {attempt} — deployment verified")
                            return

                # Small delay before retry
                await asyncio.sleep(2)

            # All retries exhausted
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.FAILED, duration_ms=elapsed, error="Max retries exhausted"))
            self._emit(step, "Debug Agent exhausted retries — build has warnings but may still function")

        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            ctx.step_results.append(StepResult(step=step, status=StepStatus.SKIPPED, duration_ms=elapsed, error=str(e)))
            self._emit(step, f"Verification skipped: {e}")

    async def _step_finalize(self, ctx: PipelineContext) -> PipelineResult:
        """Step 8: Return the live Preview URL and project state."""
        step = PipelineStep.FINALIZE
        self._emit(step, "Finalizing build...")

        ctx.status = "completed" if ctx.preview_url else "completed_no_preview"

        result = PipelineResult(
            plan=ctx.plan,
            architecture=ctx.architecture,
            app={
                "files": ctx.files,
                "files_count": len(ctx.files),
                "scaffold": ctx.scaffold,
            },
            preview_url=ctx.preview_url,
            status=ctx.status,
            steps=[s.to_dict() for s in ctx.step_results],
            project_name=ctx.project_name,
        )

        ctx.step_results.append(StepResult(step=step, status=StepStatus.COMPLETED, data={"preview_url": ctx.preview_url, "total_files": len(ctx.files)}))
        self._emit(step, f"Build complete! {len(ctx.files)} files. Preview: {ctx.preview_url or 'N/A'}")

        return result
