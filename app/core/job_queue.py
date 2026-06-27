"""
Async Job Queue — background pipeline execution for heavy AI workloads.

Uses FastAPI-native asyncio for immediate local development. Designed to
be swapped for Celery/Redis-backed workers in production with zero code
changes to callers.

Usage:
    from app.core.job_queue import job_queue

    job_id = await job_queue.enqueue("investment_brief", payload)
    status = job_queue.get_status(job_id)
"""

import asyncio
import logging
import traceback
import uuid
import time
from enum import Enum
from typing import Any, Callable, Coroutine, Dict, Optional

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Job:
    """Represents a single queued task."""

    def __init__(self, job_id: str, task_name: str, payload: Dict[str, Any]):
        self.id = job_id
        self.task_name = task_name
        self.payload = payload
        self.status = JobStatus.QUEUED
        self.result: Any = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.started_at: Optional[float] = None
        self.completed_at: Optional[float] = None
        self.progress: float = 0.0

    def to_dict(self) -> dict:
        return {
            "job_id": self.id,
            "task": self.task_name,
            "status": self.status.value,
            "progress": self.progress,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "duration_seconds": (
                round((self.completed_at or time.time()) - self.started_at, 2)
                if self.started_at
                else None
            ),
        }


class JobQueue:
    """
    In-process async job queue backed by asyncio.

    Production upgrade path:
      - Replace _workers with Celery tasks
      - Replace _jobs dict with Redis hash
      - Keep the same public API
    """

    def __init__(self, max_concurrent: int = 3):
        self._jobs: Dict[str, Job] = {}
        self._handlers: Dict[str, Callable[..., Coroutine]] = {}
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._max_jobs_history = 200  # Keep last N jobs in memory

    # ------------------------------------------------------------------
    # Handler registration
    # ------------------------------------------------------------------
    def register(self, task_name: str, handler: Callable[..., Coroutine]):
        """
        Register an async handler for a task type.
        The handler receives (job, **payload) and should return a result dict.
        """
        self._handlers[task_name] = handler
        logger.info(f"JobQueue: Registered handler for '{task_name}'")

    # ------------------------------------------------------------------
    # Enqueue
    # ------------------------------------------------------------------
    async def enqueue(
        self,
        task_name: str,
        payload: Dict[str, Any],
        job_id: Optional[str] = None,
    ) -> str:
        """
        Submit a job to the queue.  Returns a job_id immediately.
        The actual work runs in the background via asyncio.create_task.
        """
        if task_name not in self._handlers:
            raise ValueError(f"No handler registered for task: {task_name}")

        jid = job_id or f"job_{uuid.uuid4().hex[:12]}"
        job = Job(jid, task_name, payload)
        self._jobs[jid] = job

        # Evict oldest jobs if history is too large
        if len(self._jobs) > self._max_jobs_history:
            oldest = sorted(
                self._jobs.values(), key=lambda j: j.created_at
            )[: len(self._jobs) - self._max_jobs_history]
            for old_job in oldest:
                if old_job.status in (JobStatus.COMPLETED, JobStatus.FAILED):
                    self._jobs.pop(old_job.id, None)

        logger.info(f"JobQueue: Enqueued {task_name} → {jid}")
        asyncio.create_task(self._run(job))
        return jid

    # ------------------------------------------------------------------
    # Worker execution
    # ------------------------------------------------------------------
    async def _run(self, job: Job):
        """Execute a job with concurrency control."""
        async with self._semaphore:
            job.status = JobStatus.RUNNING
            job.started_at = time.time()
            handler = self._handlers[job.task_name]
            try:
                result = await handler(job, **job.payload)
                job.result = result
                job.status = JobStatus.COMPLETED
                job.progress = 1.0
                logger.info(
                    f"JobQueue: {job.task_name} [{job.id}] completed in "
                    f"{time.time() - job.started_at:.1f}s"
                )
            except Exception as e:
                job.status = JobStatus.FAILED
                job.error = str(e)
                logger.error(
                    f"JobQueue: {job.task_name} [{job.id}] FAILED: {e}\n"
                    f"{traceback.format_exc()}"
                )
            finally:
                job.completed_at = time.time()

    # ------------------------------------------------------------------
    # Status queries
    # ------------------------------------------------------------------
    def get_status(self, job_id: str) -> Optional[dict]:
        """Get status of a specific job."""
        job = self._jobs.get(job_id)
        return job.to_dict() if job else None

    def get_result(self, job_id: str) -> Any:
        """Get the result of a completed job. Returns None if not done."""
        job = self._jobs.get(job_id)
        if not job or job.status != JobStatus.COMPLETED:
            return None
        return job.result

    def list_jobs(self, status: Optional[str] = None, limit: int = 20) -> list:
        """List recent jobs, optionally filtered by status."""
        jobs = sorted(self._jobs.values(), key=lambda j: j.created_at, reverse=True)
        if status:
            jobs = [j for j in jobs if j.status.value == status]
        return [j.to_dict() for j in jobs[:limit]]

    def get_queue_stats(self) -> dict:
        """Return queue health metrics."""
        statuses = {}
        for j in self._jobs.values():
            statuses[j.status.value] = statuses.get(j.status.value, 0) + 1
        return {
            "total_jobs": len(self._jobs),
            "by_status": statuses,
            "max_concurrent": self._semaphore._value,
        }


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
job_queue = JobQueue(max_concurrent=3)
