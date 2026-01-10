# Pydantic Models

**Feature**: 001-auth-api-bridge
**Date**: 2026-01-07
**Purpose**: Define request/response models with validation

## Request Models

### TaskCreateRequest

Create a new task.

```python
from pydantic import BaseModel, Field, constr

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

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Complete project documentation",
                    "description": "Write comprehensive docs for the auth bridge feature"
                }
            ]
        }
    }
```

### CompleteTaskRequest

Mark a task as complete (empty body).

```python
class CompleteTaskRequest(BaseModel):
    """Request model for marking a task as complete (no fields required)."""
    pass

    model_config = {
        "json_schema_extra": {
            "examples": [{}]
        }
    }
```

## Response Models

### TaskResponse

Single task representation.

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class TaskResponse(BaseModel):
    """Response model for a task."""
    id: UUID = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Task completion status")
    created_at: datetime = Field(..., description="Task creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Task completion timestamp")

    model_config = {
        "from_attributes": True,  # Allows creation from ORM models
        "json_schema_extra": {
            "examples": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440000",
                    "title": "Complete project documentation",
                    "description": "Write comprehensive docs for the auth bridge feature",
                    "completed": False,
                    "created_at": "2026-01-07T10:00:00Z",
                    "completed_at": None
                },
                {
                    "id": "660e8400-e29b-41d4-a716-446655440001",
                    "title": "Setup development environment",
                    "description": None,
                    "completed": True,
                    "created_at": "2026-01-07T09:00:00Z",
                    "completed_at": "2026-01-07T11:30:00Z"
                }
            ]
        }
    }
```

### TaskListResponse

Collection of tasks.

```python
class TaskListResponse(BaseModel):
    """Response model for a list of tasks."""
    tasks: List[TaskResponse] = Field(..., description="List of tasks")
    count: int = Field(..., description="Total number of tasks")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "tasks": [
                        {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "title": "Complete project documentation",
                            "description": "Write comprehensive docs",
                            "completed": False,
                            "created_at": "2026-01-07T10:00:00Z",
                            "completed_at": None
                        }
                    ],
                    "count": 1
                }
            ]
        }
    }
```

## Error Models

### ErrorResponse

Standard error response format.

```python
from typing import Dict, Any

class ErrorDetail(BaseModel):
    """Error detail structure."""
    code: str = Field(..., description="Error code (e.g., UNAUTHORIZED, NOT_FOUND)")
    message: str = Field(..., description="Human-readable error message")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional error context")

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: ErrorDetail

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid or expired authentication token",
                        "details": {}
                    }
                },
                {
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": "Request validation failed",
                        "details": {
                            "title": "Field required"
                        }
                    }
                },
                {
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Task not found",
                        "details": {
                            "task_id": "550e8400-e29b-41d4-a716-446655440000"
                        }
                    }
                }
            ]
        }
    }
```

## Health Check Models

### HealthResponse

Health check endpoint response.

```python
class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status (healthy/unhealthy)")
    database: str = Field(..., description="Database connection status")
    version: str = Field(..., description="API version")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "healthy",
                    "database": "connected",
                    "version": "1.0.0"
                }
            ]
        }
    }
```

## Complete Model Export

```python
# models/pydantic.py
"""
Pydantic models for request/response validation.

All models include:
- Type hints for IDE support
- Field validation with constraints
- Descriptions for OpenAPI documentation
- Example values for testing
"""

from pydantic import BaseModel, Field, constr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

class TaskCreateRequest(BaseModel):
    """Request model for creating a task."""
    title: constr(min_length=1, max_length=255, strip_whitespace=True)
    description: Optional[constr(max_length=5000)] = None

class CompleteTaskRequest(BaseModel):
    """Request model for marking a task as complete."""
    pass

class TaskResponse(BaseModel):
    """Response model for a task."""
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}

class TaskListResponse(BaseModel):
    """Response model for a list of tasks."""
    tasks: List[TaskResponse]
    count: int

class ErrorDetail(BaseModel):
    """Error detail structure."""
    code: str
    message: str
    details: Dict[str, Any] = Field(default_factory=dict)

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: ErrorDetail

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    database: str
    version: str
```

## Validation Rules Summary

| Model | Field | Validation | Error Message |
|-------|-------|------------|---------------|
| TaskCreateRequest | title | min_length=1, max_length=255 | "Title must be 1-255 characters" |
| TaskCreateRequest | description | max_length=5000 | "Description must be ≤5000 characters" |
| TaskResponse | id | UUID format | "Invalid UUID format" |
| TaskResponse | created_at | ISO 8601 datetime | "Invalid datetime format" |
| TaskResponse | completed_at | Nullable ISO 8601 | "Invalid datetime format" |

## OpenAPI Schema

These models auto-generate the following OpenAPI schema:

```yaml
components:
  schemas:
    TaskCreateRequest:
      type: object
      required:
        - title
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 255
        description:
          type: string
          maxLength: 5000

    TaskResponse:
      type: object
      required:
        - id
        - title
        - completed
        - created_at
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        completed:
          type: boolean
        created_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
          nullable: true

    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object
```
