# Data Model: Backend for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 1)

**Date**: 2026-01-09
**Feature**: 001-backend-todo-crud
**Status**: Final

## Overview

This document defines the database schema and data model for the task management API. The data model ensures proper task storage with appropriate fields and constraints.

## Database Schema

### Tables

#### 1. tasks
Stores individual tasks with status and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the task |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Optional task description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Task completion status |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp of task creation |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE NOW() | Timestamp of last update |

### Indexes

#### Primary Indexes
- `tasks.pkey`: Primary key index on `tasks.id`

#### Additional Indexes
- `tasks_completed_idx`: Index on `tasks.completed` for efficient filtering by completion status

## Data Model Classes (SQLModel)

### Task Model
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(sa_column=Column(String(255), nullable=False))
    description: Optional[str] = Field(sa_column=Column(Text, nullable=True))
    completed: bool = Field(sa_column=Column(Boolean, nullable=False, default=False))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    )
    updated_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()"))
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Sample Task",
                "description": "This is a sample task",
                "completed": False,
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            }
        }
```

## Business Logic Constraints

### Completion Status Management
- Default completion status is False for new tasks
- PATCH endpoint toggles completion status
- Boolean field ensures consistent state

### Data Integrity
- Title field is required and has character limit
- UUID primary keys prevent enumeration attacks
- Created timestamps automatically managed by database
- Updated timestamps updated on every modification

## API Integration Points

### Query Patterns
1. **Get all tasks**: `SELECT * FROM tasks ORDER BY created_at DESC`
2. **Get specific task**: `SELECT * FROM tasks WHERE id = ?`
3. **Create task**: `INSERT INTO tasks (title, description, completed) VALUES (?, ?, FALSE)`
4. **Update task**: `UPDATE tasks SET title = ?, description = ?, updated_at = NOW() WHERE id = ?`
5. **Toggle completion**: `UPDATE tasks SET completed = NOT completed, updated_at = NOW() WHERE id = ?`
6. **Delete task**: `DELETE FROM tasks WHERE id = ?`

### Performance Considerations
- Queries filtered by completion status leverage the completion index
- Timestamp ordering for chronological listing

## Migration Strategy

### Initial Schema Creation
1. Create `tasks` table with all required columns
2. Create indexes
3. Set up default values

### Future Schema Changes
- Use Alembic for version-controlled migrations
- Maintain backward compatibility where possible
- Plan for zero-downtime deployments

## Validation Rules

### Task Model Validation
- Title length validation (max 255 characters)
- Description length validation (no practical limit)
- Required field validation
- Boolean completion status validation

## API Response Serialization

### Task Response
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "completed": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Error Handling

### Database Errors
- Constraint violations: Return 422 with specific validation errors
- Database connectivity: Return 500 with generic error message
- Missing resource: Return 404

### Application Errors
- Validation errors: Return 422 with detailed error information
- Resource not found: Return 404