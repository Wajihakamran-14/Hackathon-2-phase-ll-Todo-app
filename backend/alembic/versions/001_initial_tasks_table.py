"""Initial tasks table

Revision ID: 001
Revises:
Create Date: 2026-01-09 04:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create tasks table
    op.create_table('task',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('length(title) > 0', name='task_title_not_empty')
    )

    # Create indexes
    op.create_index('ix_task_completed', 'task', ['completed'])
    op.create_index('ix_task_created_at', 'task', ['created_at'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_task_created_at')
    op.drop_index('ix_task_completed')

    # Drop table
    op.drop_table('task')