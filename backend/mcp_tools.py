from mcp.server.lowlevel import Server
from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource
from typing import List, Optional, Any
import uuid
import json
from sqlmodel import select, or_
from models.task import Task
from src.database.session import AsyncSessionLocal

# Create a low-level MCP server
mcp = Server("TodoManager")

@mcp.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available tools."""
    return [
        Tool(
            name="add_task",
            description="Add a new task for the user.",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                },
                "required": ["title"]
            }
        ),
        Tool(
            name="list_tasks",
            description="List active (remaining) tasks for the user.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="list_all_tasks",
            description="List ALL tasks (including completed ones) for the user.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed. You can provide task_id OR task_title.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "task_title": {"type": "string"}
                }
            }
        ),
        Tool(
            name="delete_task",
            description="Delete a task. You can provide task_id OR task_title.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "task_title": {"type": "string"}
                }
            }
        ),
        Tool(
            name="delete_all_tasks",
            description="Delete ALL tasks for the current user.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="clear_chat_history",
            description="Delete the current conversation history.",
            inputSchema={"type": "object", "properties": {}}
        ),
        Tool(
            name="update_task",
            description="Update task details.",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {"type": "string"},
                    "task_title": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "urgent"]}
                }
            }
        )
    ]

# Helper to find task by ID or Title
async def find_task(session, user_id: str, task_id: Optional[str] = None, task_title: Optional[str] = None):
    if task_id:
        try:
            stmt = select(Task).where(Task.id == uuid.UUID(task_id), Task.user_id == uuid.UUID(user_id))
            res = await session.exec(stmt)
            return res.first()
        except: pass
    
    if task_title:
        stmt = select(Task).where(Task.title.ilike(f"%{task_title}%"), Task.user_id == uuid.UUID(user_id))
        res = await session.exec(stmt)
        return res.first()
    return None

async def add_task(title: str, user_id: str, description: Optional[str] = None, priority: str = "medium"):
    async with AsyncSessionLocal() as session:
        task = Task(title=title, description=description, priority=priority, user_id=uuid.UUID(user_id))
        session.add(task)
        await session.commit()
        await session.refresh(task)
        return f"Task '{title}' added."

async def list_tasks(user_id: str):
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.user_id == uuid.UUID(user_id), Task.completed == False)
        result = await session.exec(statement)
        tasks = result.all()
        if not tasks: return "No active tasks."
        task_entries = [f"- {t.title} (Priority: {t.priority})" for t in tasks]
        return "Remaining tasks:\n" + "\n".join(task_entries)

async def list_all_tasks(user_id: str):
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.user_id == uuid.UUID(user_id))
        result = await session.exec(statement)
        tasks = result.all()
        if not tasks: return "No tasks found."
        task_entries = [f"- {'[DONE] ' if t.completed else ''}{t.title}" for t in tasks]
        return "All tasks:\n" + "\n".join(task_entries)

async def complete_task(user_id: str, task_id: Optional[str] = None, task_title: Optional[str] = None):
    async with AsyncSessionLocal() as session:
        task = await find_task(session, user_id, task_id, task_title)
        if not task: return "Task not found."
        task.completed = True
        session.add(task)
        await session.commit()
        return f"Task '{task.title}' completed."

async def delete_task(user_id: str, task_id: Optional[str] = None, task_title: Optional[str] = None):
    async with AsyncSessionLocal() as session:
        task = await find_task(session, user_id, task_id, task_title)
        if not task: return "Task not found."
        await session.delete(task)
        await session.commit()
        return f"Task '{task.title}' deleted."

async def delete_all_tasks(user_id: str):
    async with AsyncSessionLocal() as session:
        statement = select(Task).where(Task.user_id == uuid.UUID(user_id))
        result = await session.exec(statement)
        tasks = result.all()
        if not tasks: return "No tasks to delete."
        
        count = len(tasks)
        for task in tasks:
            await session.delete(task)
        await session.commit()
        return f"Successfully deleted all {count} tasks."

async def clear_chat_history(user_id: str):
    from models.chat import ChatMessage, ChatConversation
    async with AsyncSessionLocal() as session:
        # Find user conversations
        stmt = select(ChatConversation).where(ChatConversation.user_id == uuid.UUID(user_id))
        res = await session.exec(stmt)
        convos = res.all()
        
        message_count = 0
        for convo in convos:
            # Delete all messages in those conversations
            msg_stmt = select(ChatMessage).where(ChatMessage.conversation_id == convo.id)
            msg_res = await session.exec(msg_stmt)
            msgs = msg_res.all()
            for msg in msgs:
                await session.delete(msg)
                message_count += 1
        
        await session.commit()
        return f"SUCCESS: Cleared {message_count} messages from your history."

async def update_task(user_id: str, task_id: Optional[str] = None, task_title: Optional[str] = None, **kwargs):
    async with AsyncSessionLocal() as session:
        task = await find_task(session, user_id, task_id, task_title)
        if not task: return "Task not found."
        for k, v in kwargs.items():
            if v is not None and hasattr(task, k): setattr(task, k, v)
        session.add(task)
        await session.commit()
        return f"Task '{task.title}' updated."

@mcp.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[TextContent | ImageContent | EmbeddedResource]:
    if not arguments: arguments = {}
    user_id = arguments.pop("user_id", None)
    
    try:
        if name == "add_task": result = await add_task(user_id=user_id, **arguments)
        elif name == "list_tasks": result = await list_tasks(user_id=user_id)
        elif name == "list_all_tasks": result = await list_all_tasks(user_id=user_id)
        elif name == "complete_task": result = await complete_task(user_id=user_id, **arguments)
        elif name == "delete_task": result = await delete_task(user_id=user_id, **arguments)
        elif name == "delete_all_tasks": result = await delete_all_tasks(user_id=user_id)
        elif name == "clear_chat_history": result = await clear_chat_history(user_id=user_id)
        elif name == "update_task": result = await update_task(user_id=user_id, **arguments)
        else: result = "Unknown tool."
    except Exception as e: result = f"Error: {str(e)}"

    return [TextContent(type="text", text=result)]
