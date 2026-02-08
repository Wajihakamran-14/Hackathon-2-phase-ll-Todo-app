from fastapi import APIRouter
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import text
from .database.session import AsyncSessionLocal
import datetime


router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint to verify API status"""
    # Test database connection
    try:
        async with AsyncSessionLocal() as session:
            # Execute a simple query to test the database connection
            result = await session.execute(text("SELECT 1"))
            db_available = True
    except Exception:
        db_available = False

    return {
        "status": "healthy",
        "database": "available" if db_available else "unavailable",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check to verify if the service is ready to accept traffic"""
    return {"status": "ready"}


@router.get("/alive")
async def liveness_check():
    """Liveness check to verify if the service is alive"""
    return {"status": "alive"}