"""
Health check endpoint.

Per @specs/001-auth-api-bridge/contracts/pydantic-models.md
"""
from fastapi import APIRouter
from pydantic import BaseModel
from src.config import settings, engine
from sqlalchemy import text


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    database: str = "connected"
    version: str = "1.0.0"


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns service health status and database connectivity.
    """
    # Check database connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"disconnected: {str(e)[:50]}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "unhealthy",
        database=db_status,
        version="1.0.0"
    )
