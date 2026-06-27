import os
from typing import Dict, Any
from agents import Agent, Runner
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ProductPlanner:
    """
    Product Planner Agent using OpenAI Agents SDK.
    Translates a user idea into a comprehensive Product Requirements Document (PRD).
    """
    
    def __init__(self):
        self.agent = Agent(
            name="ProductManager",
            instructions=(
                "You are an elite Product Manager at a top-tier startup incubator. "
                "Your goal is to take a raw startup idea and transform it into a structured PRD. "
                "The PRD must include: "
                "1. Core Value Proposition "
                "2. Target Audience "
                "3. Key Features (Phase 1 MVP) "
                "4. Technical Stack Recommendation "
                "5. User Stories "
                "Output must be in valid JSON format with keys: 'title', 'summary', 'features', 'stack', 'user_stories'."
            )
        )

    def plan_mvp(self, idea: str) -> Dict[str, Any]:
        """
        Executes the planning loop.
        """
        prompt = f"Here is the user's idea: {idea}. Please generate a structured PRD JSON."
        
        result = Runner.run_sync(
            self.agent,
            prompt
        )
        
        # In a real scenario, we'd parse the result.final_output as JSON.
        # The OpenAI Agents SDK handles the loop and tool calls.
        return result.final_output

if __name__ == "__main__":
    planner = ProductPlanner()
    test_idea = "A platform for connecting AI founders for skill swapping."
    print(planner.plan_mvp(test_idea))
