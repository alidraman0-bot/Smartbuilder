"""
Global AI Rate Limiter — prevents concurrency storms against AI providers.

Uses an asyncio Semaphore to cap concurrent AI requests and a configurable
inter-request delay to stay under rate limits.
"""

import asyncio
import logging

logger = logging.getLogger(__name__)


class RateLimiter:
    """
    Async rate limiter with concurrency cap and inter-request delay.

    - max_concurrent: maximum number of simultaneous AI requests
    - delay_seconds: minimum wait between releasing the semaphore
    """

    def __init__(self, max_concurrent: int = 3, delay_seconds: float = 1.0):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.delay = delay_seconds
        self._lock = asyncio.Lock()  # Serializes delay enforcement

    async def acquire(self):
        """Acquire a slot — blocks if all slots are in use."""
        await self.semaphore.acquire()
        # Enforce minimum gap between requests to avoid bursts
        async with self._lock:
            await asyncio.sleep(self.delay)

    def release(self):
        """Release a slot back to the pool."""
        self.semaphore.release()


# Global singleton — import this from anywhere
ai_limiter = RateLimiter(max_concurrent=15, delay_seconds=0.05)

