"""
Backend configuration with environment variable loading.

Per @specs/001-auth-api-bridge/research.md
"""
import os
from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlmodel import SQLModel

# Load .env file with override to ensure .env takes precedence over system env vars
# This is needed when system env vars are set with placeholder values
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path, override=True)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Better Auth
    better_auth_secret: str
    better_auth_url: str = "http://localhost:3000"

    # Database
    database_url: str

    # API
    api_port: int = 8000
    api_host: str = "localhost"
    debug: bool = True

    # Chatbot Configuration
    # Per @specs/001-chatbot-mcp/plan.md
    openai_api_key: str
    neon_database_url: str  # Same as database_url but explicit for chatbot
    mcp_server_port: int = 8000
    openai_model: str = "gpt-4-turbo-preview"
    mcp_server_host: str = "127.0.0.1"

    # Email Configuration
    email_host: str = "smtp.gmail.com"
    email_port: int = 587
    email_username: str = ""
    email_password: str = ""
    email_from: str = ""
    email_from_name: str = "TaskFlow"
    emails_enabled: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra env vars (frontend vars)


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Global settings instance
settings = get_settings()

# Database engine with connection pooling per @specs/001-auth-api-bridge/research.md
engine = create_engine(
    settings.database_url,
    poolclass=None,  # QueuePool (default)
    pool_size=5,  # Connections to maintain
    max_overflow=10,  # Additional connections under load
    pool_pre_ping=True,  # Validate connections before use (handles Neon scale-to-zero)
    pool_recycle=3600,  # Recycle connections after 1 hour
    echo=settings.debug,  # Log SQL in development
)


def init_db():
    """Initialize database tables."""
    SQLModel.metadata.create_all(engine)
