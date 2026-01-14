"""
Task API routes with JWT authentication and user isolation.

Per @specs/001-auth-api-bridge/api/rest-endpoints.md and
@specs/001-auth-api-bridge/contracts/pydantic-models.md
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from src.api.dependencies import get_current_user, verify_user_ownership
from src.services.task import TaskService
from src.config import engine
from src.models.user import UserTable
from pydantic import BaseModel, Field, constr


# =============================================================================
# Pydantic Models for Request/Response Validation
# Per @specs/001-auth-api-bridge/contracts/pydantic-models.md
# =============================================================================

class TaskCreateRequest(BaseModel):
    """Request model for creating a task."""
    title: constr(min_length=1, max_length=255, strip_whitespace=True) = Field(
        ...,
        description="Task title (1-255 characters)"
    )
    description: Optional[constr(max_length=5000)] = Field(
        None,
        description="Task description (optional, max 5000 characters)"
    )
    priority: str = Field(
        default="medium",
        description="Task priority level: low, medium, or high"
    )


class TaskUpdateRequest(BaseModel):
    """Request model for updating a task."""
    title: Optional[constr(min_length=1, max_length=255, strip_whitespace=True)] = Field(
        None,
        description="Task title (1-255 characters)"
    )
    description: Optional[constr(max_length=5000)] = Field(
        None,
        description="Task description (optional, max 5000 characters)"
    )
    priority: Optional[str] = Field(
        None,
        description="Task priority level: low, medium, or high"
    )


class TaskResponse(BaseModel):
    """Response model for a task."""
    id: UUID = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Task completion status")
    priority: str = Field(..., description="Task priority level")
    created_at: str = Field(..., description="Task creation timestamp (ISO 8601)")
    completed_at: Optional[str] = Field(None, description="Task completion timestamp (ISO 8601)")

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Response model for a list of tasks."""
    tasks: List[TaskResponse] = Field(..., description="List of tasks")
    count: int = Field(..., description="Total number of tasks")


class ErrorDetail(BaseModel):
    """Error detail structure."""
    code: str = Field(..., description="Error code (e.g., UNAUTHORIZED, NOT_FOUND)")
    message: str = Field(..., description="Human-readable error message")
    details: dict = Field(default_factory=dict, description="Additional error context")


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: ErrorDetail


# =============================================================================
# Task Routes with JWT Authentication
# =============================================================================

router = APIRouter()


def ensure_user_exists(session: Session, user_id: UUID) -> None:
    """Create user if they don't exist in the database."""
    user = session.get(UserTable, user_id)
    if user is None:
        # Create user with a placeholder email
        user = UserTable(
            id=user_id,
            email=f"user-{str(user_id)[:8]}@placeholder.com",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(user)
        session.commit()
        print(f"Created new user: {user_id}")


@router.post(
    "/api/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Invalid or missing token"},
        403: {"model": ErrorResponse, "description": "Forbidden - User ID mismatch"},
        400: {"model": ErrorResponse, "description": "Bad Request - Validation error"}
    }
)
async def create_task(
    user_id: str,
    task_data: TaskCreateRequest,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """
    Create a new task for the authenticated user.

    Per @specs/001-auth-api-bridge/api/rest-endpoints.md

    Security:
    - JWT token must be valid and not expired
    - user_id in path must match JWT sub claim (user ownership)
    - Task is automatically assigned to authenticated user
    """
    # Verify user ownership: user_id in path must match authenticated user
    await verify_user_ownership(request, user_id)

    # Create task with user_id from verified JWT
    with Session(engine) as session:
        # Ensure user exists in database
        ensure_user_exists(session, UUID(current_user))

        task = TaskService.create_task(
            session=session,
            user_id=UUID(current_user),
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority
        )

        # Convert datetime objects to ISO 8601 strings for JSON response
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            created_at=task.created_at.isoformat(),
            completed_at=task.completed_at.isoformat() if task.completed_at else None
        )


