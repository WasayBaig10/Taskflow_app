# Data Model: Todo AI Chatbot

**Feature**: 001-chatbot-mcp
**Date**: 2026-01-11
**Status**: Final

## Overview

This document defines the database schema for the AI Chatbot feature, adding two new tables (`conversations` and `messages`) to the existing Todo application database. All models enforce user data isolation per constitutional principle III.

## Entities

### Conversation

A chat session between a user and the AI assistant.

**Table Name**: `conversations`

**Fields**:

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | UUID | PK, indexed | Unique conversation identifier |
| `user_id` | UUID | FK → users.id, indexed, NOT NULL | Owner of the conversation |
| `title` | VARCHAR(255) | NULLABLE | Auto-generated from first message (e.g., "Grocery shopping") |
| `created_at` | TIMESTAMPTZ | NOT NULL, default=now() | Conversation creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default=now(), onupdate=now() | Last message timestamp |

**Relationships**:
- `user_id` → `users.id` (Many-to-One: A user has many conversations)
- One-to-Many with `messages` (A conversation has many messages)

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `(user_id, updated_at DESC)` for fetching user's recent conversations
- INDEX: `user_id` for user isolation queries

**Validation Rules**:
- `title` max length: 255 characters
- `user_id` must exist in `users` table (foreign key constraint)

---

### Message

A single message within a conversation, either from the user or the AI assistant.

**Table Name**: `messages`

**Fields**:

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | UUID | PK, indexed | Unique message identifier |
| `conversation_id` | UUID | FK → conversations.id, indexed, NOT NULL | Parent conversation |
| `role` | VARCHAR(20) | NOT NULL, check constraint | Message sender: 'user' or 'assistant' |
| `content` | TEXT | NOT NULL | Message content (max 5000 chars) |
| `created_at` | TIMESTAMPTZ | NOT NULL, default=now() | Message timestamp |
| `metadata` | JSONB | NULLABLE | Tool calls, token usage, error info |

**Relationships**:
- `conversation_id` → `conversations.id` (Many-to-One: A message belongs to one conversation)
- Many-to-One with `users` through `conversations`

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `(conversation_id, created_at ASC)` for fetching conversation history in order
- INDEX: `conversation_id` for conversation membership queries

**Validation Rules**:
- `role` must be either 'user' or 'assistant' (CHECK constraint)
- `content` max length: 5000 characters (enforced at application level)
- `conversation_id` must exist in `conversations` table (foreign key constraint)

**Metadata Schema** (optional):
```json
{
  "tool_calls": [
    {
      "tool_name": "add_task",
      "tool_args": {"user_id": "...", "title": "Buy groceries"},
      "result": {"task_id": "...", "success": true}
    }
  ],
  "tokens_used": 150,
  "model": "gpt-4-turbo-preview",
  "error": null
}
```

---

## Relationship Diagram

```
┌─────────────┐
│    users    │
│             │
│ - id (PK)   │┐
│ - email     ││
│ - name      ││
└─────────────┘│
              │
              │ 1:N
              │
              │┌─────────────────┐       1:N       ┌──────────────┐
              ││  conversations  │◄──────────────┤│   messages   │
              ││                 │                 ││              │
              ││ - id (PK)       │                 ││ - id (PK)    │
              ││ - user_id (FK)  │                 ││ - conv_id(FK)│
              ││ - title         │                 ││ - role       │
              ││ - created_at    │                 ││ - content    │
              ││ - updated_at    │                 ││ - created_at │
              │└─────────────────┘                 ││ - metadata   │
              │                                   └──────────────┘
              │
              │ 1:N (existing relationship)
              │
              ▼
┌─────────────┐
│    tasks    │
│             │
│ - id (PK)   │
│ - user_id   │
│ - title     │
│ - desc      │
│ - completed │
│ - created_at│
└─────────────┘
```

## SQLModel Implementation

### Conversation Model

```python
# backend/src/models/conversation.py
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
```

### Message Model

```python
# backend/src/models/message.py
"""
Message model representing a single message in a conversation.

Per @specs/001-chatbot-mcp/data-model.md
"""
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, Optional, Any, Dict
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

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
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSONB),
        description="Tool calls, tokens used, error information"
    )

    # Relationships
    conversation: "ConversationTable" = Relationship(back_populates="messages")
```

### Updated User Model

