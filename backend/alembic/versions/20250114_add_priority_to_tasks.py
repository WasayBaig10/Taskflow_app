"""Add priority to tasks table

Revision ID: 2025011400001
Revises: 7a553c8ab439
Create Date: 2026-01-14 00:00:01.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2025011400001'
down_revision: Union[str, Sequence[str], None] = '7a553c8ab439'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add priority column to tasks table with default value 'medium'
    op.add_column('tasks',
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='medium')
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Remove priority column from tasks table
    op.drop_column('tasks', 'priority')
