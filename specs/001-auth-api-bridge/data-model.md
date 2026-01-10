# Data Model

**Feature**: 001-auth-api-bridge
**Date**: 2026-01-07
**Purpose**: Define entity relationships, validation rules, and state transitions

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (UUID) PK    │◄──────┐
│ email           │       │
│ name            │       │
│ created_at      │       │ 1
│ updated_at      │       │
└─────────────────┘       │
                           │
                           │ N
                   ┌───────┴────────┐
                   │     Task       │
                   ├────────────────┤
                   │ id (UUID) PK   │
                   │ user_id (FK)   │
                   │ title          │
                   │ description    │
                   │ completed      │
                   │ created_at     │
                   │ completed_at   │
                   └────────────────┘
```

## Entities

### User

Represents an authenticated user managed by Better Auth.

**Table Name**: `users`

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique user identifier (matches JWT `sub` claim) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEXED | User's email address |
| `name` | VARCHAR(255) | NULLABLE | User's display name |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT=now() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT=now(), ON UPDATE=now() | Last update timestamp |

**Relationships**:
- One-to-Many with Task (one user has many tasks)

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE index on `email`
- Standard btree index on `id` for foreign key lookups

### Task

Represents a task owned by a user.

**Table Name**: `tasks`

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, NOT NULL | Unique task identifier |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL, INDEXED | Owner of this task |
| `title` | VARCHAR(255) | NOT NULL | Short task title |
| `description` | TEXT | NULLABLE | Detailed task description |
| `completed` | BOOLEAN | NOT NULL, DEFAULT=false, INDEXED | Task completion status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT=now() | Task creation timestamp |
| `completed_at` | TIMESTAMPTZ | NULLABLE, INDEXED | Timestamp when task was completed |

**Relationships**:
- Many-to-One with User (many tasks belong to one user)

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `user_id` (for user-scoped queries)
- COMPOSITE INDEX on `(user_id, completed)` (for filtering incomplete tasks)
- INDEX on `completed_at` (for temporal queries)

**Constraints**:
- `completed_at` must be NULL if `completed` is false
- `completed_at` must be > `created_at` if not NULL

## Validation Rules

### Task Title

- **Required**: Must not be NULL
- **Length**: 1-255 characters
- **Content**: Cannot be empty or whitespace-only
- **Sanitization**: Trim leading/trailing whitespace

```python
title: str = Field(..., min_length=1, max_length=255)
```

### Task Description

- **Optional**: May be NULL
- **Length**: Maximum 5000 characters
- **Content**: Free-form text

```python
description: Optional[str] = Field(None, max_length=5000)
```

### User ID

- **Required**: Must not be NULL
- **Format**: Valid UUID
- **Foreign Key**: Must reference existing `users.id`
- **Authorization**: Must match JWT `sub` claim

```python
user_id: UUID = Field(foreign_key="users.id")
```

### Completion Timestamp

- **Conditional**: Required only when `completed=true`
- **Logic**: Must be after `created_at`
- **Idempotent**: Setting to same value is allowed

```python
@validator('completed_at')
def validate_completion_timestamp(cls, v, values):
    if v is not None:
        if not values.get('completed', False):
            raise ValueError("completed_at can only be set when completed is True")
        if v < values.get('created_at'):
            raise ValueError("completed_at cannot be before created_at")
    return v
```

## State Transitions

### Task Lifecycle

```
┌─────────┐
│ Created │
│completed│
│= false  │
└────┬────┘
     │
     │ Mark as complete
     │ (PATCH /tasks/{id}/complete)
     │
     ▼
┌─────────┐
│Completed│
│completed│
│= true   │◄─────┐
└─────────┘      │
                 │ Re-mark complete
                 │ (idempotent - no state change)
                 └─────────────────┘
```

**Transition Rules**:

1. **Created → Completed**: Allowed via PATCH `/api/{user_id}/tasks/{task_id}/complete`
   - Sets `completed=true`
   - Sets `completed_at=now()`
   - Transition is irreversible for this implementation

2. **Completed → Completed**: Idempotent operation
   - Re-completing returns current state (200 OK)
   - No error, but `completed_at` timestamp not updated

3. **No Delete State**: Task deletion is handled separately via DELETE endpoint
   - Soft delete recommended (add `deleted_at` column in future)

## SQLModel Implementation

### User Model

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import TYPE_CHECKING, List
from datetime import datetime
from uuid import UUID, uuid4

class UserTable(SQLModel, table=True):
    """User account managed by Better Auth."""
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: str | None = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationships
    tasks: List["TaskTable"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
```

### Task Model

```python
class TaskTable(SQLModel, table=True):
    """Task owned by a user."""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=255, nullable=False)
    description: str | None = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    completed_at: datetime | None = Field(default=None, index=True, nullable=True)

    # Relationships
    user: "UserTable" = Relationship(back_populates="tasks")
```

## Database Migration

### Initial Migration

```python
# alembic/versions/001_initial_schema.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_id", "users", ["id"])

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])
    op.create_index("ix_tasks_id", "tasks", ["id"])
    op.create_index("ix_tasks_user_completed", "tasks", ["user_id", "completed"])
    op.create_index("ix_tasks_completed_at", "tasks", ["completed_at"])

def downgrade():
    op.drop_table("tasks")
    op.drop_table("users")
```

## Query Patterns

### Get All Tasks for User

```python
def get_user_tasks(session: Session, user_id: UUID) -> List[TaskTable]:
    """Retrieve all tasks for a specific user."""
    statement = select(TaskTable).where(TaskTable.user_id == user_id)
    return session.exec(statement).all()
```

### Get Incomplete Tasks

```python
def get_incomplete_tasks(session: Session, user_id: UUID) -> List[TaskTable]:
    """Retrieve incomplete tasks for a user."""
    statement = select(TaskTable).where(
        TaskTable.user_id == user_id,
        TaskTable.completed == False
    )
    return session.exec(statement).all()
```

### Get Task by ID (with Ownership Check)

```python
def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> TaskTable | None:
    """Retrieve a task if it belongs to the user."""
    statement = select(TaskTable).where(
        TaskTable.id == task_id,
        TaskTable.user_id == user_id  # Critical for security
    )
    return session.exec(statement).first_or_none()
```

### Complete Task

```python
def complete_task(session: Session, task_id: UUID, user_id: UUID) -> TaskTable | None:
    """Mark a task as completed."""
    task = get_task_by_id(session, task_id, user_id)
    if task:
        task.completed = True
        task.completed_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
    return task
```

## Cascading Deletes

When a user is deleted, all their tasks are automatically deleted:

```python
Relationship(
    back_populates="user",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"}
)
```

**Database-level enforcement**:
```sql
ON DELETE CASCADE on tasks.user_id → users.id
```

**Rationale**: Maintains referential integrity; orphaned tasks serve no purpose.

## Future Extensions

### Potential Schema Evolution

1. **Soft Deletes**: Add `deleted_at` timestamp instead of hard deletes
2. **Task Priorities**: Add `priority` field (low, medium, high)
3. **Due Dates**: Add `due_date` timestamp
4. **Categories**: Add `category_id` foreign key to categories table
5. **Collaborators**: Add `task_collaborators` junction table for shared tasks

### Migration Strategy

- Use Alembic for all schema changes
- Never modify existing migrations (create new ones)
- Test migrations on copy of production data
- Keep migrations backward-compatible when possible
