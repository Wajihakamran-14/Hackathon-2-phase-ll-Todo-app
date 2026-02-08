import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy import Column, DateTime, String, text, func


class UserBase(SQLModel):
    email: str = Field(sa_column=Column("email", String, unique=True, nullable=False))


class User(UserBase, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        sa_column=Column(
            "id",
            PostgresUUID(as_uuid=True),
            nullable=False,
            primary_key=True,
            server_default=text("gen_random_uuid()"),
            index=True  # Add index for ID lookups
        )
    )
    email: str = Field(sa_column=Column("email", String, unique=True, nullable=False, index=True))  # Add index for email lookups
    hashed_password: str = Field(sa_column=Column("hashed_password", String, nullable=False))
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            index=True  # Add index for created_at to optimize date-based queries
        )
    )

    # Relationship to tasks
    # tasks: List["Task"] = Relationship(back_populates="owner")


class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    created_at: datetime


class UserCreate(SQLModel):
    email: str
    password: str


class UserLogin(SQLModel):
    email: str
    password: str