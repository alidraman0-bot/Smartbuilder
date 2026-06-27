import asyncio
import os
import sys
import json
from unittest.mock import patch, MagicMock

# Set PYTHONPATH to include the current directory
sys.path.append(os.getcwd())

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Mock response data that matches InvestmentBriefResponse
mock_brief_json = {
    "title": "SmartCRM: AI-First Simplified CRM",
    "confidence_score": 85.5,
    "market_size": {
        "estimate": "$2.5 Billion",
        "range": "$1B - $5B",
        "source_logic": "Aggregated from SMB SaaS growth trends in 2024."
    },
    "complexity": {
        "score": 4.5,
        "level": "medium",
        "reason": "Requires robust NLP for voice-to-data mapping but leverages existing LLMs."
    },
    "problem": {
        "summary": "Existing CRMs like Salesforce are overkill for solopreneurs.",
        "pain_points": ["Manual data entry", "High cost", "Steep learning curve"]
    },
    "target_customers": {
        "primary": "Solopreneurs and 1-5 person agencies",
        "secondary": ["Real estate agents", "Freelance consultants"],
        "geography": "Global, focused on North America and Europe"
    },
    "monetization": {
        "model": "Freemium SaaS",
        "pricing_examples": ["$19/mo per seat"],
        "revenue_streams": ["Monthly subscriptions", "Premium AI feature add-ons"]
    },
    "why_now": {
        "summary": "AI tools have reached maturity for accurate voice transcription and intent extraction.",
        "trends": ["Fractional workforce expansion", "Generative AI in productivity"],
        "timing_reason": "Low-cost LLMs make this affordable now."
    },
    "market_gaps_today": ["No current CRM is truly voice-first", "Automated entry is still buggy in legacy tools"],
    "mvp_scope": {
        "core_features": ["Voice note capture", "Auto-contact creation", "Simple funnel"],
        "tech_stack": ["Next.js", "Supabase", "Whisper API"],
        "build_time_estimate": "3 weeks"
    },
    "why_smartbuilder_confident": {
        "signals_used": ["Reddit pain points", "G2 reviews of competitors"],
        "data_points": ["45% increase in 'simple CRM' searches"],
        "reasoning": "Strong signal correlation between Reddit complaints and search trends."
    },
    "risks_to_validate": [
        {
            "risk": "User adoption of voice notes in shared environments",
            "type": "behavioral",
            "validation_method": "Prototype test with 10 beta users"
        }
    ]
}

async def mock_chat_completion(*args, **kwargs):
    return {
        "content": json.dumps(mock_brief_json),
        "model": "mock-model",
        "provider": "mock-provider"
    }

@patch("app.core.ai_client.AIClient.chat_completion", side_effect=mock_chat_completion)
def test_mocked_idea_details(mock_cc):
    print("Running Mocked Investment Brief Test...")
    payload = {
        "idea": {
            "title": "SmartCRM",
            "problem": "Generic CRMs are too hard.",
            "solution": "Voice-first CRM."
        },
        "mode": "basic"
    }
    
    response = client.post("/api/idea-details", json=payload)
    
    if response.status_code != 200:
        print(f"FAILED: Status Code {response.status_code}")
        print(response.json())
        return

    data = response.json()
    assert data["title"] == mock_brief_json["title"]
    assert data["confidence_score"] == mock_brief_json["confidence_score"]
    assert data["market_size"]["estimate"] == mock_brief_json["market_size"]["estimate"]
    
    print("SUCCESS: Mocked Investment Brief flow verified!")
    print(f"Brief Title: {data['title']}")

if __name__ == "__main__":
    test_mocked_idea_details()
