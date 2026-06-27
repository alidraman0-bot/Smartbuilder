import uuid

def is_valid_uuid(value: str) -> bool:
    """Return True if the given string is a valid UUID format."""
    try:
        uuid.UUID(str(value))
        return True
    except Exception:
        return False
