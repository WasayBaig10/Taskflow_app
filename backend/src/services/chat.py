"""
Chat service for conversation and message management.

Per @specs/001-chatbot-mcp/plan.md and @specs/001-chatbot-mcp/data-model.md
"""
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4
import re
import logging

from src.models.conversation import ConversationTable
from src.models.message import MessageTable, MessageRole
from src.config import engine

logger = logging.getLogger(__name__)


class ChatService:
    """
    Service for chat business logic.

    Handles conversation creation, message storage, history retrieval,
    and input sanitization per @specs/001-chatbot-mcp/plan.md.
    """

    @staticmethod
    def create_conversation(session: Session, user_id: UUID, title: Optional[str] = None) -> ConversationTable:
        """
        Create a new conversation for a user.

        Args:
            session: Database session
            user_id: Owner's user ID (from JWT)
            title: Optional conversation title

        Returns:
            Created conversation with user_id set
        """
        conversation = ConversationTable(
            id=uuid4(),
            user_id=user_id,
            title=title,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        logger.info(f"Created conversation {conversation.id} for user {user_id}")
        return conversation

    @staticmethod
    def get_conversation(session: Session, conversation_id: UUID, user_id: UUID) -> Optional[ConversationTable]:
        """
        Retrieve a conversation if it belongs to the user.

        Critical for security - enforces user ownership check.
        Per @specs/001-chatbot-mcp/data-model.md data isolation requirements.

        Args:
            session: Database session
            conversation_id: Conversation ID to retrieve
            user_id: User requesting the conversation (for ownership verification)

        Returns:
            Conversation if found and owned by user, None otherwise
        """
        return session.query(ConversationTable).filter(
            ConversationTable.id == conversation_id,
            ConversationTable.user_id == user_id  # Critical for security
        ).first()

    @staticmethod
    def store_message(
        session: Session,
        conversation_id: UUID,
        role: MessageRole,
        content: str,
        metadata: Optional[dict] = None
    ) -> MessageTable:
        """
        Store a message in the conversation.

        Args:
            session: Database session
            conversation_id: ID of the conversation
            role: Message role (user or assistant)
            content: Message content
            metadata: Optional metadata for tool calls, token usage, etc.

        Returns:
            Created message
        """
        message = MessageTable(
            id=uuid4(),
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.utcnow(),
            tool_metadata=metadata
        )
        session.add(message)

        # Update conversation's updated_at timestamp
        conversation = session.get(ConversationTable, conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()

        session.commit()
        session.refresh(message)

        logger.debug(f"Stored {role.value} message in conversation {conversation_id}")
        return message

    @staticmethod
    def get_conversation_history(
        session: Session,
        conversation_id: UUID,
        user_id: UUID,
        limit: int = 100
    ) -> List[MessageTable]:
        """
        Get message history for a conversation.

        Enforces user ownership check before returning messages.
        Per @specs/001-chatbot-mcp/plan.md stateless architecture requirements.

        Args:
            session: Database session
            conversation_id: ID of the conversation
            user_id: User requesting the history (for ownership verification)
            limit: Maximum number of messages to return (default: 100)

        Returns:
            List of messages in chronological order, empty list if not found

        Raises:
            ValueError: If conversation doesn't belong to user
        """
        # First verify user owns the conversation
        conversation = ChatService.get_conversation(session, conversation_id, user_id)
        if not conversation:
            logger.warning(f"User {user_id} attempted to access conversation {conversation_id}")
            return []

        # Get messages ordered by created_at
        statement = (
            select(MessageTable)
            .where(MessageTable.conversation_id == conversation_id)
            .order_by(MessageTable.created_at.asc())
            .limit(limit)
        )

        messages = session.exec(statement).all()
        logger.info(f"Retrieved {len(messages)} messages for conversation {conversation_id}")
        return messages

    @staticmethod
    def get_user_conversations(
        session: Session,
        user_id: UUID,
        limit: int = 20
    ) -> List[ConversationTable]:
        """
        Get all conversations for a user, ordered by updated_at desc.

        Args:
            session: Database session
            user_id: User's ID
            limit: Maximum number of conversations to return

        Returns:
            List of conversations, most recently updated first
        """
        statement = (
            select(ConversationTable)
            .where(ConversationTable.user_id == user_id)
            .order_by(ConversationTable.updated_at.desc())
            .limit(limit)
        )

        return session.exec(statement).all()

    @staticmethod
    def sanitize_user_input(user_input: str) -> str:
        """
        Sanitize user input to prevent prompt injection attacks.

        Per @specs/001-chatbot-mcp/plan.md security requirements.
        Removes or escapes potentially dangerous patterns.

        Args:
            user_input: Raw user input

        Returns:
            Sanitized input safe for use in AI prompts
        """
        if not user_input:
            return ""

        # Remove null bytes
        sanitized = user_input.replace("\x00", "")

        # Limit length to prevent DoS
        max_length = 5000
        if len(sanitized) > max_length:
            sanitized = sanitized[:max_length]
            logger.warning(f"Truncated user input from {len(user_input)} to {max_length} chars")

        # Remove excessive whitespace
        sanitized = re.sub(r"\s+", " ", sanitized).strip()

        # Check for obvious prompt injection patterns
        injection_patterns = [
            r"ignore\s+(all\s+)?(previous|above)",
            r"disregard\s+(all\s+)?(previous|above)",
            r"forget\s+(everything|all\s+instructions)",
            r"<\|.*?\|>",  # Special delimiter patterns
            r"<<.*?>>",  # Another delimiter pattern
        ]

        for pattern in injection_patterns:
            if re.search(pattern, sanitized, re.IGNORECASE):
                logger.warning(f"Detected potential prompt injection: {pattern}")
                # Don't block, but could add additional monitoring here

        return sanitized

    @staticmethod
    def format_messages_for_openai(messages: List[MessageTable]) -> List[dict]:
        """
        Format database messages for OpenAI API.

        Converts MessageTable objects to OpenAI message format.

        Args:
            messages: List of MessageTable objects

        Returns:
            List of message dicts in OpenAI format
        """
        formatted = []
        for msg in messages:
            formatted.append({
                "role": msg.role.value,  # "user" or "assistant"
                "content": msg.content
            })
        return formatted


# Singleton instance for convenience
chat_service = ChatService()
