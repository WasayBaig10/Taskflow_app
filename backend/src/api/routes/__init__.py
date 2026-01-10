"""Routes package."""
from src.api.routes.tasks import router as tasks_router
from src.api.routes.health import router as health_router

__all__ = ["tasks_router", "health_router"]