@router.get(
    "/api/{user_id}/tasks",
    response_model=TaskListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized - Invalid or missing token"},
        403: {"model": ErrorResponse, "description": "Forbidden - User ID mismatch"}
    }
)
async def list_tasks(
    user_id: str,
    request: Request,  # type: ignore
    current_user: str = Depends(get_current_user)
):
    """
    List all tasks for the authenticated user.

    Per @specs/001-auth-api-bridge/api/rest-endpoints.md

    Security:
    - JWT token must be valid
    - user_id in path must match JWT sub claim
    - Only returns tasks owned by authenticated user
    """
    await verify_user_ownership(request, user_id)

    with Session(engine) as session:
        tasks = TaskService.get_user_tasks(session=session, user_id=UUID(current_user))

        return TaskListResponse(
            tasks=[
                TaskResponse(
                    id=task.id,
                    title=task.title,
                    description=task.description,
                    completed=task.completed,
                    priority=task.priority,
                    created_at=task.created_at.isoformat(),
                    completed_at=task.completed_at.isoformat() if task.completed_at else None
                )
                for task in tasks
            ],
            count=len(tasks)
        )


@router.get(
    "/api/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Task belongs to different user"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def get_task(
    user_id: str,
    task_id: str,
    request: Request,  # type: ignore
    current_user: str = Depends(get_current_user)
):
    """
    Get details of a specific task.

    Security:
    - JWT token must be valid
    - user_id in path must match JWT sub claim
    - Task must belong to authenticated user
    """
    await verify_user_ownership(request, user_id)

    with Session(engine) as session:
        task = TaskService.get_task_by_id(
            session=session,
            task_id=UUID(task_id),
            user_id=UUID(current_user)
        )

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            created_at=task.created_at.isoformat(),
            completed_at=task.completed_at.isoformat() if task.completed_at else None
        )


@router.patch(
    "/api/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Task belongs to different user"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def complete_task(
    user_id: str,
    task_id: str,
    request: Request,  # type: ignore
    current_user: str = Depends(get_current_user)
):
    """
    Mark a task as completed.

    Per @specs/001-auth-api-bridge/api/rest-endpoints.md

    Security:
    - JWT token must be valid
    - user_id in path must match JWT sub claim
    - Task must belong to authenticated user

    Idempotent: Can be called multiple times with same result
    """
    await verify_user_ownership(request, user_id)

    with Session(engine) as session:
        task = TaskService.complete_task(
            session=session,
            task_id=UUID(task_id),
            user_id=UUID(current_user)
        )

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            created_at=task.created_at.isoformat(),
            completed_at=task.completed_at.isoformat() if task.completed_at else None
        )


@router.patch(
    "/api/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Task belongs to different user"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def update_task(
    user_id: str,
    task_id: str,
    task_data: TaskUpdateRequest,
    request: Request,  # type: ignore
    current_user: str = Depends(get_current_user)
):
    """
    Update a task's title and/or description.

    Per @specs/001-auth-api-bridge/api/rest-endpoints.md

    Security:
    - JWT token must be valid
    - user_id in path must match JWT sub claim
    - Task must belong to authenticated user
    """
    await verify_user_ownership(request, user_id)

    with Session(engine) as session:
        # Check if at least one field is being updated
        if task_data.title is None and task_data.description is None and task_data.priority is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one field (title, description, or priority) must be provided"
            )

        task = TaskService.update_task(
            session=session,
            task_id=UUID(task_id),
            user_id=UUID(current_user),
            title=task_data.title,
            description=task_data.description,
            priority=task_data.priority
        )

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            priority=task.priority,
            created_at=task.created_at.isoformat(),
            completed_at=task.completed_at.isoformat() if task.completed_at else None
        )



@router.delete(
    "/api/{user_id}/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        403: {"model": ErrorResponse, "description": "Forbidden - Task belongs to different user"},
        404: {"model": ErrorResponse, "description": "Task not found"}
    }
)
async def delete_task(
    user_id: str,
    task_id: str,
    request: Request,  # type: ignore
    current_user: str = Depends(get_current_user)
):
    """
    Delete a task.

    Security:
    - JWT token must be valid
    - user_id in path must match JWT sub claim
    - Task must belong to authenticated user
    """
    await verify_user_ownership(request, user_id)

    with Session(engine) as session:
        success = TaskService.delete_task(
            session=session,
            task_id=UUID(task_id),
            user_id=UUID(current_user)
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return None
