"""
Backend configuration with environment variable loading.

Per @specs/001-auth-api-bridge/research.md
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlmodel import SQLModel


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
