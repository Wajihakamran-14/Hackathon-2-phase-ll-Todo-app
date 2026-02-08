from fastapi import APIRouter, HTTPException, status, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List, Optional
from uuid import UUID
from models.task import Task, TaskRead, TaskCreate, TaskUpdate
from src.database.session import AsyncSessionLocal
from src.dependencies.user import get_current_user_id


router = APIRouter()


@router.get("/", response_model=List[TaskRead])
async def get_tasks(
    user_id: UUID = Depends(get_current_user_id),
    limit: int = 20,
    offset: int = 0,
    completed_filter: Optional[bool] = None
):
    """Get all tasks for the authenticated user"""
    async with AsyncSessionLocal() as session:
        query = select(Task).where(Task.user_id == user_id)

        if completed_filter is not None:
            query = query.where(Task.completed == completed_filter)

        query = query.order_by(Task.created_at.desc()).offset(offset).limit(limit)
        results = await session.exec(query)
        tasks = results.all()
        return tasks


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    user_id: UUID = Depends(get_current_user_id)
):
    """Create a new task for the authenticated user"""
    print(f"DEBUG: Creating task for user {user_id}: {task.title}, priority: {task.priority}")
    async with AsyncSessionLocal() as session:
        try:
            db_task = Task(
                title=task.title,
                description=task.description,
                completed=task.completed,
                priority=task.priority,
                user_id=user_id
            )
            session.add(db_task)
            await session.commit()
            await session.refresh(db_task)
            
            # Re-fetch or ensure task is fully loaded
            print(f"DEBUG: Task created successfully: {db_task.id}")
            return db_task
        except Exception as e:
            print(f"DEBUG: Error creating task: {e}")
            await session.rollback()
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id)
):
    """Get a specific task by ID for the authenticated user"""
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.exec(statement)
        db_task = results.one_or_none()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you do not have permission to access it"
            )
        return db_task


@router.put("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    user_id: UUID = Depends(get_current_user_id)
):
    """Update a specific task by ID for the authenticated user"""
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.exec(statement)
        db_task = results.one_or_none()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you do not have permission to update it"
            )

        # Update task fields
        for field, value in task_update.model_dump(exclude_unset=True).items():
            setattr(db_task, field, value)

        await session.commit()
        await session.refresh(db_task)
        return db_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id)
):
    """Delete a specific task by ID for the authenticated user"""
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.exec(statement)
        db_task = results.one_or_none()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you do not have permission to delete it"
            )

        await session.delete(db_task)
        await session.commit()


@router.patch("/{task_id}/complete/", response_model=TaskRead)
async def toggle_task_completion(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id)
):
    """Toggle the completion status of a specific task by ID for the authenticated user"""
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        results = await session.exec(statement)
        db_task = results.one_or_none()

        if not db_task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or you do not have permission to modify it"
            )

        # Toggle completion status
        db_task.completed = not db_task.completed

        await session.commit()
        await session.refresh(db_task)
        return db_task