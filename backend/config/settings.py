from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_app?sslmode=require")

    # Neon Serverless specific settings
    neon_project_id: str = os.getenv("NEON_PROJECT_ID", "")
    neon_api_key: str = os.getenv("NEON_API_KEY", "")

    # JWT authentication settings
    better_auth_secret: str = os.getenv("BETTER_AUTH_SECRET", "your-super-secret-jwt-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))  # 30 days

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")

    # API settings
    api_prefix: str = "/api/v1"
    debug: bool = environment == "development"

    class Config:
        case_sensitive = True


settings = Settings()