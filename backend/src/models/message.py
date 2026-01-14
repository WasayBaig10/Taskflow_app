"""
Message model representing a single message in a conversation.

Per @specs/001-chatbot-mcp/data-model.md
"""
from sqlmodel import SQLModel, Field, Relationship, Column
from typing import TYPE_CHECKING, Optional, Any, Dict
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from sqlalchemy import JSON

if TYPE_CHECKING:
    from src.models.conversation import ConversationTable


class MessageRole(str, Enum):
    """Message sender role."""
    USER = "user"
    ASSISTANT = "assistant"


class MessageTable(SQLModel, table=True):
    """
    A single message in a conversation.

    Messages are owned by a user through their conversation. All queries MUST
    filter by user_id (via conversation) to ensure data isolation.
    """
    __tablename__ = "messages"

    # Primary key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique message identifier"
    )

    # Foreign key to Conversation
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        index=True,
        nullable=False,
        description="ID of the conversation this message belongs to"
    )

    # Message attributes
    role: MessageRole = Field(
        nullable=False,
        description="Message sender: 'user' or 'assistant'"
    )

    content: str = Field(
        nullable=False,
        max_length=5000,
        description="Message content (plaintext)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Timestamp when message was created"
    )

    # Optional metadata for tool calls, token usage, etc.
    # Renamed from 'metadata' to avoid conflict with SQLAlchemy's reserved attribute
    tool_metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Tool calls, tokens used, error information"
    )

    # Relationships
    conversation: "ConversationTable" = Relationship(back_populates="messages")
