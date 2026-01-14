"""
Chat API Pydantic schemas for request/response validation.

Per @specs/001-chatbot-mcp/contracts/openapi.yaml
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# =============================================================================
# Request Schemas
# =============================================================================

class ChatRequest(BaseModel):
    """
    Request schema for chat endpoint.

    Per @specs/001-chatbot-mcp/contracts/openapi.yaml
    """
    conversation_id: Optional[UUID] = Field(
        default=None,
        description="Optional conversation ID to continue existing chat. If not provided, a new conversation is created."
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's message content"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": None,
                "message": "Add a task to buy groceries"
            }
        }


# =============================================================================
# Response Schemas
# =============================================================================

class Message(BaseModel):
    """
    Message schema for chat responses.

    Represents a single message in the conversation.
    Per @specs/001-chatbot-mcp/data-model.md
    """
    id: UUID = Field(..., description="Unique message identifier")
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    created_at: datetime = Field(..., description="Timestamp when message was created")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "role": "assistant",
                "content": "I've added a task 'Buy groceries' to your list.",
                "created_at": "2026-01-11T22:00:00Z"
            }
        }


class TaskSummary(BaseModel):
    """
    Task summary schema for chat responses.

    Simplified task representation returned in chat responses.
    Per @specs/001-chatbot-mcp/contracts/openapi.yaml
    """
    id: UUID = Field(..., description="Task ID")
    title: str = Field(..., description="Task title")
    description: Optional[str] = Field(None, description="Task description")
    completed: bool = Field(..., description="Task completion status")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "title": "Buy groceries",
                "description": None,
                "completed": False
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for chat endpoint.

    Per @specs/001-chatbot-mcp/contracts/openapi.yaml
    """
    conversation_id: UUID = Field(..., description="Conversation ID (new or existing)")
    message: Message = Field(..., description="Assistant's response message")
    tasks: Optional[List[TaskSummary]] = Field(
        default=None,
        description="List of tasks affected by the chat (optional, for context)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
                "message": {
                    "id": "123e4567-e89b-12d3-a456-426614174001",
                    "role": "assistant",
                    "content": "I've added a task 'Buy groceries' to your list.",
                    "created_at": "2026-01-11T22:00:00Z"
                },
                "tasks": [
                    {
                        "id": "123e4567-e89b-12d3-a456-426614174002",
                        "title": "Buy groceries",
                        "description": None,
                        "completed": False
                    }
                ]
            }
        }


# =============================================================================
# Error Schemas
# =============================================================================

class ChatError(BaseModel):
    """
    Error response schema for chat endpoint.

    Returned when chat processing fails.
    """
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Detailed error information")
    conversation_id: Optional[UUID] = Field(
        None,
        description="Conversation ID if error occurred during existing conversation"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Failed to process chat message",
                "detail": "OpenAI API timeout",
                "conversation_id": None
            }
        }
