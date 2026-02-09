from fastapi import FastAPI
from config.settings import settings
from routes.tasks import router as tasks_router
from routes.chat import router as chat_router
from src.api.auth import router as auth_router
from src.health import router as health_router
from contextlib import asynccontextmanager
from src.database import create_db_and_tables
from models.chat import ChatConversation, ChatMessage


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await create_db_and_tables()
    yield
    # Shutdown logic can go here if needed


app = FastAPI(
    title="Todo API",
    description="A secure task management API with Neon Serverless PostgreSQL and authentication",
    version="1.0.0",
    lifespan=lifespan
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","https://hackathon-2-phase-ll-todo-app-9ks1.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "error_code": "INTERNAL_SERVER_ERROR"},
    )

# Include API routes
app.include_router(tasks_router, prefix=f"{settings.api_prefix}/tasks", tags=["tasks"])
app.include_router(chat_router, prefix=f"{settings.api_prefix}/chat", tags=["chat"])
app.include_router(auth_router, prefix=settings.api_prefix, tags=["auth"])
app.include_router(health_router, prefix="", tags=["health"])


@app.get("/")
def read_root():
    return {"message": "Todo API is running with Neon Serverless PostgreSQL and authentication!"}


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "Neon Serverless PostgreSQL connected", "auth": "enabled"}


# Database migration endpoint (for development/testing)
@app.post("/migrate")
async def run_migrations():
    """Manually trigger database migrations (for development/testing purposes)"""
    await create_db_and_tables()
    return {"message": "Database migrations completed successfully"}