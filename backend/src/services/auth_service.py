from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import Optional
from uuid import UUID
import uuid
import bcrypt
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from ..models.user import User, UserCreate
from ..utils.jwt_utils import create_access_token
from ..utils.cache_utils import cache


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_user(self, user_create: UserCreate) -> User:
        """Register a new user with the given email and password"""
        # Check if user already exists
        existing_user_result = await self.session.exec(select(User).where(User.email == user_create.email))
        existing_user = existing_user_result.first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "error_code": "USER_EXISTS_ERROR",
                    "detail": "User with this email already exists"
                }
            )

        # Hash the password using bcrypt
        hashed_password = bcrypt.hashpw(user_create.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create new user
        user = User(
            id=uuid.uuid4(),
            email=user_create.email,
            hashed_password=hashed_password
        )

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        # Cache the user (cache for 5 minutes)
        cache_key = f"user:{user.id}"
        cache.set(cache_key, user, ttl_seconds=300)

        return user

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with the given email and password"""
        # Find user by email
        user_result = await self.session.exec(select(User).where(User.email == email))
        user = user_result.first()

        if not user:
            return None

        # Verify password using bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), user.hashed_password.encode('utf-8')):
            return None

        # Cache the user (cache for 5 minutes)
        cache_key = f"user:{user.id}"
        cache.set(cache_key, user, ttl_seconds=300)

        return user

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get a user by their ID with caching"""
        # Try to get from cache first
        cache_key = f"user:{user_id}"
        cached_user = cache.get(cache_key)
        if cached_user:
            return cached_user

        # Not in cache, fetch from database
        user_result = await self.session.exec(select(User).where(User.id == user_id))
        user = user_result.first()

        # Cache the user if found (cache for 5 minutes)
        if user:
            cache.set(cache_key, user, ttl_seconds=300)

        return user

    def create_access_token_for_user(self, user: User) -> str:
        """Create an access token for the given user"""
        data = {"sub": str(user.id), "email": user.email}
        token = create_access_token(
            data=data,
            expires_delta=timedelta(minutes=10080)  # 7 days
        )
        return token