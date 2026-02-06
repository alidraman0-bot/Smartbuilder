import asyncio
import json
import httpx
import time

async def verify_flow():
    base_url = "http://localhost:8000"
    
    print("\n--- Testing BP & PRD Generation Flow ---")
    
    # 1. Get current status to find active run
    status_res = httpx.get(f"{base_url}/api/v1/run/status")
    if status_res.status_code != 200:
        print("Failed to get system status.")
        return
    
    status_data = status_res.json()
    run_id = status_data.get("runId")
    state = status_data.get("state")
    
    print(f"Current Run ID: {run_id}")
    print(f"Current State: {state}")
    
    # 2. Simulate Research Approval (if in RESEARCH state)
    if state == "RESEARCH":
        print("Submitting APPROVE decision for Research...")
        decision_res = httpx.post(
            f"{base_url}/api/v1/research/decision",
            json={"run_id": run_id, "decision": "APPROVE"}
        )
        print(f"Decision Status: {decision_res.status_code}")
        print(f"Decision Response: {decision_res.json()}")
        
        # Wait for state transition
        time.sleep(2)
    
    # 3. Poll for BP & PRD data
    print("Polling for BP & PRD data (this should take 20-40 seconds)...")
    start_time = time.time()
    for _ in range(30): # Poll for 60 seconds
        poll_res = httpx.get(f"{base_url}/api/v1/run/status")
        poll_data = poll_res.json()
        
        bp = poll_data.get("business_plan")
        prd = poll_data.get("prd")
        current_state = poll_data.get("state")
        
        print(f"[{int(time.time() - start_time)}s] State: {current_state} | BP: {'OK' if bp else '...'} | PRD: {'OK' if prd else '...'}")
        
        if bp and prd:
            print("\nSUCCESS: BP & PRD generated in background!")
            return
        
        if current_state == "FAILED":
            print(f"ERROR: Run failed. Logs: {poll_data.get('logs')[-1]}")
            return
            
        time.sleep(2)
    
    print("\nTIMEOUT: BP & PRD not generated within 60 seconds.")

if __name__ == "__main__":
    asyncio.run(verify_flow())
