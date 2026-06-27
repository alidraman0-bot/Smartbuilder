import httpx
import logging
import re
from app.core.config import settings

logger = logging.getLogger(__name__)

def sanitize_url(url: str) -> str:
    """Masks API keys and sensitive tokens in URLs for safe logging."""
    if not url:
        return url
    # Mask common API key parameters
    url = re.sub(r'(api_key=)[^&]+', r'\1***', url)
    url = re.sub(r'(apiKey=)[^&]+', r'\1***', url)
    url = re.sub(r'(token=)[^&]+', r'\1***', url)
    url = re.sub(r'(access_key=)[^&]+', r'\1***', url)
    return url

# Production-grade global HTTP client
# Shared across the entire application to ensure connection pooling
http_client = httpx.AsyncClient(
    verify=False,  # Bypass SSL verification to support self-signed enterprise certificates/proxies
    timeout=httpx.Timeout(
        connect=20.0,
        read=60.0,
        write=20.0,
        pool=20.0,
    ),
    limits=httpx.Limits(
        max_connections=100,
        max_keepalive_connections=20,
    ),
    headers={
        "User-Agent": "SmartbuilderAI/1.0"
    }
)

# Alias for safer naming in specific contexts
safe_http_client = http_client

async def close_http_client():
    """Closes the global HTTP client."""
    await http_client.aclose()
