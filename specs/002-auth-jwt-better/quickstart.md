# Quickstart Guide: Authentication for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 2)

**Date**: 2026-01-09
**Feature**: 002-auth-jwt-better
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions to implement secure multi-user authentication using Better Auth on the frontend and JWT-based authorization verification in the FastAPI backend. The implementation builds on the existing backend from Spec 1 and adds user isolation for task management.

## Prerequisites

### System Requirements
- Python 3.13+ installed
- Node.js 18+ for frontend (if implementing Better Auth)
- Git version control system
- Access to Neon Serverless PostgreSQL
- Better Auth account (for frontend authentication)

### Backend Dependencies
- FastAPI 0.115+
- SQLModel 0.0.22+
- PyJWT 2.10+
- python-jose[cryptography]
- bcrypt (for password hashing if needed)

### Environment Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

## Installation

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
# Add authentication-specific dependencies if not already present:
pip install pyjwt python-jose[cryptography] bcrypt
```

### 2. Environment Variables
Update your `.env` file with authentication-specific variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_app?sslmode=require

# Authentication Configuration
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days in minutes

# Environment
ENVIRONMENT=development
```

## Implementation Steps

### Step 1: Create Authentication Utilities
Create JWT utility functions for token creation and verification:

**File**: `backend/src/auth/utils.py`
```python
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, status
from config.settings import settings
from sqlmodel import Session
from ..models.user import User


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a new JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.better_auth_secret, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify and decode a JWT token
    """
    try:
        payload = jwt.decode(token, settings.better_auth_secret, algorithms=[settings.algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str) -> dict:
    """
    Get current user from token
    """
    payload = verify_token(token)
    user_id: str = payload.get("sub")
    email: str = payload.get("email")
    if user_id is None or email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"user_id": user_id, "email": email}
```

### Step 2: Create Authentication Middleware
Create middleware to verify JWT tokens on protected routes:

**File**: `backend/src/auth/middleware.py`
```python
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer
from typing import Dict, Any
from .utils import verify_token


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        # Extract token from Authorization header
        authorization = request.headers.get("Authorization")

        if not authorization:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )

        try:
            # Expecting format: "Bearer <token>"
            scheme, token = authorization.split(" ")
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization header format"
            )

        # Verify the token
        try:
            payload = verify_token(token)
            request.state.user = payload
            return payload
        except HTTPException:
            raise  # Re-raise HTTP exceptions
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )


jwt_bearer = JWTBearer()
```

### Step 3: Create Authentication Dependencies
Create dependency functions for injecting authenticated user context:

**File**: `backend/src/auth/dependencies.py`
```python
from fastapi import Depends, HTTPException, status
from typing import Dict
from .middleware import jwt_bearer


async def get_current_user_data(token_data: Dict = Depends(jwt_bearer)) -> Dict:
    """
    Dependency to get current user data from JWT token
    """
    if not token_data or "user_id" not in token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    return {
        "user_id": token_data["user_id"],
        "email": token_data["email"]
    }


async def get_current_user_id(current_user: Dict = Depends(get_current_user_data)) -> str:
    """
    Dependency to get current user ID
    """
    return current_user["user_id"]
```

### Step 4: Update Task Service for User Filtering
Modify the task service to enforce user ownership:

**File**: `backend/src/services/task_service.py` (updated version)
```python
from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from uuid import UUID
from fastapi import HTTPException, status
from ..models.task import Task, TaskCreate, TaskUpdate
from ..models.user import User


class TaskService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_task(self, task_data: TaskCreate, user_id: UUID) -> Task:
        """Create a new task for the authenticated user"""
        task = Task(
            **task_data.model_dump(),
            user_id=user_id
        )
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def get_user_tasks(self, user_id: UUID, limit: int = 20, offset: int = 0, status_filter: Optional[str] = None) -> List[Task]:
        """Get all tasks for the authenticated user"""
        query = select(Task).where(Task.user_id == user_id)

        if status_filter:
            query = query.where(Task.status == status_filter)

        query = query.offset(offset).limit(limit)
        result = await self.session.exec(query)
        tasks = result.all()
        return tasks

    async def get_task_by_id(self, task_id: UUID, user_id: UUID) -> Task:
        """Get a specific task by ID for the authenticated user"""
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await self.session.exec(query)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you don't have permission to access it"
            )

        return task

    async def update_task(self, task_id: UUID, task_data: TaskUpdate, user_id: UUID) -> Task:
        """Update a specific task by ID for the authenticated user"""
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await self.session.exec(query)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you don't have permission to update it"
            )

        # Update task fields
        for field, value in task_data.model_dump(exclude_unset=True).items():
            setattr(task, field, value)

        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task)
        return task

    async def delete_task(self, task_id: UUID, user_id: UUID) -> bool:
        """Delete a specific task by ID for the authenticated user"""
        query = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await self.session.exec(query)
        task = result.first()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you don't have permission to delete it"
            )

        await self.session.delete(task)
        await self.session.commit()
        return True
```

### Step 5: Update Task API Routes
Modify the task endpoints to use authentication and user filtering:

**File**: `backend/src/api/tasks.py` (updated version)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from uuid import UUID
from ..models.task import TaskCreate, TaskUpdate, Task
from ..services.task_service import TaskService
from ..auth.dependencies import get_current_user_id
from ..database.session import get_async_session


router = APIRouter()


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    session=Depends(get_async_session)
):
    """Create a new task for the authenticated user"""
    task_service = TaskService(session)
    return await task_service.create_task(task_data, UUID(user_id))


@router.get("/", response_model=List[Task])
async def get_tasks(
    user_id: str = Depends(get_current_user_id),
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    session=Depends(get_async_session)
):
    """Get all tasks for the authenticated user"""
    task_service = TaskService(session)
    return await task_service.get_user_tasks(UUID(user_id), limit, offset, status_filter)


