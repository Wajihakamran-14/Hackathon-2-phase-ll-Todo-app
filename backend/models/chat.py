import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID

class ChatConversation(SQLModel, table=True):
    __tablename__ = "chat_conversations"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True
    )
    user_id: uuid.UUID = Field(
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True
        )
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"), index=True)
    )

    messages: List["ChatMessage"] = Relationship(back_populates="conversation")

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True
    )
    conversation_id: uuid.UUID = Field(
        sa_column=Column(
            PostgresUUID(as_uuid=True),
            ForeignKey("chat_conversations.id", ondelete="CASCADE"),
            nullable=False,
            index=True
        )
    )
    role: str = Field(nullable=False) # user, assistant
    content: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), server_default=text("now()"), index=True)
    )

    conversation: ChatConversation = Relationship(back_populates="messages")
