import pytest
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi import Request
from unittest.mock import Mock
from src.exceptions.handlers import TaskOwnershipError, ValidationError, task_ownership_error_handler, validation_error_handler, http_exception_handler


class TestExceptionHandlers:
    """Unit tests for custom exception handlers"""

    def test_task_ownership_error_init(self):
        """Test TaskOwnershipError initialization with default message"""
        error = TaskOwnershipError()

        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert error.detail["error_code"] == "AUTHORIZATION_ERROR"
        assert error.detail["detail"] == "You do not have permission to access this resource"

    def test_task_ownership_error_custom_message(self):
        """Test TaskOwnershipError initialization with custom message"""
        custom_msg = "Custom error message"
        error = TaskOwnershipError(detail=custom_msg)

        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert error.detail["error_code"] == "AUTHORIZATION_ERROR"
        assert error.detail["detail"] == custom_msg

    def test_validation_error_init(self):
        """Test ValidationError initialization with default message"""
        error = ValidationError()

        assert error.status_code == status.HTTP_400_BAD_REQUEST
        assert error.detail["error_code"] == "VALIDATION_ERROR"
        assert error.detail["detail"] == "Validation failed"

    def test_validation_error_custom_message(self):
        """Test ValidationError initialization with custom message"""
        custom_msg = "Custom validation error"
        error = ValidationError(detail=custom_msg)

        assert error.status_code == status.HTTP_400_BAD_REQUEST
        assert error.detail["error_code"] == "VALIDATION_ERROR"
        assert error.detail["detail"] == custom_msg

    @pytest.mark.asyncio
    async def test_task_ownership_error_handler(self):
        """Test task ownership error handler"""
        request = Mock(spec=Request)
        exc = TaskOwnershipError(detail="Access denied")

        response = await task_ownership_error_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.body.decode() == '{"error_code": "AUTHORIZATION_ERROR", "detail": "Access denied"}'

    @pytest.mark.asyncio
    async def test_validation_error_handler(self):
        """Test validation error handler"""
        request = Mock(spec=Request)
        exc = ValidationError(detail="Invalid input")

        response = await validation_error_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.body.decode() == '{"error_code": "VALIDATION_ERROR", "detail": "Invalid input"}'

    @pytest.mark.asyncio
    async def test_http_exception_handler_401(self):
        """Test HTTP exception handler with 401 status code"""
        request = Mock(spec=Request)
        exc = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized access"
        )

        response = await http_exception_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        response_data = response.body.decode()
        assert '"error_code": "AUTHENTICATION_ERROR"' in response_data

    @pytest.mark.asyncio
    async def test_http_exception_handler_403(self):
        """Test HTTP exception handler with 403 status code"""
        request = Mock(spec=Request)
        exc = HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden access"
        )

        response = await http_exception_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        response_data = response.body.decode()
        assert '"error_code": "AUTHORIZATION_ERROR"' in response_data

    @pytest.mark.asyncio
    async def test_http_exception_handler_404(self):
        """Test HTTP exception handler with 404 status code"""
        request = Mock(spec=Request)
        exc = HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )

        response = await http_exception_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        response_data = response.body.decode()
        assert '"error_code": "RESOURCE_NOT_FOUND"' in response_data

    @pytest.mark.asyncio
    async def test_http_exception_handler_custom_error_code(self):
        """Test HTTP exception handler with custom error code in detail"""
        request = Mock(spec=Request)
        exc = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "CUSTOM_ERROR",
                "detail": "Custom error occurred"
            }
        )

        response = await http_exception_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        response_data = response.body.decode()
        assert '"error_code": "CUSTOM_ERROR"' in response_data

    @pytest.mark.asyncio
    async def test_http_exception_handler_unknown_status_code(self):
        """Test HTTP exception handler with unknown status code"""
        request = Mock(spec=Request)
        exc = HTTPException(
            status_code=599,  # Unknown status code
            detail="Unknown error"
        )

        response = await http_exception_handler(request, exc)

        assert isinstance(response, JSONResponse)
        assert response.status_code == 599
        response_data = response.body.decode()
        assert '"error_code": "INTERNAL_ERROR"' in response_data