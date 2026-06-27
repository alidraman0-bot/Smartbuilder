import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict
from fastapi import HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger(__name__)

# Production JWT Configuration
JWT_SECRET_KEY = getattr(settings, "JWT_SECRET_KEY", "smartbuilder-production-hardened-secret-v1")
JWT_ALGORITHM = getattr(settings, "JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = 7

class SecurityManager:
    @staticmethod
    def create_access_token(user_id: str) -> str:
        """
        Creates a new JWT access token.
        """
        try:
            expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
            payload = {
                "sub": str(user_id),
                "exp": expire,
                "iat": datetime.now(timezone.utc)
            }
            return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        except Exception as e:
            logger.error(f"JWT creation failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not generate access token"
            )

    @staticmethod
    def verify_token(token: str) -> Dict:
        """
        Verifies a JWT token and returns the payload.
        """
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload: missing subject",
                )
            return payload
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
