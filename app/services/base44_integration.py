"""
Base44 Integration Service

Wrapper for Base44 API communication with mode-aware request schemas.
Handles real API integration with fallback to mock data if no key provided.
"""

from typing import Dict, Any, List, Optional
import asyncio
import os
import httpx
import logging
import json

logger = logging.getLogger(__name__)

class Base44Service:
    def __init__(self):
        self.api_key = os.getenv("BASE44_API_KEY")
        self.base_url = "https://api.base44.ai/v1"
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            },
            timeout=120.0  # Long timeout for code generation
        )
        
    async def generate_code(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate initial code from PRD
        """
        if not self.api_key or self.api_key == "your_base44_api_key":
            logger.warning("No VALID Base44 API key found. Using mock data.")
            return await self._mock_generate(request)
            
        try:
            response = await self.client.post("/generate", json=request)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Base44 API error (generate): {e}")
            raise

    async def iterate_code(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Iterate on existing code based on user prompt
        """
        if not self.api_key or self.api_key == "your_base44_api_key":
             return await self._mock_iterate(request)
            
        try:
            response = await self.client.post("/iterate", json=request)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Base44 API error (iterate): {e}")
            raise
    
    async def auto_fix(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Attempt to fix errors automatically
        """
        if not self.api_key or self.api_key == "your_base44_api_key":
             return await self._mock_autofix(request)

        try:
            response = await self.client.post("/auto-fix", json=request)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Base44 API error (auto-fix): {e}")
            raise

    # --- MOCKED IMPLEMENTATIONS (Fallback) ---
    
    async def _mock_generate(self, request: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(1.5)
        prd = request.get("prd", {})
        mode = request.get("mode", "UI")
        files = self._generate_mock_files(prd, mode)
        return {
            "files": files,
            "metadata": {"model": "base44-mock", "tokens_used": 0, "generation_time": 1.5}
        }

    async def _mock_iterate(self, request: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(1.0)
        existing_files = request.get("existing_files", [])
        modified_files = []
        if existing_files:
            modified_files.append(existing_files[0]["path"])
        return {
            "files": existing_files,
            "modified_files": modified_files,
            "metadata": {"model": "base44-mock", "tokens_used": 0}
        }

    async def _mock_autofix(self, request: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(0.5)
        return {
            "files": request.get("files", []),
            "fix_applied": True,
            "metadata": {"fix_type": "mock_fix"}
        }

    def _generate_mock_files(self, prd: Dict[str, Any], mode: str) -> List[Dict[str, Any]]:
        project_name = prd.get("title", "my-app").lower().replace(" ", "-")
        files = [
            {"path": "src/App.tsx", "content": self._get_mock_app_tsx(project_name), "type": "tsx"},
            {"path": "src/index.css", "content": self._get_mock_css(), "type": "css"},
            {"path": "package.json", "content": self._get_mock_package_json(project_name), "type": "json"}
        ]
        if mode == "Logic":
            files.append({"path": "src/api/index.ts", "content": "// API logic", "type": "ts"})
        elif mode == "Data":
            files.append({"path": "src/schema/models.ts", "content": "// Data models", "type": "ts"})
        return files
    
    def _get_mock_app_tsx(self, project_name: str) -> str:
        return f"""import React from 'react';
import './index.css';

function App() {{
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <h1 className="text-4xl text-white font-bold">{project_name}</h1>
    </div>
  );
}}
export default App;
"""
    
    def _get_mock_css(self) -> str:
        return "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
    
    def _get_mock_package_json(self, project_name: str) -> str:
        return f'{{\n  "name": "{project_name}",\n  "version": "0.1.0"\n}}'
