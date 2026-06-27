import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

async def retry_request(func, retries=3, delay=2):
    """
    Retries an async request function with exponential backoff on timeout errors.
    """
    for attempt in range(retries):
        try:
            return await func()
        except (httpx.ReadTimeout, httpx.ConnectTimeout, httpx.PoolTimeout) as e:
            if attempt == retries - 1:
                logger.error(f"Request failed after {retries} attempts: {str(e)}")
                raise
            wait_time = delay * (attempt + 1)
            logger.warning(f"Request timeout on attempt {attempt + 1}/{retries}. Retrying in {wait_time}s...")
            await asyncio.sleep(wait_time)
        except Exception as e:
            # For other exceptions, don't necessarily retry unless specified
            logger.error(f"Request failed with non-timeout error: {str(e)}")
            raise
