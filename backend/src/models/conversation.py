"""
Conversation model representing a user's chat session with AI.

Per @specs/001-chatbot-mcp/data-model.md
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional
from datetime import datetime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from src.models.user import UserTable
    from src.models.message import MessageTable


class ConversationTable(SQLModel, table=True):
    """
    A chat session between a user and the AI assistant.

    All conversations MUST be scoped to a single user to ensure data isolation
    per constitutional principle III (User Isolation via JWT).
    """
    __tablename__ = "conversations"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique conversation identifier"
    )

    # Foreign key to User
    user_id: UUID = Field(
        foreign_key="users.id",
        index=True,
        nullable=False,
        description="ID of the user who owns this conversation"
    )

    # Conversation attributes
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Auto-generated title from first message (e.g., 'Grocery shopping')"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when conversation was created"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow},
        nullable=False,
        index=True,
        description="Timestamp of last message in conversation"
    )

    # Relationships
    user: "UserTable" = Relationship(back_populates="conversations")
    messages: list["MessageTable"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