```python
# backend/src/models/user.py (UPDATE)

# Add conversations relationship to existing UserTable
class UserTable(SQLModel, table=True):
    # ... existing fields ...

    # Relationships
    tasks: List["TaskTable"] = Relationship(back_populates="user")
    conversations: List["ConversationTable"] = Relationship(  # NEW
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

## Migration Script (Alembic)

```python
# alembic/versions/001_add_chatbot_tables.py
"""Add conversation and message tables

Revision ID: 001
Revises:
Create Date: 2026-01-11

"""
from alembic import op
import sqlalchemy as sa
from sqlmodel import SQLModel
import uuid

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'])
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'])
    op.create_index(op.f('ix_conversations_user_id_updated_at'), 'conversations', ['user_id', sa.text('updated_at DESC')])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('conversation_id', sa.UUID(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(), nullable=False),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='check_message_role')
    )
    op.create_index(op.f('ix_messages_id'), 'messages', ['id'])
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'])
    op.create_index(op.f('ix_messages_conversation_id_created_at'), 'messages', ['conversation_id', sa.text('created_at ASC')])


def downgrade() -> None:
    op.drop_index(op.f('ix_messages_conversation_id_created_at'), table_name='messages')
    op.drop_index(op.f('ix_messages_conversation_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_id'), table_name='messages')
    op.drop_table('messages')

    op.drop_index(op.f('ix_conversations_user_id_updated_at'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
```

## Query Patterns

### Fetch User's Conversations (with latest message preview)

```python
from sqlmodel import select, Session
from src.models.conversation import ConversationTable
from src.models.message import MessageTable

def get_user_conversations(session: Session, user_id: UUID, limit: int = 20):
    """Get user's conversations ordered by most recent activity."""
    stmt = (
        select(ConversationTable)
        .where(ConversationTable.user_id == user_id)
        .order_by(ConversationTable.updated_at.desc())
        .limit(limit)
    )
    return session.exec(stmt).all()
```

### Fetch Conversation History (for AI context)

```python
def get_conversation_history(session: Session, conversation_id: UUID, user_id: UUID, limit: int = 50):
    """Get conversation messages for AI context, scoped to user."""
    # First verify conversation ownership
    conv_stmt = (
        select(ConversationTable)
        .where(ConversationTable.id == conversation_id)
        .where(ConversationTable.user_id == user_id)
    )
    conversation = session.exec(conv_stmt).first_or_none()

    if not conversation:
        raise ValueError("Conversation not found or access denied")

    # Fetch messages
    msg_stmt = (
        select(MessageTable)
        .where(MessageTable.conversation_id == conversation_id)
        .order_by(MessageTable.created_at.asc())
        .limit(limit)
    )
    return session.exec(msg_stmt).all()
```

### Create New Conversation with First Message

```python
def create_conversation_with_message(session: Session, user_id: UUID, user_message: str):
    """Create a new conversation with the user's first message."""
    import uuid

    # Create conversation
    conversation = ConversationTable(
        id=uuid.uuid4(),
        user_id=user_id,
        title=user_message[:50] + "..." if len(user_message) > 50 else user_message
    )
    session.add(conversation)

    # Create user message
    message = MessageTable(
        id=uuid.uuid4(),
        conversation_id=conversation.id,
        role=MessageRole.USER,
        content=user_message
    )
    session.add(message)

    session.commit()
    session.refresh(conversation)

    return conversation
```

## Performance Considerations

1. **Index Coverage**:
   - `(user_id, updated_at DESC)` index supports fetching user's conversations
   - `(conversation_id, created_at ASC)` index supports conversation history queries

2. **Query Optimization**:
   - Limit conversation history to 50 messages (configurable)
   - Use LRU caching for active conversations (see research.md)
   - Consider partitioning `messages` table by `conversation_id` for large scale

3. **Storage Growth**:
   - Average message size: ~200 chars → ~200 bytes
   - 100 messages per conversation × 1000 users = ~20 MB (negligible)
   - Consider archival policy for conversations older than 90 days

## Security & Data Isolation

**Per Constitutional Principle III**:

1. **User Scoping**: All queries MUST filter by `user_id`
2. **Conversation Ownership**: Validate `conversation.user_id == request.user_id` before access
3. **No Cross-User Access**: Reject any attempt to access another user's conversations
4. **Audit Logging**: Log all conversation/message access with user_id for debugging

**Example Guard**:
```python
def verify_conversation_access(session: Session, conversation_id: UUID, user_id: UUID):
    """Verify user owns this conversation or raise HTTP 403."""
    conversation = session.get(ConversationTable, conversation_id)
    if not conversation or conversation.user_id != user_id:
        raise HTTPException(status_code=403, detail="Conversation not found")
    return conversation
```
