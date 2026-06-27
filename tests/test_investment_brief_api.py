# import pytest
from fastapi.testclient import TestClient
from app.main import app
import json

client = TestClient(app)

def test_idea_details_basic():
    """
    Test the /api/idea-details endpoint with basic mode.
    """
    payload = {
        "idea": {
            "id": "test-uuid-123",
            "title": "AI-Powered CRM for Small Businesses",
            "problem": "Generic CRMs are too complex and expensive for 1-5 person teams.",
            "solution": "A simplified, voice-first CRM that automates data entry via AI."
        },
        "mode": "basic"
    }
    
    response = client.post("/api/idea-details", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify strict JSON structure
    assert "title" in data
    assert "confidence_score" in data
    assert "market_size" in data
    assert "complexity" in data
    assert "problem" in data
    assert "target_customers" in data
    assert "monetization" in data
    assert "why_now" in data
    assert "market_gaps_today" in data
    assert "mvp_scope" in data
    assert "why_smartbuilder_confident" in data
    assert "risks_to_validate" in data
    
    # Verify sub-structures
    assert "estimate" in data["market_size"]
    assert "range" in data["market_size"]
    assert "score" in data["complexity"]
    assert "level" in data["complexity"]
    assert len(data["problem"]["pain_points"]) >= 0
    assert "primary" in data["target_customers"]
    
    print(f"Basic Brief Title: {data['title']}")
    print(f"Confidence Score: {data['confidence_score']}")

# @pytest.mark.asyncio
async def test_idea_details_deep():
    """
    Test the /api/idea-details endpoint with deep mode.
    """
    payload = {
        "idea": {
            "id": "test-uuid-deep",
            "title": "Decentralized Energy Trading Platform",
            "problem": "Homeowners with solar panels can't easily sell excess energy to neighbors.",
            "solution": "A blockchain-based P2P energy marketplace."
        },
        "mode": "deep"
    }
    
    response = client.post("/api/idea-details", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["confidence_score"] >= 0
    assert len(data["why_smartbuilder_confident"]["signals_used"]) >= 0
    
    print(f"Deep Brief Title: {data['title']}")

if __name__ == "__main__":
    import asyncio
    
    print("Running Basic Test...")
    test_idea_details_basic()
    
    print("\nRunning Deep Test...")
    asyncio.run(test_idea_details_deep())
