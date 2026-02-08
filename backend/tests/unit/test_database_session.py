import pytest
import os
from unittest.mock import patch, MagicMock
from src.database.session import get_async_db_url, engine, AsyncSessionLocal
from config.settings import settings


class TestDatabaseSession:
    """Unit tests for database session utilities"""

    def test_get_async_db_url_postgresql(self):
        """Test converting PostgreSQL URL to asyncpg format"""
        original_url = "postgresql://user:pass@localhost:5432/mydb"

        result = get_async_db_url()

        # Since we can't easily mock the settings.database_url, we'll test the function logic
        # by patching the settings temporarily
        with patch('src.database.session.settings') as mock_settings:
            mock_settings.database_url = original_url
            with patch('src.database.session.os.getenv', return_value=None):  # Not in testing mode
                result = get_async_db_url()

        assert result.startswith("postgresql+asyncpg://")
        assert "user:pass@localhost:5432/mydb" in result

    def test_get_async_db_url_postgresql_with_sslmode(self):
        """Test converting PostgreSQL URL with sslmode parameter"""
        original_url = "postgresql://user:pass@localhost:5432/mydb?sslmode=require"

        with patch('src.database.session.settings') as mock_settings:
            mock_settings.database_url = original_url
            with patch('src.database.session.os.getenv', return_value=None):  # Not in testing mode
                result = get_async_db_url()

        assert result.startswith("postgresql+asyncpg://")
        assert "user:pass@localhost:5432/mydb" in result
        assert "?sslmode=" not in result  # sslmode should be removed

    def test_get_async_db_url_sqlite_testing_mode(self):
        """Test returning SQLite URL when in testing mode"""
        with patch('src.database.session.os.getenv', return_value="true"):  # Testing mode
            result = get_async_db_url()

        assert result == "sqlite+aiosqlite:///./test_todo_app.db"

    def test_get_async_db_url_other_protocol(self):
        """Test that other protocols are returned unchanged"""
        original_url = "mysql://user:pass@localhost:3306/mydb"

        with patch('src.database.session.settings') as mock_settings:
            mock_settings.database_url = original_url
            with patch('src.database.session.os.getenv', return_value=None):  # Not in testing mode
                result = get_async_db_url()

        assert result == original_url

    def test_engine_creation(self):
        """Test that engine is created with proper configuration"""
        # Just verify that the engine object exists and has expected attributes
        assert engine is not None
        assert hasattr(engine, 'url')

    def test_async_session_local_creation(self):
        """Test that AsyncSessionLocal is created properly"""
        # Just verify that the session maker exists
        assert AsyncSessionLocal is not None

    def test_get_async_db_url_no_changes_needed(self):
        """Test that URLs that don't need conversion are returned as-is"""
        original_url = "postgresql+asyncpg://user:pass@localhost:5432/mydb"

        with patch('src.database.session.settings') as mock_settings:
            mock_settings.database_url = original_url
            with patch('src.database.session.os.getenv', return_value=None):  # Not in testing mode
                result = get_async_db_url()

        assert result == original_url