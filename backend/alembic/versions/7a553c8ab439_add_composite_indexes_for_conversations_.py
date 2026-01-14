"""Add composite indexes for conversations and messages

Revision ID: 7a553c8ab439
Revises: 0b0b99173b8a
Create Date: 2026-01-11 22:45:05.890275

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a553c8ab439'
down_revision: Union[str, Sequence[str], None] = '0b0b99173b8a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create composite index for efficient conversation lookup by user with ordering
    op.create_index(
        'ix_conversations_user_id_updated_at',
        'conversations',
        ['user_id', sa.text('updated_at DESC')],
        unique=False
    )

    # Create composite index for efficient message retrieval in conversation order
    op.create_index(
        'ix_messages_conversation_id_created_at',
        'messages',
        ['conversation_id', sa.text('created_at ASC')],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop composite indexes
    op.drop_index('ix_messages_conversation_id_created_at', table_name='messages')
    op.drop_index('ix_conversations_user_id_updated_at', table_name='conversations')