@router.get("/{task_id}", response_model=Task)
async def get_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
    session=Depends(get_async_session)
):
    """Get a specific task by ID for the authenticated user"""
    task_service = TaskService(session)
    return await task_service.get_task_by_id(task_id, UUID(user_id))


@router.put("/{task_id}", response_model=Task)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    session=Depends(get_async_session)
):
    """Update a specific task by ID for the authenticated user"""
    task_service = TaskService(session)
    return await task_service.update_task(task_id, task_data, UUID(user_id))


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    user_id: str = Depends(get_current_user_id),
    session=Depends(get_async_session)
):
    """Delete a specific task by ID for the authenticated user"""
    task_service = TaskService(session)
    success = await task_service.delete_task(task_id, UUID(user_id))
    if success:
        return
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or you don't have permission to delete it"
        )
```

### Step 6: Update Settings Configuration
Add authentication-related settings:

**File**: `backend/config/settings.py` (updated section)
```python
class Settings(BaseSettings):
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/todo_app?sslmode=require")

    # Authentication settings
    better_auth_secret: str = os.getenv("BETTER_AUTH_SECRET", "your-default-dev-secret-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")

    # API settings
    api_prefix: str = "/api/v1"
    debug: bool = environment == "development"

    class Config:
        case_sensitive = True


settings = Settings()
```

## Database Migration

### 1. Create Migration Script
Create a migration script to add the users table and update the tasks table:

**File**: `backend/alembic/versions/002_add_users_and_update_tasks.py`
```python
"""Add users table and update tasks table for authentication

Revision ID: 002
Revises: 001  # Previous migration
Create Date: 2026-01-09 04:00:00.000000

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
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    # Add user_id column to tasks table
    op.add_column('tasks', sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Update existing tasks to assign to a default user (you'll need to handle this appropriately)
    # This is a simplified example - in practice, you'd need to handle existing data appropriately

    # Create foreign key constraint
    op.create_foreign_key('fk_tasks_user_id', 'tasks', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    # Create index for user_id
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])

    # Make user_id required after populating existing records
    # This would be done in a subsequent migration after handling existing data


def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_tasks_user_id', 'tasks', type_='foreignkey')

    # Drop index
    op.drop_index('ix_tasks_user_id')

    # Drop user_id column
    op.drop_column('tasks', 'user_id')

    # Drop users table
    op.drop_table('users')
```

### 2. Run Migrations
```bash
# Apply migrations
alembic upgrade head
```

## Frontend Integration (Better Auth)

### 1. Install Better Auth
```bash
npm install better-auth @better-auth/token
```

### 2. Configure Better Auth
```javascript
// frontend/lib/auth.ts
import betterAuth from "better-auth";
import { jwtPlugin } from "@better-auth/plugin-jwt";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    jwtPlugin({
      secret: process.env.BETTER_AUTH_SECRET,
    }),
  ],
  // Other configuration options...
});
```

### 3. Make Authenticated API Requests
```javascript
// frontend/lib/api.ts
import { auth } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await auth.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
```

## Testing the Implementation

### 1. Run Unit Tests
```bash
# Test authentication utilities
python -m pytest tests/unit/test_auth.py

# Test JWT functionality
python -m pytest tests/unit/test_jwt.py

# Test protected routes
python -m pytest tests/integration/test_protected_routes.py
```

### 2. Manual Testing
1. Register a user with Better Auth
2. Obtain JWT token
3. Make API requests with the token in the Authorization header
4. Verify that users can only access their own tasks
5. Test that requests without tokens return 401
6. Test that requests with invalid tokens return 401

## Error Handling

### Common Error Responses
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Valid token but user doesn't have permission for the resource
- `404 Not Found`: Resource doesn't exist or user doesn't have access to it

### Error Response Format
```json
{
  "detail": "Descriptive error message",
  "error_code": "AUTH_ERROR_TYPE"
}
```

## Security Considerations

### JWT Best Practices
- Use strong secrets (minimum 256 bits)
- Set appropriate expiration times
- Never store sensitive data in JWT payloads
- Implement proper token revocation if needed
- Use HTTPS in production

### User Isolation
- Always verify user ownership before operations
- Use parameterized queries to prevent injection
- Validate user IDs in all requests
- Implement proper error messages that don't leak information

## Performance Considerations

### JWT Verification Performance
- HS256 algorithm provides good performance
- Stateless authentication scales well
- Consider caching for high-volume applications
- Monitor token verification performance

### Database Performance
- Index user_id column on tasks table
- Optimize queries with proper WHERE clauses
- Use connection pooling
- Monitor query performance

## Troubleshooting

### Common Issues

1. **JWT Token Not Working**
   - Check that `BETTER_AUTH_SECRET` matches between frontend and backend
   - Verify token format (Bearer <token>)
   - Check token expiration

2. **Users Can Access Other Users' Tasks**
   - Verify that all endpoints check user ownership
   - Check that user_id is properly extracted from token
   - Validate that WHERE clauses include user_id filters

3. **Database Migration Errors**
   - Check that foreign key constraints are properly defined
   - Handle existing data appropriately during migration
   - Verify that migrations are applied in the correct order

### Debugging Tips

1. Enable debug logging in settings
2. Check that environment variables are properly set
3. Verify JWT token contents using a JWT debugger
4. Use FastAPI's built-in docs at `/docs` to test endpoints
5. Log authentication failures for troubleshooting

## Next Steps

1. Complete frontend integration with Better Auth
2. Implement refresh token functionality if needed
3. Add role-based access control if required
4. Implement audit logging for authentication events
5. Add rate limiting to authentication endpoints