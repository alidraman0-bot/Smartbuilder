from typing import Type, TypeVar, Any
from pydantic import BaseModel, ValidationError
from app.models.schemas import ViabilityScore

T = TypeVar("T", bound=BaseModel)

class ValidationService:
    @staticmethod
    def validate_schema(data: dict, schema: Type[T]) -> T:
        try:
            return schema(**data)
        except ValidationError as e:
            raise ValueError(f"Schema validation failed: {str(e)}")

    @staticmethod
    def validate_viability(score: ViabilityScore, threshold: int = 70) -> bool:
        """
        Hard gate for business viability.
        """
        if score.score < threshold:
            return False
        return True
