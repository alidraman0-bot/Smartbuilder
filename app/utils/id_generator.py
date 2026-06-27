import uuid

def generate_uuid() -> str:
    """Generates a random UUID4 string."""
    return str(uuid.uuid4())
