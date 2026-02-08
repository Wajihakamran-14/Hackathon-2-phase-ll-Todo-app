from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi import Request
from typing import Dict, Any


class TaskOwnershipError(HTTPException):
    """Exception raised when a user attempts to access another user's task"""
    def __init__(self, detail: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error_code": "AUTHORIZATION_ERROR",
                "detail": detail
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


class ValidationError(HTTPException):
    """Exception raised when validation fails"""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error_code": "VALIDATION_ERROR",
                "detail": detail
            }
        )


async def task_ownership_error_handler(request: Request, exc: TaskOwnershipError):
    """Handle task ownership errors"""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail
    )


async def validation_error_handler(request: Request, exc: ValidationError):
    """Handle validation errors"""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail
    )


async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    error_codes_map = {
        401: "AUTHENTICATION_ERROR",
        403: "AUTHORIZATION_ERROR",
        404: "RESOURCE_NOT_FOUND",
        400: "VALIDATION_ERROR"
    }

    error_code = error_codes_map.get(exc.status_code, "INTERNAL_ERROR")

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail if isinstance(exc.detail, str) else exc.detail.get("detail", "An error occurred"),
            "error_code": exc.detail.get("error_code", error_code) if isinstance(exc.detail, dict) else error_code
        }
    )