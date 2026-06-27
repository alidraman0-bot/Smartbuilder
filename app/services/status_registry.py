import asyncio
from typing import List

# In‑memory status registry (replace with Supabase in production)
_status_store = {}

async def add_status(launch_id: str, message: str) -> None:
    """Append a status message for a given launch ID.
    In a real system this would write to Supabase & push via SSE.
    """
    _status_store.setdefault(launch_id, []).append(message)
    # Simulate slight delay for async compatibility
    await asyncio.sleep(0)

async def get_status(launch_id: str) -> List[str]:
    """Retrieve the full status history for a launch ID."""
    return _status_store.get(launch_id, [])
