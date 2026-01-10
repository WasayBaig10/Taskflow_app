# Database Schema Specification

**Feature**: 001-auth-api-bridge
**Purpose**: Define SQLModel classes for User and Task entities with proper relationships
**Version**: 1.0.0
**Database**: Neon PostgreSQL (serverless)
**ORM**: SQLModel (built on Pydantic and SQLAlchemy)

## Schema Overview

The database consists of two primary tables:

1. **`users`** - User accounts (managed by Better Auth, referenced by our application)
2. **`tasks`** - Task items owned by users

## Entity Definitions

### User Model

The User table represents authenticated users. Note that user creation and authentication are managed by Better Auth - our application only references these users.

```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class UserTable(SQLModel, table=True):
    """
    Database table for users.

    Note: This table may be managed by Better Auth or synchronized from it.
    The application treats it as read-only for user account management.
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

    name: Optional[str] = Field(
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
    # tasks: List["TaskTable"] = Relationship(back_populates="user")
```

**Considerations:**
- The `id` field (UUID) MUST match the `sub` claim in JWT tokens issued by Better Auth
- Better Auth may manage this table directly; our application primarily reads from it
- Email uniqueness is enforced at the database level

### Task Model

The Task table represents individual tasks owned by users.

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from uuid import UUID, uuid4

if TYPE_CHECKING:
    from .user import UserTable

class TaskTable(SQLModel, table=True):
    """
    Database table for tasks.

    Each task belongs to exactly one user. All queries MUST filter by user_id
    to ensure data isolation.
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
```

## Relationship Configuration

To establish the bidirectional relationship between User and Task:

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from uuid import UUID, uuid4

class UserTable(SQLModel, table=True):
    """User table with relationship to tasks."""
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to tasks
    tasks: List["TaskTable"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class TaskTable(SQLModel, table=True):
    """Task table with relationship to user."""
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=255, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    completed_at: Optional[datetime] = Field(default=None, nullable=True, index=True)

    # Relationship to user
    user: "UserTable" = Relationship(back_populates="tasks")
```

**Cascade Behavior:**
- `cascade="all, delete-orphan"` ensures that when a user is deleted, all their tasks are also deleted
- This maintains referential integrity

## Database Indexes

Recommended indexes for performance:

```sql
-- User table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_id ON users(id);

-- Task table indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_id ON tasks(id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at) WHERE completed_at IS NOT NULL;
```

**Rationale:**
- `idx_tasks_user_id`: Critical for all user-scoped queries (most queries)
- `idx_tasks_user_completed`: Optimizes queries like "show incomplete tasks for user"
- `idx_tasks_completed_at`: Supports queries filtering by completion date
- Composite indexes support common query patterns

## Pydantic Models for API

These Pydantic models separate the database schema from API contract:

```python
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

# Request models
class TaskCreateRequest(BaseModel):
    """Request model for creating a task."""
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=5000, description="Task description")


class TaskUpdateRequest(BaseModel):
    """Request model for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    completed: Optional[bool] = None


class CompleteTaskRequest(BaseModel):
    """Request model for marking a task as complete (empty body)."""
    pass


# Response models
class TaskResponse(BaseModel):
    """Response model for task data."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(..., description="Unique task identifier")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Task completion status")
    created_at: datetime = Field(..., description="Task creation timestamp")
    completed_at: Optional[datetime] = Field(None, description="Task completion timestamp")


class TaskListResponse(BaseModel):
    """Response model for a list of tasks."""
    tasks: list[TaskResponse]
    count: int = Field(..., description="Total number of tasks")


# User models (if needed)
class UserResponse(BaseModel):
    """Response model for user data."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID = Field(..., description="Unique user identifier")
    email: str = Field(..., description="User email")
    name: Optional[str] = Field(None, description="User display name")
