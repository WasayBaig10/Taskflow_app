"""
MCP tool definitions for Todo task management.

Per @specs/001-chatbot-mcp/contracts/mcp-tools.json
All tools enforce user isolation by requiring user_id in every request.
"""
from sqlmodel import Session, select
from typing import Optional, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from src.models.task import TaskTable
from src.config import engine

if TYPE_CHECKING:
    from src.mcp.server import SimpleMCPRegistry


def register_task_tools(mcp_server) -> None:
    """
    Register all task management tools with the MCP server.

    Args:
        mcp_server: The SimpleMCPRegistry instance

    This function is called during MCP server initialization to register
    all 5 task tools: add_task, list_tasks, complete_task, delete_task, update_task.
    Per @specs/001-chatbot-mcp/plan.md, all task operations go through MCP.
    """

    @mcp_server.tool()
    async def add_task(
        user_id: str,
        title: str,
        description: Optional[str] = None
    ) -> dict:
        """
        Create a new todo task for a user.

        Use this when the user requests to create, add, or make a new task.

        Args:
            user_id: ID of the user who will own the task (UUID string)
            title: Task title (short, descriptive name)
            description: Optional detailed description

        Returns:
            Dict with task_id, title, description, created_at, success, error
        """
        try:
            with Session(engine) as session:
                task = TaskTable(
                    user_id=UUID(user_id),
                    title=title,
                    description=description,
                    completed=False,
                    created_at=datetime.utcnow()
                )
                session.add(task)
                session.commit()
                session.refresh(task)

                return {
                    "task_id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "created_at": task.created_at.isoformat(),
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "task_id": None,
                "title": None,
                "description": None,
                "created_at": None,
                "success": False,
                "error": str(e)
            }

    @mcp_server.tool()
    async def list_tasks(
        user_id: str,
        include_completed: bool = True
    ) -> dict:
        """
        List all tasks for a user.

        Use this when the user asks to see, show, or display their tasks.

        Args:
            user_id: ID of the user whose tasks to list (UUID string)
            include_completed: Whether to include completed tasks (default: true)

        Returns:
            Dict with tasks list, count, success, error
        """
        try:
            with Session(engine) as session:
                statement = select(TaskTable).where(TaskTable.user_id == UUID(user_id))

                if not include_completed:
                    statement = statement.where(TaskTable.completed == False)

                tasks = session.exec(statement).all()

                return {
                    "tasks": [
                        {
                            "id": str(task.id),
                            "title": task.title,
                            "description": task.description,
                            "completed": task.completed,
                            "created_at": task.created_at.isoformat(),
                            "completed_at": task.completed_at.isoformat() if task.completed_at else None
                        }
                        for task in tasks
                    ],
                    "count": len(tasks),
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "tasks": [],
                "count": 0,
                "success": False,
                "error": str(e)
            }

    @mcp_server.tool()
    async def complete_task(
        user_id: str,
        task_id: str
    ) -> dict:
        """
        Mark a task as completed.

        Use this when the user asks to complete, finish, or check off a task.

        Args:
            user_id: ID of the user who owns the task (UUID string)
            task_id: ID of the task to mark as complete (UUID string)

        Returns:
            Dict with task_id, title, completed, completed_at, success, error
        """
        try:
            with Session(engine) as session:
                task = session.query(TaskTable).filter(
                    TaskTable.id == UUID(task_id),
                    TaskTable.user_id == UUID(user_id)
                ).first()

                if not task:
                    return {
                        "task_id": task_id,
                        "title": None,
                        "completed": False,
                        "completed_at": None,
                        "success": False,
                        "error": "Task not found or access denied"
                    }

                task.completed = True
                task.completed_at = datetime.utcnow()
                session.add(task)
                session.commit()
                session.refresh(task)

                return {
                    "task_id": str(task.id),
                    "title": task.title,
                    "completed": task.completed,
                    "completed_at": task.completed_at.isoformat(),
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "task_id": task_id,
                "title": None,
                "completed": False,
                "completed_at": None,
                "success": False,
                "error": str(e)
            }

    @mcp_server.tool()
    async def delete_task(
        user_id: str,
        task_id: str
    ) -> dict:
        """
        Delete a task permanently.

        CRITICAL: The task_id parameter must be a valid UUID from the user's existing tasks.
        If the user provides a task number or title, you MUST map it to the correct task_id.
        Example: If user says "delete task 1", find the task with index 0 in their task list and use its ID.
        Always confirm which task you're deleting by showing the task title before proceeding.

        Use this when the user asks to delete, remove, or get rid of a task.

        Args:
            user_id: ID of the user who owns the task (UUID string)
            task_id: ID of the task to delete (UUID string) - must match an existing task ID for this user

        Returns:
            Dict with task_id, title, deleted, success, error
        """
        try:
            with Session(engine) as session:
                task = session.query(TaskTable).filter(
                    TaskTable.id == UUID(task_id),
                    TaskTable.user_id == UUID(user_id)
                ).first()

                if not task:
                    return {
                        "task_id": task_id,
                        "title": None,
                        "deleted": False,
                        "success": False,
                        "error": "Task not found or access denied"
                    }

                title = task.title
                session.delete(task)
                session.commit()

                return {
                    "task_id": task_id,
                    "title": title,
                    "deleted": True,
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "task_id": task_id,
                "title": None,
                "deleted": False,
                "success": False,
                "error": str(e)
            }

    @mcp_server.tool()
    async def update_task(
        user_id: str,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> dict:
        """
        Update a task's title or description.

        CRITICAL: The task_id parameter must be a valid UUID from the user's existing tasks.
        If the user provides a task number or title, you MUST map it to the correct task_id.
        Example: If user says "update task 1 to buy milk", find the task with index 0 in their task list and use its ID.

        Use this when the user asks to change, modify, or edit a task.

        Args:
            user_id: ID of the user who owns the task (UUID string)
            task_id: ID of the task to update (UUID string) - must match an existing task ID for this user
            title: New task title (optional)
            description: New task description (optional, empty string to clear)

        Returns:
            Dict with task_id, title, description, updated_at, success, error
        """
        try:
            with Session(engine) as session:
                task = session.query(TaskTable).filter(
                    TaskTable.id == UUID(task_id),
                    TaskTable.user_id == UUID(user_id)
                ).first()

                if not task:
                    return {
                        "task_id": task_id,
                        "title": None,
                        "description": None,
                        "updated_at": None,
                        "success": False,
                        "error": "Task not found or access denied"
                    }

                if title is not None:
                    task.title = title
                if description is not None:
                    task.description = description if description else None

                session.add(task)
                session.commit()
                session.refresh(task)

                return {
                    "task_id": str(task.id),
                    "title": task.title,
                    "description": task.description,
                    "updated_at": task.created_at.isoformat(),  # Using created_at as updated_at not in model
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "task_id": task_id,
                "title": None,
                "description": None,
                "updated_at": None,
                "success": False,
                "error": str(e)
            }
