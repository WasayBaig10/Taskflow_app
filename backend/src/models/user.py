"""
User model representing authenticated users managed by Better Auth.

Per @specs/001-auth-api-bridge/data-model.md
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, List
from datetime import datetime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from src.models.task import TaskTable
    from src.models.conversation import ConversationTable


class UserTable(SQLModel, table=True):
    """
    User account managed by Better Auth.

    The id field (UUID) MUST match the 'sub' claim in JWT tokens issued by Better Auth.
    """
    __tablename__ = "users"

    # Primary key - matches the 'sub' claim in JWT tokens
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique user identifier that matches JWT 'sub' claim"
    )

    # User profile information
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address (unique)"
    )

    name: str | None = Field(
        default=None,
        max_length=255,
        description="User's display name"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when user account was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        description="Timestamp when user record was last updated"
    )

    # Relationships
    tasks: List["TaskTable"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    conversations: List["ConversationTable"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
