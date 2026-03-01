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

        def _sync_analysis():
            sandbox = None
            try:
                # Based on diagnostics, Sandbox.create is synchronous in this environment
                sandbox = Sandbox.create(api_key=self.api_key)
                sandbox.files.write("data.json", json.dumps(data))
                execution = sandbox.run_code(code)
                
                # 3. Extract results (stdout or results)
                # We assume the code prints the final JSON result
                results_json = execution.text.strip() if execution.text else ""
                
                # If text is empty, check stdout
                if not results_json and execution.logs.stdout:
                    # Collect all stdout parts
                    results_json = "".join(execution.logs.stdout).strip()

                if execution.error:
                    return {"error": execution.error.value, "status": "failed"}

                try:
                    analysis_results = json.loads(results_json) if results_json else {"status": "empty"}
                except json.JSONDecodeError:
                    analysis_results = {"raw_output": results_json, "status": "partial"}

                charts = []
                for result in execution.results:
                    if hasattr(result, 'png') and result.png:
                        charts.append({"type": "png", "data": result.png})
                    elif hasattr(result, 'svg') and result.svg:
                        charts.append({"type": "svg", "data": result.svg})

                return {
                    "results": analysis_results,
                    "charts": charts,
                    "status": "success"
                }
            except Exception as e:
                logger.error(f"E2B Sync Analysis Error: {e}")
                raise e
            finally:
                if sandbox:
                    try:
                        sandbox.kill()
                    except:
                        pass

        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, _sync_analysis)
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
