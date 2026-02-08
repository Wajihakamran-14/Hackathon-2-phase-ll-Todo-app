from pydantic import BaseModel, Field
from typing import Optional


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    status: str = Field(default="todo", pattern=r"^(todo|in_progress|done)$", description="Task status")


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    status: Optional[str] = Field(None, pattern=r"^(todo|in_progress|done)$", description="Task status")
    completed: Optional[bool] = Field(None, description="Task completion status")