import pytest
import jwt
from datetime import timedelta
from unittest.mock import Mock, patch
from src.utils.jwt_utils import create_access_token, verify_token, get_current_user
from config.settings import settings


class TestJWTUtils:
    """Unit tests for JWT utility functions"""

    def test_create_access_token_success(self):
        """Test creating an access token with default expiration"""
        data = {"sub": "user123", "email": "test@example.com"}

        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)

        # Decode and verify the token
        decoded = jwt.decode(token, settings.better_auth_secret, algorithms=[settings.algorithm])
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
        assert "exp" in decoded

    def test_create_access_token_with_custom_expiration(self):
        """Test creating an access token with custom expiration"""
        data = {"sub": "user123", "email": "test@example.com"}
        custom_expiry = timedelta(minutes=30)

        token = create_access_token(data, expires_delta=custom_expiry)

        assert token is not None

        # Decode and verify the token
        decoded = jwt.decode(token, settings.better_auth_secret, algorithms=[settings.algorithm])
        assert decoded["sub"] == "user123"
        assert decoded["email"] == "test@example.com"
        assert "exp" in decoded

    def test_verify_token_success(self):
        """Test verifying a valid token"""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)

        result = verify_token(token)

        assert result["sub"] == "user123"
        assert result["email"] == "test@example.com"

    def test_verify_token_expired(self):
        """Test verifying an expired token raises exception"""
        from fastapi import HTTPException
        from datetime import datetime

        # Create an expired token manually
        expired_payload = {
            "sub": "user123",
            "email": "test@example.com",
            "exp": datetime.timestamp(datetime.fromtimestamp(1000))  # Very old timestamp
        }
        expired_token = jwt.encode(expired_payload, settings.better_auth_secret, algorithm=settings.algorithm)

        with pytest.raises(HTTPException) as exc_info:
            verify_token(expired_token)

        assert exc_info.value.status_code == 401
        assert "Token has expired" in exc_info.value.detail

    def test_verify_token_invalid(self):
        """Test verifying an invalid token raises exception"""
        from fastapi import HTTPException

        invalid_token = "invalid.token.here"

        with pytest.raises(HTTPException) as exc_info:
            verify_token(invalid_token)

        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in exc_info.value.detail

    def test_get_current_user_success(self):
        """Test getting current user from valid token"""
        data = {"sub": "user123", "email": "test@example.com"}
        token = create_access_token(data)

        result = get_current_user(token)

        assert result["user_id"] == "user123"
        assert result["email"] == "test@example.com"

    def test_get_current_user_missing_fields(self):
        """Test getting current user from token with missing fields"""
        from fastapi import HTTPException

        # Create token without required fields
        data = {"other_field": "value"}  # Missing 'sub' and 'email'
        token = create_access_token(data)

        with pytest.raises(HTTPException) as exc_info:
            get_current_user(token)

        assert exc_info.value.status_code == 401
        assert "Could not validate credentials" in exc_info.value.detail