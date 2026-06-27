"""
Sandbox Service

Manages live preview sandboxes for MVP Builder.
Supports E2B cloud sandboxes for secure, scalable previews.
Falls back to local mock implementation if E2B is not configured.
"""

from typing import Optional, List, Dict, Any
import asyncio
import uuid
import os
import logging
import json

logger = logging.getLogger(__name__)

# Try to import E2B
try:
    from e2b import Sandbox
    E2B_AVAILABLE = True
except ImportError:
    E2B_AVAILABLE = False
    logger.warning("E2B package not installed. Sandbox will use local mock.")

class SandboxService:
    def __init__(self):
        self.sandboxes: Dict[str, Any] = {}
        self.api_key = os.getenv("E2B_API_KEY")
        self.use_e2b = E2B_AVAILABLE and self.api_key and self.api_key != "your_e2b_api_key"
        
    async def create_sandbox(self) -> str:
        """Create a new sandbox environment"""
        if self.use_e2b:
            return await self._create_e2b_sandbox()
        else:
            return await self._create_local_sandbox()
    
    async def _create_e2b_sandbox(self, template: str = "base") -> str:
        """
        Feature 2: Enhanced Web Sandboxes
        Uses specialized E2B templates for production-grade previews.
        """
        try:
            loop = asyncio.get_event_loop()
            # Defaulting to nextjs for smartbuilder MVPs
            sandbox = await loop.run_in_executor(None, lambda: Sandbox.create(template=template))
            self.sandboxes[sandbox.id] = {
                "type": "e2b",
                "instance": sandbox,
                "template": template,
                "status": "ready",
                "files_synced": False
            }
            logger.info(f"Created Enhanced E2B sandbox ({template}): {sandbox.id}")
            return sandbox.id
        except Exception as e:
            logger.error(f"Failed to create E2B sandbox: {e}")
            logger.info("Falling back to local sandbox")
            return await self._create_local_sandbox()

    async def _create_local_sandbox(self) -> str:
        sandbox_id = str(uuid.uuid4())
        await asyncio.sleep(0.3)
        self.sandboxes[sandbox_id] = {
            "type": "local",
            "id": sandbox_id,
            "status": "ready",
            "port": 3000
        }
        return sandbox_id
    
    async def start_preview(self, sandbox_id: str) -> str:
        """Start preview server and return URL"""
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            raise ValueError(f"Sandbox {sandbox_id} not found")
        
        if sandbox_data["type"] == "e2b":
            return await self._start_e2b_preview(sandbox_data)
        else:
            return await self._start_local_preview(sandbox_data)
            
    async def _start_e2b_preview(self, sandbox_data: Dict[str, Any]) -> str:
        sandbox = sandbox_data["instance"]
        loop = asyncio.get_event_loop()
        
        # 1. Start dev server (if not already running)
        # We assume files are already hot-reloaded/written
        # For simplicity, we just return the URL for port 3000
        
        # Ensure we have a start command running? 
        # Typically we run 'npm install && npm run dev'
        # But we only do this once or if files changed?
        
        try:
            # We assume port 3000 is open
            url = sandbox.get_hostname(port=3000)
            return f"https://{url}"
        except Exception as e:
            logger.error(f"Error getting E2B URL: {e}")
            raise

    async def _start_local_preview(self, sandbox_data: Dict[str, Any]) -> str:
        await asyncio.sleep(0.2)
        return f"http://localhost:{sandbox_data['port']}/mock-preview"

    def get_hostname_url(self, sandbox_id: str) -> Optional[str]:
        """Return the preview URL for a sandbox (non-async, for UI updates)"""
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            return None
        
        if sandbox_data["type"] == "e2b":
            try:
                # Predictive URL based on sandbox instance
                url = sandbox_data["instance"].get_hostname(port=3000)
                return f"https://{url}"
            except:
                return None
        else:
            return f"http://localhost:{sandbox_data.get('port', 3000)}/mock-preview"
    
    async def hot_reload(self, sandbox_id: str, files: List[Dict[str, Any]]):
        """Hot reload preview with new files"""
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            raise ValueError(f"Sandbox {sandbox_id} not found")
            
        if sandbox_data["type"] == "e2b":
            await self._update_e2b_files(sandbox_data, files)
        else:
            # Local mock update
            sandbox_data["files"] = files
            await asyncio.sleep(0.1)

    async def _update_e2b_files(self, sandbox_data: Dict[str, Any], files: List[Dict[str, Any]]):
        sandbox = sandbox_data["instance"]
        loop = asyncio.get_event_loop()
        
        # Write files to sandbox
        # Optimize by only writing changed files? For now write all.
        def write_files():
            for file in files:
                # Ensure directory exists
                dir_path = os.path.dirname(file["path"])
                if dir_path and dir_path != ".":
                    sandbox.filesystem.make_dir(dir_path) # basic implementation
                
                sandbox.filesystem.write(file["path"], file["content"])
                
            # If this is first sync, maybe run install?
            if not sandbox_data["files_synced"]:
                sandbox.process.start("npm install > /tmp/build.log 2>&1 && npm run dev >> /tmp/build.log 2>&1", background=True)
                sandbox_data["files_synced"] = True
                
        await loop.run_in_executor(None, write_files)

    async def run_project(self, sandbox_id: str, files: list) -> Dict[str, Any]:
        """
        Full project deployment:
        1. Write all files
        2. npm install
        3. npm run dev
        4. Return preview URL or error logs
        """
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            raise ValueError(f"Sandbox {sandbox_id} not found")

        # Write files
        await self.hot_reload(sandbox_id, files)

        if sandbox_data["type"] == "e2b":
            sandbox = sandbox_data["instance"]
            loop = asyncio.get_event_loop()

            try:
                # Prepare Base44 environment variables
                base44_env = {
                    "NEXT_PUBLIC_BASE44_APP_ID": os.getenv("BASE44_APP_ID", "demo-app-id"),
                    "BASE44_API_KEY": os.getenv("BASE44_API_KEY", "demo-api-key"),
                }

                def install_and_run():
                    install_result = sandbox.process.start_and_wait("npm install > /tmp/build.log 2>&1", timeout=120)
                    if install_result.exit_code != 0:
                        return {"success": False, "error": install_result.stderr, "phase": "install"}

                    # Execute Base44 CLI to push schema and auth configs
                    logger.info("Base44: Pushing entities and auth schema via CLI")
                    sandbox.process.start_and_wait("npx base44@latest entities push >> /tmp/build.log 2>&1", env=base44_env)
                    sandbox.process.start_and_wait("npx base44@latest auth push >> /tmp/build.log 2>&1", env=base44_env)
                    
                    # Start dev server in background
                    sandbox.process.start("npm run dev >> /tmp/build.log 2>&1", env=base44_env, background=True)
                    return {"success": True}

                result = await loop.run_in_executor(None, install_and_run)
                
                if not result["success"]:
                    return {
                        "success": False,
                        "error": result.get("error", "Unknown error"),
                        "phase": result.get("phase", "unknown"),
                    }

                # Get preview URL
                url = sandbox.get_hostname(port=3000)
                return {
                    "success": True,
                    "preview_url": f"https://{url}",
                }

            except Exception as e:
                logger.error(f"Run project failed: {e}")
                return {"success": False, "error": str(e), "phase": "runtime"}
        else:
            # Local mock
            await asyncio.sleep(1)
            return {
                "success": True,
                "preview_url": f"http://localhost:{sandbox_data.get('port', 3000)}/mock-preview",
            }

    async def restart_project(self, sandbox_id: str) -> Dict[str, Any]:
        """Phase 6: Restart the running dev server in the sandbox."""
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            return {"success": False, "error": f"Sandbox {sandbox_id} not found locally"}

        if sandbox_data["type"] == "e2b":
            sandbox = sandbox_data["instance"]
            loop = asyncio.get_event_loop()

            try:
                def kill_and_restart():
                    # Prepare Base44 environment variables
                    base44_env = {
                        "NEXT_PUBLIC_BASE44_APP_ID": os.getenv("BASE44_APP_ID", "demo-app-id"),
                        "BASE44_API_KEY": os.getenv("BASE44_API_KEY", "demo-api-key"),
                    }
                    # Kill existing node processes
                    sandbox.process.start_and_wait("pkill node")
                    # Restart server
                    sandbox.process.start("npm run dev >> /tmp/build.log 2>&1", env=base44_env, background=True)
                    return True

                await loop.run_in_executor(None, kill_and_restart)
                url = sandbox.get_hostname(port=3000)
                return {
                    "success": True,
                    "preview_url": f"https://{url}"
                }
            except Exception as e:
                logger.error(f"Restart failed: {e}")
                return {"success": False, "error": str(e)}
        else:
            await asyncio.sleep(0.5)
            return {"success": True, "preview_url": f"http://localhost:{sandbox_data.get('port', 3000)}/mock-preview"}

    async def capture_logs(self, sandbox_id: str) -> str:
        """Capture stdout/stderr logs from sandbox for error diagnosis."""
        sandbox_data = self.sandboxes.get(sandbox_id)
        if not sandbox_data:
            return "Sandbox not found"

        if sandbox_data["type"] == "e2b":
            sandbox = sandbox_data["instance"]
            try:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, lambda: sandbox.process.start_and_wait("tail -100 /tmp/build.log 2>&1 || echo 'No logs'", timeout=10)
                )
                return result.stdout or result.stderr or "No output"
            except Exception as e:
                return f"Log capture failed: {e}"
        else:
            return "Local sandbox - no logs available"

    async def destroy_sandbox(self, sandbox_id: str):
        """Destroy sandbox and cleanup resources"""
        if sandbox_id in self.sandboxes:
            sandbox_data = self.sandboxes[sandbox_id]
            if sandbox_data["type"] == "e2b":
                try:
                    sandbox_data["instance"].close()
                except:
                    pass
            del self.sandboxes[sandbox_id]
