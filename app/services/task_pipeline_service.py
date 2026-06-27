"""
Task Pipeline Service

Breaks a build plan into sequential tasks and manages execution.
Tasks flow: architecture → database → backend → frontend → integration → run

Each task has a lifecycle: pending → running → complete | failed
All state is persisted to Supabase build_tasks table.
"""

import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum
from app.core.supabase import get_service_client

logger = logging.getLogger(__name__)


class TaskType(str, Enum):
    ARCHITECTURE = "architecture"
    DATABASE = "database"
    BACKEND = "backend"
    FRONTEND = "frontend"
    INTEGRATION = "integration"
    RUN = "run"


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


# Ordered task sequence
TASK_SEQUENCE = [
    TaskType.ARCHITECTURE,
    TaskType.DATABASE,
    TaskType.BACKEND,
    TaskType.FRONTEND,
    TaskType.INTEGRATION,
    TaskType.RUN,
]

# Human-readable step labels for UI
TASK_LABELS = {
    TaskType.ARCHITECTURE: "Designing architecture",
    TaskType.DATABASE: "Building database",
    TaskType.BACKEND: "Generating backend",
    TaskType.FRONTEND: "Creating UI",
    TaskType.INTEGRATION: "Wiring integrations",
    TaskType.RUN: "Launching preview",
}


class BuildTask:
    """In-memory task representation."""
    def __init__(self, task_id: str, project_id: str, build_plan_id: str,
                 task_type: TaskType, task_order: int):
        self.task_id = task_id
        self.project_id = project_id
        self.build_plan_id = build_plan_id
        self.task_type = task_type
        self.task_order = task_order
        self.status = TaskStatus.PENDING
        self.result: Optional[Dict[str, Any]] = None
        self.error_log: Optional[str] = None
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "project_id": self.project_id,
            "build_plan_id": self.build_plan_id,
            "task_type": self.task_type.value,
            "task_order": self.task_order,
            "status": self.status.value,
            "label": TASK_LABELS.get(self.task_type, self.task_type.value),
            "result": self.result,
            "error_log": self.error_log,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }


class TaskPipelineService:
    def __init__(self):
        self.supabase = get_service_client()
        self.pipelines: Dict[str, List[BuildTask]] = {}  # build_plan_id -> tasks

    def create_pipeline(self, project_id: str, build_plan_id: str) -> List[BuildTask]:
        """Create the full task pipeline for a build."""
        tasks = []
        for order, task_type in enumerate(TASK_SEQUENCE):
            task = BuildTask(
                task_id=str(uuid.uuid4()),
                project_id=project_id,
                build_plan_id=build_plan_id,
                task_type=task_type,
                task_order=order,
            )
            tasks.append(task)

        self.pipelines[build_plan_id] = tasks

        # Persist all tasks
        self._persist_tasks(tasks)

        logger.info(f"Created pipeline with {len(tasks)} tasks for build {build_plan_id}")
        return tasks

    def get_pipeline(self, build_plan_id: str) -> List[BuildTask]:
        """Get all tasks for a build."""
        return self.pipelines.get(build_plan_id, [])

    def get_next_task(self, build_plan_id: str) -> Optional[BuildTask]:
        """Get the next pending task."""
        tasks = self.get_pipeline(build_plan_id)
        for task in tasks:
            if task.status == TaskStatus.PENDING:
                return task
        return None

    def get_current_task(self, build_plan_id: str) -> Optional[BuildTask]:
        """Get the currently running task."""
        tasks = self.get_pipeline(build_plan_id)
        for task in tasks:
            if task.status == TaskStatus.RUNNING:
                return task
        return None

    def mark_running(self, task: BuildTask):
        """Transition task to running state."""
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.utcnow()
        self._update_task(task)
        self._log(task, f"Started: {TASK_LABELS.get(task.task_type, task.task_type.value)}")

    def mark_complete(self, task: BuildTask, result: Dict[str, Any] = None):
        """Transition task to complete state."""
        task.status = TaskStatus.COMPLETE
        task.completed_at = datetime.utcnow()
        task.result = result
        self._update_task(task)
        self._log(task, f"Completed: {TASK_LABELS.get(task.task_type, task.task_type.value)}", "success")

    def mark_failed(self, task: BuildTask, error: str):
        """Transition task to failed state."""
        task.status = TaskStatus.FAILED
        task.completed_at = datetime.utcnow()
        task.error_log = error
        self._update_task(task)
        self._log(task, f"Failed: {error}", "error")

    def get_progress(self, build_plan_id: str) -> Dict[str, Any]:
        """Get overall pipeline progress."""
        tasks = self.get_pipeline(build_plan_id)
        if not tasks:
            return {"total": 0, "completed": 0, "percentage": 0, "current_step": None}

        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETE)
        current = next((t for t in tasks if t.status == TaskStatus.RUNNING), None)
        failed = next((t for t in tasks if t.status == TaskStatus.FAILED), None)

        return {
            "total": len(tasks),
            "completed": completed,
            "percentage": int((completed / len(tasks)) * 100),
            "current_step": current.to_dict() if current else None,
            "failed_step": failed.to_dict() if failed else None,
            "steps": [t.to_dict() for t in tasks],
        }

    def is_complete(self, build_plan_id: str) -> bool:
        """Check if all tasks are done."""
        tasks = self.get_pipeline(build_plan_id)
        return all(t.status == TaskStatus.COMPLETE for t in tasks)

    def has_failed(self, build_plan_id: str) -> bool:
        """Check if any task has failed."""
        tasks = self.get_pipeline(build_plan_id)
        return any(t.status == TaskStatus.FAILED for t in tasks)

    # --- Persistence ---

    def _persist_tasks(self, tasks: List[BuildTask]):
        """Save all tasks to DB."""
        try:
            records = []
            for task in tasks:
                records.append({
                    "id": task.task_id,
                    "project_id": task.project_id,
                    "build_plan_id": task.build_plan_id,
                    "task_type": task.task_type.value,
                    "task_order": task.task_order,
                    "status": task.status.value,
                })
            self.supabase.table("build_tasks").insert(records).execute()
        except Exception as e:
            logger.error(f"Failed to persist tasks: {e}")

    def _update_task(self, task: BuildTask):
        """Update a single task in DB."""
        try:
            data = {
                "status": task.status.value,
                "result": task.result,
                "error_log": task.error_log,
                "started_at": task.started_at.isoformat() if task.started_at else None,
                "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            }
            self.supabase.table("build_tasks").update(data).eq("id", task.task_id).execute()
        except Exception as e:
            logger.error(f"Failed to update task {task.task_id}: {e}")

    def _log(self, task: BuildTask, message: str, level: str = "info"):
        """Add a log entry for a task."""
        try:
            self.supabase.table("build_logs").insert({
                "task_id": task.task_id,
                "build_plan_id": task.build_plan_id,
                "message": message,
                "level": level,
            }).execute()
        except Exception as e:
            logger.error(f"Failed to log: {e}")
