import asyncio
import sys
import os

# Ensure app is in path
sys.path.append(os.getcwd())

from app.services.idea_service import idea_service

async def test_discover():
    print("\n--- Testing DISCOVER Mode ---")
    ideas = await idea_service.generate_ideas(mode="discover")
    if not ideas:
        print("FAIL: No ideas returned")
        return
    
    print(f"Returned {len(ideas)} ideas.")
    first = ideas[0]
    print(f"Top Idea: {first.get('title')} (Conf: {first.get('confidence_score')})")
    
    # Check schema
    required = ["idea_id", "title", "problem", "confidence_score", "execution_complexity", "market_signal_evidence", "why_now"]
    for field in required:
        if field not in first:
            print(f"FAIL: Missing field {field}")
            return
    print("PASS: Schema looks correct.")
    print(f"Evidence: {first.get('market_signal_evidence')[:100]}...")
    print(f"Why Now: {first.get('why_now')[:100]}...")

async def test_validate():
    print("\n--- Testing VALIDATE Mode ---")
    user_input = "A social network for cat owners to share intense videos"
    ideas = await idea_service.generate_ideas(mode="validate_idea", user_input=user_input)
    
    if not ideas:
        print("FAIL: No ideas returned")
        return
    
    print(f"Returned {len(ideas)} ideas based on input: '{user_input}'")
    first = ideas[0]
    print(f"Top Idea: {first.get('title')} (Conf: {first.get('confidence_score')})")
    print("PASS: Validation flow produced output.")

async def main():
    await test_discover()
    await test_validate()

if __name__ == "__main__":
    asyncio.run(main())
