"""
Chat API endpoints for Todo AI Chatbot.

Per @specs/001-chatbot-mcp/contracts/openapi.yaml and @specs/001-chatbot-mcp/plan.md
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel import Session
from uuid import UUID
from datetime import datetime
import time
import logging

from src.config import engine
from src.api.dependencies import get_current_user
from src.api.schemas.chat import ChatRequest, ChatResponse, Message, ChatError
from src.services.chat import ChatService
from src.agents.todo_agent import create_todo_agent
from src.models.message import MessageRole

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat_endpoint(
    user_id: str,
    request: ChatRequest,
    http_request: Request,
    current_user: str = Depends(get_current_user)
):
    """
    Chat endpoint for AI-powered task management.

    Processes user messages through OpenAI agent with MCP tool integration.
    Creates new conversations or continues existing ones.

    Per @specs/001-chatbot-mcp/plan.md:
    - Stateless architecture: history loaded from DB each request
    - MCP First: all task operations through MCP tools
    - Data isolation: all queries filter by user_id

    Per @specs/001-chatbot-mcp/contracts/openapi.yaml
    """
    start_time = time.time()

    # Verify user ownership
    if current_user != user_id:
        logger.warning(f"User {current_user} attempted to access user {user_id} chat")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only access your own chat"
        )

    # Parse user_id as UUID
    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    with Session(engine) as session:
        try:
            # Get or create conversation
            conversation = None
            conversation_id = request.conversation_id

            if conversation_id:
                # Validate user owns this conversation
                conversation = ChatService.get_conversation(session, conversation_id, user_uuid)
                if not conversation:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Conversation not found or access denied"
                    )
            else:
                # Create new conversation for first message
                conversation = ChatService.create_conversation(
                    session=session,
                    user_id=user_uuid,
                    title="New Chat"  # Can be updated based on first message content
                )
                conversation_id = conversation.id
                logger.info(f"Created new conversation {conversation_id} for user {user_id}")

            # Sanitize user input
            sanitized_message = ChatService.sanitize_user_input(request.message)

            # Store user message
            user_message = ChatService.store_message(
                session=session,
                conversation_id=conversation_id,
                role=MessageRole.USER,
                content=sanitized_message
            )

            # Load conversation history
            history = ChatService.get_conversation_history(
                session=session,
                conversation_id=conversation_id,
                user_id=user_uuid
            )

            # Format for OpenAI (exclude the message we just added)
            formatted_history = ChatService.format_messages_for_openai(history[:-1])

            # Create agent and process message
            agent = create_todo_agent(user_uuid)

            # Collect agent response
            response_parts = []
            async for chunk in agent.process_message(sanitized_message, formatted_history):
                response_parts.append(chunk)

            assistant_response = "".join(response_parts)

            # Store assistant response
            assistant_message = ChatService.store_message(
                session=session,
                conversation_id=conversation_id,
                role=MessageRole.ASSISTANT,
                content=assistant_response,
                metadata={"processing_time": time.time() - start_time}
            )

            # Calculate processing time
            processing_time = time.time() - start_time

            # Log request
            logger.info(
                f"Chat processed: user={user_id}, "
                f"conversation={conversation_id}, "
                f"processing_time={processing_time:.2f}s, "
                f"message_length={len(request.message)}"
            )

            # Build response
            return ChatResponse(
                conversation_id=conversation_id,
                message=Message(
                    id=assistant_message.id,
                    role="assistant",
                    content=assistant_response,
                    created_at=assistant_message.created_at
                ),
                tasks=None  # Could be populated with affected tasks if needed
            )

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            # Log error for debugging
            logger.error(f"Error processing chat request: {e}", exc_info=True)

            # Return user-friendly error message
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "Failed to process chat message",
                    "message": "I encountered an error processing your request. Please try again.",
                    "conversation_id": str(conversation_id) if conversation_id else None
                }
            )


@router.get("/{user_id}/conversations")
async def list_conversations(
    user_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    List all conversations for a user.

    Returns conversations ordered by most recently updated.
    """
    # Verify user ownership
    if current_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only access your own conversations"
        )

    try:
        user_uuid = UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    with Session(engine) as session:
        conversations = ChatService.get_user_conversations(session, user_uuid)

        return {
            "conversations": [
                {
                    "id": str(conv.id),
                    "title": conv.title,
                    "created_at": conv.created_at.isoformat(),
                    "updated_at": conv.updated_at.isoformat()
                }
                for conv in conversations
            ],
            "count": len(conversations)
        }


@router.get("/{user_id}/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    current_user: str = Depends(get_current_user)
):
    """
    Get all messages in a conversation.

    Requires user owns the conversation.
    """
    # Verify user ownership
    if current_user != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden"
        )

    try:
        user_uuid = UUID(user_id)
        conv_uuid = UUID(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

    with Session(engine) as session:
        # Verify user owns the conversation
        conversation = ChatService.get_conversation(session, conv_uuid, user_uuid)
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )

        # Get messages
        messages = ChatService.get_conversation_history(
            session=session,
            conversation_id=conv_uuid,
            user_id=user_uuid
        )

        return {
            "conversation_id": conversation_id,
            "messages": [
                {
                    "id": str(msg.id),
                    "role": msg.role.value,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in messages
            ],
            "count": len(messages)
        }
