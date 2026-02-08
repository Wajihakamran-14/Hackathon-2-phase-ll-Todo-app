from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Dict
from uuid import UUID
import jwt
from config.settings import settings
from ..utils.jwt_utils import verify_token


security = HTTPBearer()


def get_current_user(token: str = Depends(security)) -> Dict:
    """
    Get the current authenticated user from the JWT token
    """
    print(f"DEBUG: Received token: {token.credentials[:10]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error_code": "AUTHENTICATION_ERROR",
            "detail": "Could not validate credentials"
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_token(token.credentials)
        user_id: str = payload.get("sub")
        email: str = payload.get("email")

        if user_id is None or email is None:
            raise credentials_exception
    except jwt.JWTError:
        raise credentials_exception
    except Exception:
        raise credentials_exception

    return {
        "user_id": UUID(user_id),
        "email": email
    }


def get_current_user_id(token: str = Depends(security)) -> UUID:
    """
    Get the current authenticated user's ID from the JWT token
    """
    user_data = get_current_user(token)
    return user_data["user_id"]