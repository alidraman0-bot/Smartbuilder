"""
Interpreter Service
Manages E2B code-interpreter sandboxes for deterministic data analysis and visualization.
"""

import logging
import os
import json
import asyncio
from typing import Dict, Any, Optional, List
from e2b_code_interpreter import Sandbox

logger = logging.getLogger(__name__)

class InterpreterService:
    def __init__(self):
        self.api_key = os.getenv("E2B_API_KEY")
        self.enabled = bool(self.api_key and self.api_key != "your_e2b_api_key")
        if not self.enabled:
            logger.warning("E2B_API_KEY not configured. InterpreterService will fall back to mock results.")

    async def run_analysis(self, code: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute analysis code in an E2B sandbox with provided data.
        """
        if not self.enabled:
            return self._mock_analysis(code, data)

        try:
            async with Sandbox(api_key=self.api_key) as sandbox:
                # 1. Inject data into the sandbox as a JSON file
                await sandbox.files.write("data.json", json.dumps(data))
                
                # 2. Execute the analyst code
                # The code should expect data.json and print its final result as JSON
                execution = await sandbox.run_code(code)
                
                if execution.error:
                    logger.error(f"E2B Execution Error: {execution.error.name} - {execution.error.value}")
                    return {"error": execution.error.value, "status": "failed"}

                # 3. Extract results (stdout or results)
                # We assume the code prints the final JSON result
                results_json = execution.text.strip()
                try:
                    analysis_results = json.loads(results_json)
                except json.JSONDecodeError:
                    analysis_results = {"raw_output": results_json, "status": "partial"}

                # 4. Handle Visualizations (if any images were generated)
                charts = []
                for result in execution.results:
                    if result.png:
                        charts.append({"type": "png", "data": result.png})
                    elif result.svg:
                        charts.append({"type": "svg", "data": result.svg})

                return {
                    "results": analysis_results,
                    "charts": charts,
                    "status": "success",
                    "execution_time": execution.logs.stdout # or other metric
                }

        except Exception as e:
            logger.error(f"Failed to run E2B analysis: {e}")
            return {"error": str(e), "status": "failed"}

    def _mock_analysis(self, code: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback mock for development without keys."""
        logger.info("Running mock E2B analysis")
        return {
            "results": {
                "verified_metrics": {
                    "tam": 12000000000,
                    "growth_rate_verified": "15.4%",
                    "analysis_note": "Deterministic verification skipped (Mock Mode)"
                }
            },
            "charts": [],
            "status": "mocked"
        }

interpreter_service = InterpreterService()
