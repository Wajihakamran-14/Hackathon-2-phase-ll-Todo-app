# Quickstart Guide: Backend for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 1)

**Date**: 2026-01-09
**Feature**: 001-backend-todo-crud
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions to set up, develop, and test the backend API for the task management application. Follow these steps to get your development environment ready and start implementing the API.

## Prerequisites

### System Requirements
- Python 3.11+ installed
- Git version control system
- Access to Neon Serverless PostgreSQL (or local PostgreSQL for development)
- pip package manager

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

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app
ENVIRONMENT=development
```

### 3. Database Setup
1. Ensure PostgreSQL is running
2. Create the database if it doesn't exist:
   ```bash
   createdb todo_app  # or use your preferred method
   ```
3. Run initial migrations:
   ```bash
   alembic upgrade head
   ```

## Project Structure

```
backend/
├── models/                 # SQLModel database models
│   ├── __init__.py
│   └── task.py             # Task model definition
├── routes/                 # API route definitions
│   ├── __init__.py
│   └── tasks.py            # Task management endpoints
├── config/                 # Configuration settings
│   ├── __init__.py
│   └── settings.py         # Application settings
├── tests/                  # Test suite
│   ├── unit/               # Unit tests
│   │   ├── test_task_model.py
│   │   └── test_task_routes.py
│   ├── integration/        # Integration tests
│   │   ├── test_task_crud.py
│   │   └── test_task_persistence.py
│   └── conftest.py         # Test fixtures and configuration
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
└── alembic/                # Database migration files
    └── versions/
```

## Development Workflow

### 1. Starting the Development Server
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 2. Running Tests
```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/unit/

# Run integration tests only
pytest tests/integration/

# Run tests with coverage
pytest --cov=.
```

### 3. Running Migrations
```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade to a previous version
alembic downgrade -1
```

## API Endpoints

### Task Management
```
GET    /tasks                    # Get all tasks
POST   /tasks                    # Create a new task
GET    /tasks/{id}              # Get a specific task
PUT    /tasks/{id}              # Update a specific task
DELETE /tasks/{id}              # Delete a specific task
PATCH  /tasks/{id}/complete     # Toggle task completion status
```

## Key Implementation Areas

### 1. Database Models (`models/`)
- Define SQLModel class for Task
- Establish validation constraints
- Add configuration for serialization

### 2. API Routes (`routes/`)
- Define FastAPI endpoints with proper HTTP methods
- Add request/response validation using Pydantic
- Implement error handling

### 3. Configuration (`config/`)
- Define application settings using Pydantic BaseSettings
- Handle environment-specific configurations
- Manage database connection settings

## Testing Guidelines

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Aim for high code coverage

### Integration Tests
- Test API endpoints with real database
- Verify CRUD operations
- Test error scenarios

### Test Structure
```python
def test_create_task():
    """Test creating a new task"""
    # Arrange
    # Act
    # Assert
```

## Common Commands

### Development
```bash
# Start development server
uvicorn main:app --reload

# Format code
black ./

# Lint code
flake8 ./

# Run tests with coverage
pytest --cov=. --cov-report=html
```

### Database
```bash
# Create migration
alembic revision --autogenerate -m "Add new feature"

# Apply migrations
alembic upgrade head

# Check current migration status
alembic current
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` in environment variables
   - Check if PostgreSQL is running
   - Ensure database exists

2. **Migration Issues**
   - Run `alembic current` to check migration status
   - Use `alembic stamp head` if migration history is corrupted
   - Review migration files for errors

### Debugging Tips

1. Enable debug logging in `config/settings.py`
2. Use print statements or logging in development
3. Check the API documentation at `/docs` or `/redoc`
4. Use Postman or curl to test endpoints manually

## Next Steps

1. Implement the Task model in `models/task.py`
2. Create the configuration settings in `config/settings.py`
3. Implement task route functions in `routes/tasks.py`
4. Define API endpoints in `routes/tasks.py`
5. Write unit and integration tests
6. Run the application and test endpoints
7. Deploy to staging environment

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)