from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate Supabase JWT tokens for every request.
    Falls back to anonymous access if no token is provided.
    """
    async def dispatch(self, request: Request, call_next):
        # Skip auth for specific paths
        if any(path in request.url.path for path in ["/docs", "/redoc", "/openapi.json", "/health"]):
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if auth_header:
            try:
                token = auth_header.replace("Bearer ", "")
                # We use the existing verify_supabase_token logic or the new SecurityManager
                from app.core.auth import verify_supabase_token
                await verify_supabase_token(token)
            except Exception as e:
                logger.warning(f"AuthMiddleware blocked request: {e}")
                return JSONResponse(
                    status_code=401,
                    content={
                        "success": False,
                        "message": "Invalid or expired session. Please log in again.",
                    },
                )

        response = await call_next(request)
        return response
