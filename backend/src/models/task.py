"""
Task model representing user tasks.

Per @specs/001-auth-api-bridge/data-model.md
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
from datetime import datetime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from src.models.user import UserTable


class TaskTable(SQLModel, table=True):
    """
    Task owned by a user.

    Each task belongs to exactly one user. All queries MUST filter by user_id
    to ensure data isolation per constitutional principle.
    """
    __tablename__ = "tasks"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique task identifier"
    )

    # Foreign key to User
    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False,
        description="ID of the user who owns this task"
    )

    # Task attributes
    title: str = Field(
        max_length=255,
        nullable=False,
        description="Short title of the task"
    )

    description: Optional[str] = Field(
        default=None,
        max_length=5000,
        description="Detailed description of the task (optional)"
    )

    # Completion status
    completed: bool = Field(
        default=False,
        index=True,
        description="Whether the task has been completed"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when task was created"
    )

    completed_at: Optional[datetime] = Field(
        default=None,
        nullable=True,
        index=True,
        description="Timestamp when task was marked as completed (null until completed)"
    )

    # Relationships
    user: "UserTable" = Relationship(back_populates="tasks")
