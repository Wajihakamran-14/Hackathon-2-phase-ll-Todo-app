"""Add users table and indexes

Revision ID: 002
Revises: 001
Create Date: 2026-01-09 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table('user',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Create index for user email
    op.create_index('ix_user_email', 'user', ['email'])
    op.create_index('ix_user_created_at', 'user', ['created_at'])

    # Add user_id column to task table
    op.add_column('task', sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Create foreign key constraint
    op.create_foreign_key('fk_task_user_id', 'task', 'user', ['user_id'], ['id'], ondelete='CASCADE')

    # Update the task table to make user_id required
    op.alter_column('task', 'user_id', nullable=False)

    # Create index for task user_id
    op.create_index('ix_task_user_id', 'task', ['user_id'])

    # Create index for task title
    op.create_index('ix_task_title', 'task', ['title'])


def downgrade():
    # Drop task indexes
    op.drop_index('ix_task_title')
    op.drop_index('ix_task_user_id')

    # Drop foreign key constraint
    op.drop_constraint('fk_task_user_id', 'task', type_='foreignkey')

    # Remove user_id column
    op.drop_column('task', 'user_id')

    # Drop user table indexes
    op.drop_index('ix_user_created_at')
    op.drop_index('ix_user_email')

    # Drop user table
    op.drop_table('user')