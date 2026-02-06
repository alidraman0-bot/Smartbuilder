import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.fsm_service import fsm_service
from app.models.state import SystemState

async def simulate():
    print("=== STARTING FSM SIMULATION ===")
    
    # 1. Start Run
    print("\n[Step 1] Starting new run for 'AI SaaS Platform'...")
    result = await fsm_service.start_new_run("AI SaaS Platform")
    print(f"Result: {result}")
    
    current_state = fsm_service.orchestrator.get_state()
    print(f"Current State: {current_state}")
    
    # 2. Check for waiting approval
    print("\n[Step 2] Attempting to transition to BUILD without approval...")
    success = await fsm_service.orchestrator.transition_to(SystemState.MVP_BUILD)
    print(f"Transition Success: {success}")
    
    # 3. Approve Build
    print("\n[Step 3] Approving Build...")
    result = await fsm_service.approve_build()
    print(f"Approval Result: {result}")
    print(f"Current State: {fsm_service.orchestrator.get_state()}")
    
    # 4. Check Logs
    print("\n[Step 4] Recent Logs:")
    status = fsm_service.orchestrator.get_full_status()
    for log in status['logs'][-5:]:
        print(f"  {log['time']} [{log['module']}] {log['message']} ({log['type']})")

    # 5. Check History
    print("\n[Step 5] State History:")
    for record in status['history']:
        print(f"  {record['entered_at']} : {record['previous_state']} -> {record['current_state']}")

if __name__ == "__main__":
    asyncio.run(simulate())