```

## Data Isolation Constraints

### Database-Level Isolation

While application logic enforces user isolation, we can add database-level safeguards:

**Option 1: Row-Level Security (PostgreSQL)**

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own tasks
CREATE POLICY task_isolation_policy ON tasks
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

**Implementation in FastAPI:**
```python
from sqlalchemy import event
from sqlalchemy.engine import Connection

@event.listens_for("engine_connect", before_execute=True)
def set_user_id(conn: Connection, ...):
    """Set the current user_id for RLS."""
    # This would be set from the JWT token in application code
    user_id = getattr(conn.info, 'current_user_id', None)
    if user_id:
        conn.execute(f"SET LOCAL app.current_user_id = '{user_id}'")
```

**Option 2: Application-Only Isolation**

Rely on ORM and middleware to enforce isolation (simpler, more common):

```python
# Always filter by user_id in queries
def get_tasks(session: Session, user_id: UUID):
    return session.exec(
        select(TaskTable).where(TaskTable.user_id == user_id)
    ).all()
```

**Recommendation:** Start with application-only isolation for simplicity. Add RLS if security requirements increase.

## Migration Strategy

### Initial Migration

```python
from sqlmodel import SQLModel, create_engine, Session

# Create engine
DATABASE_URL = "postgresql://user:password@host/dbname"
engine = create_engine(DATABASE_URL)

# Create all tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
```

### Alembic Migrations (Recommended for Production)

```python
# alembic/versions/001_initial.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_id", "users", ["id"])

    op.create_table(
        "tasks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("completed", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )
    op.create_index("idx_tasks_user_id", "tasks", ["user_id"])
    op.create_index("idx_tasks_id", "tasks", ["id"])
    op.create_index("idx_tasks_user_completed", "tasks", ["user_id", "completed"])
    op.create_index("idx_tasks_completed_at", "tasks", ["completed_at"])

def downgrade():
    op.drop_table("tasks")
    op.drop_table("users")
```

## Data Validation Rules

### Task Validation

```python
from sqlmodel import Field, valiator
from datetime import datetime

class TaskTable(SQLModel, table=True):
    # ... fields ...

    @validator('completed_at')
    def validate_completion_timestamp(cls, v, values):
        """Ensure completed_at is set only when completed is True."""
        if v is not None and not values.get('completed', False):
            raise ValueError("completed_at can only be set when completed is True")
        if v is not None and v < values.get('created_at', datetime.utcnow()):
            raise ValueError("completed_at cannot be before created_at")
        return v

    @validator('title')
    def validate_title(cls, v):
        """Ensure title is not empty or whitespace-only."""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip()
```

## Query Patterns

### Common Queries

```python
from sqlmodel import Session, select
from uuid import UUID
from typing import List, Optional

# Get all tasks for a user
def get_user_tasks(session: Session, user_id: UUID) -> List[TaskTable]:
    statement = select(TaskTable).where(TaskTable.user_id == user_id)
    return session.exec(statement).all()

# Get incomplete tasks for a user
def get_incomplete_tasks(session: Session, user_id: UUID) -> List[TaskTable]:
    statement = select(TaskTable).where(
        TaskTable.user_id == user_id,
        TaskTable.completed == False
    )
    return session.exec(statement).all()

# Get a specific task (with ownership verification)
def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> Optional[TaskTable]:
    statement = select(TaskTable).where(
        TaskTable.id == task_id,
        TaskTable.user_id == user_id  # Critical for security
    )
    return session.exec(statement).first_or_none()

# Mark task as complete
def complete_task(session: Session, task_id: UUID, user_id: UUID) -> Optional[TaskTable]:
    task = get_task_by_id(session, task_id, user_id)
    if task:
        task.completed = True
        task.completed_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)
    return task
```

## Summary

- **Users table**: Stores user accounts (id matches JWT `sub` claim)
- **Tasks table**: Stores tasks with foreign key to users
- **Relationships**: One-to-many (User → Tasks)
- **Security**: All queries MUST filter by `user_id`
- **Indexes**: Optimized for user-scoped queries
- **Models**: Separate database models from API Pydantic models
