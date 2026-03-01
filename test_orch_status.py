import sys
import os
import time

# Add root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.core.orchestrator import Orchestrator
from app.models.state import SystemState

def test_status_serialization():
    orch = Orchestrator()
    print(f"Initial state: {orch.state}")
    
    # Test 1: IDLE state
    try:
        status = orch.get_full_status()
        print("IDLE status: OK")
    except Exception as e:
        print(f"IDLE status: FAILED - {e}")
        import traceback
        traceback.print_exc()

    # Test 2: After transition to RESEARCH
    orch.state = SystemState.RESEARCH
    orch.context["research"] = {
        "market_size": {"estimate": "$10B", "confidence": 90},
        "competition": [{"name": "Comp1", "weakness": "Slow"}],
        "validation_score": 85,
        "modules": [
            {"module": "Market", "summary": "Big", "confidence_score": 90, "signals": [], "risks": []}
        ]
    }
    
    try:
        status = orch.get_full_status()
        print("RESEARCH status: OK")
    except Exception as e:
        print(f"RESEARCH status: FAILED - {e}")
        import traceback
        traceback.print_exc()

    # Test 3: History conversion
    orch._record_transition(SystemState.IDLE, SystemState.IDEA_GENERATION)
    orch._record_transition(SystemState.IDEA_GENERATION, SystemState.RESEARCH)
    
    try:
        status = orch.get_full_status()
        print("History status: OK")
        # Check if history is dict-serializable
        import json
        json.dumps(status)
        print("JSON Serialization: OK")
    except Exception as e:
        print(f"History/JSON status: FAILED - {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_status_serialization()
