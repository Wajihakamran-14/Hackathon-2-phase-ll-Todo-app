# Data Model: Authentication for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 2)

**Date**: 2026-01-09
**Feature**: 002-auth-jwt-better
**Status**: Final

## Overview

This document defines the database schema updates required to support user authentication and task ownership enforcement. The data model extends the existing task management schema from Spec 1 to include user accounts and user-task relationships while maintaining data isolation between users.

## Database Schema Updates

### 1. users Table
Stores user account information for authentication and task ownership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp of user account creation |

#### Indexes
- `users_pkey`: Primary key index on `users.id`
- `users_email_key`: Unique index on `users.email` for fast email lookups

### 2. tasks Table (Updated)
Updated to include user relationship for ownership enforcement.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, NOT NULL | Unique identifier for the task |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Optional task description |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'todo' | Task status ('todo', 'in_progress', 'done') |
| user_id | UUID | FOREIGN KEY(users.id), NOT NULL | Owner of the task |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp of task creation |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE NOW() | Timestamp of last update |

#### Indexes
- `tasks_pkey`: Primary key index on `tasks.id`
- `tasks_user_id_idx`: Index on `tasks.user_id` for efficient filtering by user
- `tasks_status_idx`: Index on `tasks.status` for filtering by status

### 3. Relationships

#### User-Task Relationship
- **Relationship Type**: One-to-Many (One user can own many tasks)
- **Foreign Key Constraint**: `tasks.user_id → users.id`
- **Cascade Behavior**:
  - On user deletion: CASCADE (delete all user's tasks)
  - On user update: RESTRICT (prevent changing user IDs that are referenced)

## Data Model Classes (SQLModel)

### User Model
```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(sa_column=Column(String(255), unique=True, nullable=False))
    created_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    )

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="owner")


class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    created_at: datetime
```

### Updated Task Model
```python
class TaskBase(SQLModel):
    title: str = Field(sa_column=Column("title", String(255), nullable=False))
    description: Optional[str] = Field(sa_column=Column("description", Text, nullable=True))
    status: str = Field(
        sa_column=Column("status", String(50), nullable=False, server_default="todo")
    )


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        nullable=False
    )
    title: str = Field(sa_column=Column("title", String(255), nullable=False))
    description: Optional[str] = Field(sa_column=Column("description", Text, nullable=True))
    status: str = Field(
        sa_column=Column("status", String(50), nullable=False, server_default="todo")
    )
    user_id: uuid.UUID = Field(
        sa_column=Column("user_id", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    )
    created_at: datetime = Field(
        sa_column=Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("NOW()")
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            "updated_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=text("NOW()"),
            onupdate=text("NOW()")
        )
    )

    # Relationship to user
    owner: User = Relationship(back_populates="tasks")


class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
```

## Business Logic Constraints

### User Isolation
- Tasks can only be accessed by their owner
- Users cannot access tasks owned by other users
- Authentication and authorization must be verified for all operations

### Status Validation
- Valid statuses: 'todo', 'in_progress', 'done'
- Status field is case-sensitive
- Invalid status values result in validation error

### Data Integrity
- Email uniqueness prevents duplicate accounts
- UUID primary keys prevent enumeration attacks
- Created timestamps automatically managed by database
- Updated timestamps updated on every modification

## API Integration Points

### Query Patterns
1. **Get user's tasks**: `SELECT * FROM tasks WHERE user_id = ?`
2. **Get specific task with ownership check**: `SELECT * FROM tasks WHERE id = ? AND user_id = ?`
3. **Create task for user**: `INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)`
4. **Update user's task**: `UPDATE tasks SET title = ?, description = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?`
5. **Delete user's task**: `DELETE FROM tasks WHERE id = ? AND user_id = ?`

### Performance Considerations
- Queries filtered by user_id leverage the foreign key index
- Status filtering leverages the status index
- Pagination recommended for large result sets

## Migration Strategy

### Schema Evolution
1. **Add users table**: Create the users table with proper constraints
2. **Add user_id column to tasks**: Add foreign key to existing tasks table
3. **Update existing tasks**: Assign existing tasks to a default user or handle appropriately
4. **Create indexes**: Add performance indexes after data migration
5. **Deploy safely**: Use blue-green deployment to avoid downtime

### Zero-Downtime Deployment
- Prepare migration scripts with proper fallbacks
- Test migration on copy of production data
- Schedule during low-traffic periods
- Monitor for errors during migration

## Security Considerations

### Row-Level Security
- Database-level enforcement of user isolation
- Prevents direct database access bypassing application logic
- All queries must include user_id filter

### Data Encryption
- Store sensitive data encrypted at rest
- Use HTTPS for all API communications
- Hash passwords if storing user credentials

### Audit Trail
- Preserve created_at timestamps for historical tracking
- Log authentication events for security monitoring
- Monitor for unusual access patterns

## Validation Rules

### User Model Validation
- Email format validation using standard email regex
- Email length validation (max 255 characters)
- Required field validation

### Task Model Validation
- Title length validation (max 255 characters)
- Description length validation (no practical limit)
- Status value validation against allowed values
- Required field validation
- User_id existence validation

## API Response Serialization

### User Response
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Task Response (with User Info)
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "status": "todo",
  "user_id": "uuid-string",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Error Handling

### Database Errors
- Constraint violations: Return 422 with specific validation errors
- Database connectivity: Return 500 with generic error message
- Missing resource: Return 404
- Unauthorized access: Return 403

### Application Errors
- Invalid authentication token: Return 401
- Resource not found: Return 404
- Insufficient permissions: Return 403
- Validation errors: Return 400 with detailed error information

## Backward Compatibility

### Migration from Spec 1
- Existing tasks will need to be assigned to a default user or handled appropriately
- Maintain API response format compatibility where possible
- Provide clear upgrade path for existing data
- Maintain existing functionality while adding authentication