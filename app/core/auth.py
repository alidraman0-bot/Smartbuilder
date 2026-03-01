import logging
from typing import Optional, List
from fastapi import HTTPException, status, Header
from app.core.supabase import supabase

logger = logging.getLogger(__name__)

async def verify_supabase_token(token: str) -> dict:
    """
    Verifies the Supabase JWT token and returns user data as a dictionary.
    """
    import asyncio
    
    try:
        logger.info(f"Verifying token: {token[:10]}...")
        
        # Wrap synchronous Supabase call in asyncio.to_thread to avoid blocking
        def _get_user():
            return supabase.auth.get_user(token)
        
        user = await asyncio.to_thread(_get_user)
        
        if not user or not user.user:
             logger.warning(f"Supabase auth returned no user for token starts with: {token[:10]}...")
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"User verified successfully: {user.user.id}")
        
        # Convert User object to dict for backward compatibility with code using .get()
        u = user.user
        return {
            "id": u.id,
            "email": u.email,
            "app_metadata": u.app_metadata or {},
            "user_metadata": u.user_metadata or {},
            "aud": u.aud,
            "created_at": u.created_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth verification failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def check_role(user: dict, required_roles: List[str]) -> bool:
    """
    Checks if the user has one of the required roles.
    Assumes role is stored in user_metadata or app_metadata.
    """
    # Check app_metadata first (more secure usually)
    user_role = user.get("app_metadata", {}).get("role")
    if not user_role:
        # Fallback to user_metadata
        user_role = user.get("user_metadata", {}).get("role")
    
    if not user_role:
        return False
        
    return user_role in required_roles
