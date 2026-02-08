import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlmodel.ext.asyncio.session import AsyncSession
from src.services.auth_service import AuthService
from src.models.user import User, UserCreate
from uuid import UUID
import bcrypt


class TestAuthService:
    """Unit tests for AuthService"""

    @pytest.fixture
    def mock_session(self):
        """Create a mock database session"""
        return AsyncMock(spec=AsyncSession)

    @pytest.fixture
    def auth_service(self, mock_session):
        """Create an AuthService instance with mocked session"""
        return AuthService(mock_session)

    @pytest.mark.asyncio
    async def test_register_user_success(self, auth_service, mock_session):
        """Test successful user registration"""
        # Arrange
        user_create = UserCreate(email="test@example.com", password="password123")

        # Mock the database query to return no existing user
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = None
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.register_user(user_create)

        # Assert
        assert result.email == "test@example.com"
        # Verify that the password was hashed
        mock_session.add.assert_called_once()
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once()

    @pytest.mark.asyncio
    async def test_register_user_already_exists(self, auth_service, mock_session):
        """Test registration fails when user already exists"""
        from fastapi import HTTPException

        # Arrange
        user_create = UserCreate(email="test@example.com", password="password123")

        # Mock an existing user
        existing_user = User(id="some-id", email="test@example.com", hashed_password="hashed")
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = existing_user
        mock_session.exec.return_value = mock_exec_result

        # Act & Assert
        with pytest.raises(HTTPException) as exc_info:
            await auth_service.register_user(user_create)

        assert exc_info.value.status_code == 409
        assert "User with this email already exists" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, auth_service, mock_session):
        """Test successful user authentication"""
        # Arrange
        email = "test@example.com"
        password = "password123"

        # Create a hashed password
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Mock user in database
        db_user = User(id="some-id", email=email, hashed_password=hashed.decode('utf-8'))
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = db_user
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.authenticate_user(email, password)

        # Assert
        assert result is not None
        assert result.email == email

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self, auth_service, mock_session):
        """Test authentication fails with wrong password"""
        # Arrange
        email = "test@example.com"
        password = "password123"
        wrong_password = "wrongpassword"

        # Create a hashed password
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Mock user in database
        db_user = User(id="some-id", email=email, hashed_password=hashed.decode('utf-8'))
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = db_user
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.authenticate_user(email, wrong_password)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_authenticate_user_user_not_found(self, auth_service, mock_session):
        """Test authentication fails when user doesn't exist"""
        # Arrange
        email = "nonexistent@example.com"
        password = "password123"

        # Mock no user found
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = None
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.authenticate_user(email, password)

        # Assert
        assert result is None

    @pytest.mark.asyncio
    async def test_get_user_by_id_success(self, auth_service, mock_session):
        """Test getting user by ID successfully"""
        # Arrange
        user_id = UUID("12345678-1234-5678-1234-567812345678")

        # Mock user in database
        db_user = User(id=user_id, email="test@example.com", hashed_password="hashed")
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = db_user
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.get_user_by_id(user_id)

        # Assert
        assert result is not None
        assert result.id == user_id
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, auth_service, mock_session):
        """Test getting user by ID returns None when not found"""
        # Arrange
        user_id = UUID("12345678-1234-5678-1234-567812345678")

        # Mock no user found
        mock_exec_result = MagicMock()
        mock_exec_result.first.return_value = None
        mock_session.exec.return_value = mock_exec_result

        # Act
        result = await auth_service.get_user_by_id(user_id)

        # Assert
        assert result is None

    def test_create_access_token_for_user(self, auth_service):
        """Test creating access token for user"""
        # Arrange
        user = User(id=UUID("12345678-1234-5678-1234-567812345678"), email="test@example.com", hashed_password="hashed")

        # Act
        token = auth_service.create_access_token_for_user(user)

        # Assert
        assert token is not None
        assert isinstance(token, str)