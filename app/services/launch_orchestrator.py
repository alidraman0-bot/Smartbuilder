import asyncio
import base64
import json
import logging
import os
import tempfile
from pathlib import Path
from typing import List

from app.services.framework_detector import detect_framework
from app.services.build_engine import BuildEngine
from app.services.deploy_engine import DeployEngine
from app.services.status_registry import add_status

logger = logging.getLogger(__name__)

class LaunchOrchestrator:
    """Orchestrates the full launch pipeline for an MVP bundle.

    Steps (simplified for MVP):
    1. Receive request payload (project files, env, db schema).
    2. Write files to a temporary workspace.
    3. Detect framework.
    4. Generate deployment config.
    5. Install dependencies & build.
    6. Deploy to primary provider.
    7. Store result URL and emit final status.
    """

    def __init__(self, launch_id: str):
        self.launch_id = launch_id
        self.workspace: Path | None = None
        self.framework: str | None = None
        self.deploy_url: str | None = None

    async def start_pipeline(self, request):
        """Entry point called by FastAPI background task.
        """
        try:
            await add_status(self.launch_id, "🛠️ Starting launch pipeline")
            # 1️⃣ Prepare temporary workspace
            self.workspace = Path(tempfile.mkdtemp(prefix="launch_"))
            await add_status(self.launch_id, f"📁 Workspace created at {self.workspace}")
            await self._write_files(request.files)
            await add_status(self.launch_id, "📂 Project files written")

            # 2️⃣ Detect framework
            await add_status(self.launch_id, "🔎 Detecting framework")
            self.framework = await detect_framework(self.workspace)
            await add_status(self.launch_id, f"✅ Detected framework: {self.framework}")

            # 3️⃣ Build
            await add_status(self.launch_id, "🚧 Building project")
            build_engine = BuildEngine(self.workspace, self.framework)
            await build_engine.install_dependencies()
            await add_status(self.launch_id, "📦 Dependencies installed")
            await build_engine.run_build()
            await add_status(self.launch_id, "⚙️ Build completed")

            # 4️⃣ Deploy
            await add_status(self.launch_id, "🚀 Deploying to provider")
            deploy_engine = DeployEngine(self.framework)
            self.deploy_url = await deploy_engine.deploy(self.workspace)
            await add_status(self.launch_id, f"✅ Deployment successful: {self.deploy_url}")

            await add_status(self.launch_id, "🏁 Launch pipeline finished")
        except Exception as exc:
            logger.exception("Launch pipeline failed for %s", self.launch_id)
            await add_status(self.launch_id, f"❌ Pipeline error: {exc}")
            # In a real system we would trigger AI auto‑fix here

    async def _write_files(self, files: List):
        """Decode base64 file contents and write them to the workspace."""
        for file in files:
            # file is a pydantic model with filename & content (base64)
            file_path = self.workspace / file.filename
            file_path.parent.mkdir(parents=True, exist_ok=True)
            decoded = base64.b64decode(file.content)
            file_path.write_bytes(decoded)
