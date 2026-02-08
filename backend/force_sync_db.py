import asyncio
import sys
import os

# Add current directory to sys.path
sys.path.append(os.getcwd())

from src.database.session import engine
from sqlmodel import SQLModel
# Import all models to ensure they are registered with SQLModel.metadata
from src.models.user import User
from models.task import Task

async def force_sync():
    print("WARNING: This will drop all tables and recreate them.")
    print("Connecting to database...")
    
    async with engine.begin() as conn:
        print("Dropping tables...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("Creating tables...")
        await conn.run_sync(SQLModel.metadata.create_all)
        print("Database sync COMPLETE.")

if __name__ == "__main__":
    asyncio.run(force_sync())
