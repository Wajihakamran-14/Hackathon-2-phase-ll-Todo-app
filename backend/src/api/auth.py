from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Dict
from uuid import UUID
from ..models.user import UserCreate, UserLogin
from ..services.auth_service import AuthService
from ..database.session import AsyncSessionLocal
from ..utils.jwt_utils import create_access_token, verify_token
from ..exceptions.handlers import TaskOwnershipError


router = APIRouter()
security = HTTPBearer()


@router.post("/auth/register")
async def register_user(user_create: UserCreate):
    """Register a new user"""
    async with AsyncSessionLocal() as session:
        auth_service = AuthService(session)
        user = await auth_service.register_user(user_create)

        # Create JWT token
        access_token = auth_service.create_access_token_for_user(user)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at
            }
        }


@router.post("/auth/login")
async def login_user(user_login: UserLogin):
    """Authenticate user and return JWT token"""
    async with AsyncSessionLocal() as session:
        auth_service = AuthService(session)
        user = await auth_service.authenticate_user(user_login.email, user_login.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error_code": "AUTHENTICATION_ERROR",
                    "detail": "Incorrect email or password"
                },
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create JWT token
        access_token = auth_service.create_access_token_for_user(user)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at
            }
        }


@router.post("/auth/logout")
async def logout_user(token: str = Depends(security)):
    """Logout user (client-side token invalidation)"""
    # In a real implementation, you might want to add the token to a blacklist
    # For now, we just return a success message
    return {"message": "Successfully logged out"}


@router.get("/auth/me")
async def get_current_user(token: str = Depends(security)):
    """Get current authenticated user information"""
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
    except Exception:
        raise credentials_exception

    async with AsyncSessionLocal() as session:
        auth_service = AuthService(session)
        user = await auth_service.get_user_by_id(UUID(user_id))

        if user is None:
            raise credentials_exception

        return {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at
        }