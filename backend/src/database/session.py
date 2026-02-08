import re
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from sqlmodel import SQLModel
import os


# Create the async engine - ensure URL uses async driver
def get_async_db_url():
    db_url = settings.database_url
    # For testing, use SQLite if TESTING environment variable is set
    if os.getenv("TESTING"):
        return "sqlite+aiosqlite:///./test_todo_app.db"

    # Replace postgresql:// with postgresql+asyncpg:// for async support
    # Remove sslmode from query parameters as asyncpg handles SSL differently
    if db_url.startswith("postgresql://"):
        # Replace the protocol
        base_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        # Handle the sslmode parameter which causes issues with asyncpg
        if '?sslmode=require' in base_url.lower():
            # asyncpg uses different SSL parameters, so we remove sslmode=require
            base_url = base_url.replace('?sslmode=require', '')
        elif '&sslmode=require' in base_url.lower():
            base_url = base_url.replace('&sslmode=require', '')
        elif '?sslmode=' in base_url.lower() or '&sslmode=' in base_url.lower():
            # Remove any sslmode parameter and let asyncpg handle SSL automatically
            base_url = re.sub(r'[?&]sslmode=[^&]*', '', base_url)
            # Add back the query separator if needed
            if '?' not in base_url and '&' in base_url:
                base_url = base_url.replace('&', '?', 1)

        return base_url

    return db_url


# Create the async engine with performance optimizations
engine = create_async_engine(
    get_async_db_url(),
    echo=settings.debug,  # Set to True to see SQL queries in development
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
    pool_size=20,  # Increase pool size for better concurrency
    max_overflow=30,  # Allow additional connections during high load
    # Add connect_args for SQLite
    connect_args={"check_same_thread": False} if "sqlite" in get_async_db_url() else {}
)

# Create async session maker
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def create_db_and_tables():
    """Create database tables if they don't exist"""
    async with engine.begin() as conn:
        # Create tables
        await conn.run_sync(SQLModel.metadata.create_all)