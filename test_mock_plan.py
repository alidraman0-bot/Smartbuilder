import sys
import os

# Set up path to include the app directory
sys.path.append(os.getcwd())

from app.services.business_plan_service import business_plan_service

try:
    idea = {"title": "Test Idea", "target_user": "Small Businesses"}
    research = {"modules": [], "confidence_score": 85}
    mock_plan = business_plan_service._get_mock_business_plan(idea, research)
    print("SUCCESS: Mock plan generated correctly.")
except NameError as e:
    print(f"NameError: {e}")
except Exception as e:
    print(f"Exception: {e}")
