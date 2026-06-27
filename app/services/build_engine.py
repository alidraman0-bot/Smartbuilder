import asyncio
import subprocess
from pathlib import Path
import logging
import os

logger = logging.getLogger(__name__)

class BuildEngine:
    """Handles dependency installation and build for a given framework.

    This simplified version supports npm/yarn for JavaScript frameworks and pip for Python.
    """

    def __init__(self, workspace: Path, framework: str):
        self.workspace = workspace
        self.framework = framework
        self.env = {"PATH": str(self.workspace / "node_modules" / ".bin") + ":" + os.environ.get("PATH", "")}

    async def _run_cmd(self, cmd: list[str], cwd: Path | None = None):
        cwd = cwd or self.workspace
        logger.info("Running command: %s in %s", " ".join(cmd), cwd)
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=cwd,
            env=self.env,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(f"Command {' '.join(cmd)} failed: {stderr.decode()}")
        logger.debug("Command output: %s", stdout.decode())
        return stdout.decode()

    async def install_dependencies(self):
        """Install deps based on detected framework.
        """
        if self.framework in {"nextjs", "react", "vue", "nuxt", "express"}:
            # Prefer npm if lockfile exists, otherwise yarn
            if (self.workspace / "package-lock.json").exists():
                await self._run_cmd(["npm", "ci"])
            elif (self.workspace / "yarn.lock").exists():
                await self._run_cmd(["yarn", "install", "--frozen-lockfile"])
            else:
                await self._run_cmd(["npm", "install"])
        elif self.framework in {"django", "fastapi", "flask"}:
            # Use pip if requirements.txt exists
            if (self.workspace / "requirements.txt").exists():
                await self._run_cmd(["python", "-m", "pip", "install", "-r", "requirements.txt"])
        else:
            logger.info("No dependency install step for framework %s", self.framework)

    async def run_build(self):
        """Run the build command appropriate for the framework.
        """
        if self.framework == "nextjs":
            await self._run_cmd(["npm", "run", "build"])
        elif self.framework in {"react", "vue", "nuxt"}:
            await self._run_cmd(["npm", "run", "build"])
        elif self.framework in {"django", "fastapi", "flask"}:
            # Python apps often don't need a build step; create a placeholder artifact
            logger.info("Python framework detected – skipping build step (source ready for deployment)")
        else:
            logger.info("Unknown framework %s – skipping build", self.framework)
