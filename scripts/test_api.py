import requests
import json

def test_api():
    base_url = "http://localhost:8000/api/v1"
    
    # Check current instance
    debug_resp = requests.get(f"{base_url}/ideas/debug/history")
    instance_id = debug_resp.json().get("instance_id")
    print(f"Initial Backend Instance: {instance_id}")

    print("--- Step 1: Generating Ideas ---")
    try:
        resp = requests.post(f"{base_url}/ideas/generate", json={"mode": "discover"})
        print(f"Generation Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            ideas = data.get("ideas", [])
            print(f"Success! Generated {len(ideas)} ideas.")
            
            # Check instance again
            debug_resp = requests.get(f"{base_url}/ideas/debug/history")
            new_instance_id = debug_resp.json().get("instance_id")
            history_count = debug_resp.json().get("history_count")
            print(f"Post-Generation Instance: {new_instance_id} (History Count: {history_count})")

            if instance_id != new_instance_id:
                print("⚠️  Warning: Backend reloaded between requests!")

            if not ideas:
                print("Error: No ideas returned.")
                return

            selected_idea = ideas[0]
            idea_id = selected_idea.get("idea_id")
            title = selected_idea.get("title")
            print(f"Selected Idea: {title} (ID: {idea_id})")
            
            print("\n--- Step 2: Promoting Idea ---")
            promote_resp = requests.post(f"{base_url}/ideas/promote", json={"idea_id": idea_id})
            print(f"Promotion Status: {promote_resp.status_code}")
            print(f"Promotion Result: {promote_resp.text}")
            
            if promote_resp.status_code == 200:
                print("\n✅ Full promotion flow verified.")
            else:
                print("\n❌ Promotion failed.")
        else:
            print(f"Failed to generate ideas: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Error connecting to API: {e}")

if __name__ == "__main__":
    test_api()
