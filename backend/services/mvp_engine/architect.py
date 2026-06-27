import asyncio
import os
from typing import List, Dict, Any
from claude_agent_sdk import query, ClaudeAgentOptions
from dotenv import load_dotenv

load_dotenv()

class SystemArchitect:
    """
    System Architect Agent using Claude Agent SDK.
    Designs the technical architecture and file structure for the MVP.
    """

    def __init__(self):
        self.options = ClaudeAgentOptions(
            allowed_tools=["Bash", "Glob"]
        )

    async def design_architecture(self, prd: str) -> str:
        """
        Asks Claude to design the architecture based on the PRD.
        """
        prompt = (
            f"Based on this PRD: {prd}\n\n"
            "Design the system architecture and proposed file structure. "
            "Think about the database schema (Supabase/PostgreSQL) and the frontend structure (Next.js/React). "
            "Output the design in Markdown format."
        )

        architecture_design = ""
        async for message in query(prompt=prompt, options=self.options):
            if hasattr(message, "result"):
                architecture_design += str(message.result)
            elif hasattr(message, "content"):
                architecture_design += str(message.content)
        
        return architecture_design

if __name__ == "__main__":
    architect = SystemArchitect()
    test_prd = "MVP for a founder networking platform."
    asyncio.run(architect.design_architecture(test_prd))
