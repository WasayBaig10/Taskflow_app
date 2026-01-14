"""
Task CRUD service with user isolation.

Per @specs/001-auth-api-bridge/data-model.md and @specs/001-auth-api-bridge/api/rest-endpoints.md
"""
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from uuid import UUID

from src.models.task import TaskTable
from src.config import engine


class TaskService:
    """Service for task CRUD operations with enforced user isolation."""

    @staticmethod
    def get_user_tasks(session: Session, user_id: UUID) -> List[TaskTable]:
        """
        Retrieve all tasks for a specific user.

        Per @specs/001-auth-api-bridge/data-model.md query patterns
        """
        statement = select(TaskTable).where(TaskTable.user_id == user_id)
        return session.exec(statement).all()

    @staticmethod
    def get_task_by_id(session: Session, task_id: UUID, user_id: UUID) -> Optional[TaskTable]:
        """
        Retrieve a task if it belongs to the user.

        Critical for security - enforces user ownership check.
        Per @specs/001-auth-api-bridge/data-model.md
        """
        return session.query(TaskTable).filter(
            TaskTable.id == task_id,
            TaskTable.user_id == user_id  # Critical for security
        ).first()

    @staticmethod
    def create_task(session: Session, user_id: UUID, title: str, description: Optional[str], priority: str = "medium") -> TaskTable:
        """
        Create a new task for the user.

        Args:
            session: Database session
            user_id: Owner's user ID (from JWT)
            title: Task title
            description: Optional task description
            priority: Task priority level (low, medium, high) - defaults to medium

        Returns:
            Created task with user_id set
        """
        task = TaskTable(
            user_id=user_id,  # From verified JWT
            title=title,
            description=description,
            priority=priority,
            completed=False,
            created_at=datetime.utcnow()
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        return task

    @staticmethod
    def complete_task(session: Session, task_id: UUID, user_id: UUID) -> Optional[TaskTable]:
        """
        Mark a task as completed.

        Args:
            session: Database session
            task_id: Task to complete
            user_id: User requesting completion (for ownership verification)

        Returns:
            Updated task if found and owned by user, None otherwise
        """
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            task.completed = True
            task.completed_at = datetime.utcnow()
            session.add(task)
            session.commit()
            session.refresh(task)
        return task

    @staticmethod
    def delete_task(session: Session, task_id: UUID, user_id: UUID) -> bool:
        """
        Delete a task if it belongs to the user.

        Args:
            session: Database session
            task_id: Task to delete
            user_id: User requesting deletion (for ownership verification)

        Returns:
            True if deleted, False if not found
        """
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            session.delete(task)
            session.commit()
            return True
        return False

    @staticmethod
    def update_task(session: Session, task_id: UUID, user_id: UUID, title: Optional[str] = None, description: Optional[str] = None, priority: Optional[str] = None) -> Optional[TaskTable]:
        """
        Update a task's title, description, and/or priority if it belongs to the user.

        Args:
            session: Database session
            task_id: Task to update
            user_id: User requesting update (for ownership verification)
            title: New title (optional)
            description: New description (optional)
            priority: New priority level (optional)

        Returns:
            Updated task if found and owned by user, None otherwise
        """
        task = TaskService.get_task_by_id(session, task_id, user_id)
        if task:
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if priority is not None:
                task.priority = priority
            session.add(task)
            session.commit()
            session.refresh(task)
        return task


