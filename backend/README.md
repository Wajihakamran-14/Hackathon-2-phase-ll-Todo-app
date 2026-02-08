# Todo API Backend

A simple task management API built with FastAPI and SQLModel.

## Features

- RESTful API endpoints for task management (CRUD operations)
- Neon Serverless PostgreSQL database with SQLModel ORM
- Async support for high performance
- Serverless scaling for cost efficiency

## Tech Stack

- Python 3.11+
- FastAPI
- SQLModel
- Pydantic
- PostgreSQL (via psycopg2-binary)
- Neon Serverless PostgreSQL
- Alembic (for migrations)

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Neon Serverless PostgreSQL connection details
   ```

3. Run the application:
   ```bash
   uvicorn app:app --reload
   ```

## API Endpoints

- `GET /api/v1/tasks` - Get all tasks
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/{id}` - Get a specific task
- `PUT /api/v1/tasks/{id}` - Update a specific task
- `DELETE /api/v1/tasks/{id}` - Delete a specific task
- `PATCH /api/v1/tasks/{id}/complete` - Toggle task completion status

## Environment Variables

- `DATABASE_URL` - Neon Serverless PostgreSQL database connection string (format: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
- `NEON_PROJECT_ID` - Neon project ID (optional)
- `NEON_API_KEY` - Neon API key (optional)
- `ENVIRONMENT` - Environment (development/production)

## Neon Serverless PostgreSQL Setup

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string from the Neon dashboard
4. Update your `.env` file with the connection string

Neon provides serverless PostgreSQL with auto-scaling and pay-per-use pricing.

### Connecting to Neon

The application automatically loads database credentials from your `.env` file:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# Environment
ENVIRONMENT=development
```

To connect to your Neon database:

1. Rename `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env` with your Neon connection string

3. Run the application:
   ```bash
   uvicorn app:app --reload
   ```

The application will automatically connect to Neon Serverless PostgreSQL, create the necessary tables, and handle SSL encryption.

## Running Tests

```bash
pytest
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head
```