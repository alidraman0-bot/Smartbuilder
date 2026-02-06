from abc import ABC, abstractmethod
from typing import Any, Dict
from app.core.config import settings

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.model = settings.MODEL_NAME

    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent's core logic.
        Must return a dictionary matching the agent's output schema.
        """
        pass

    def _get_system_prompt(self) -> str:
        """
        Return the strict system prompt for this agent.
        """
        return f"You are the {self.name} of the Smartbuilder system."
