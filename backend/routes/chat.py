from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
import uuid
from src.dependencies.user import get_current_user_id
from src.database.session import AsyncSessionLocal
from src.services.chat_service import ChatService
from agent import agent

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[uuid.UUID] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: uuid.UUID
    status: str

@router.post("/", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    async with AsyncSessionLocal() as session:
        chat_service = ChatService(session)
        
        # 1. Get or create conversation
        conversation = await chat_service.get_or_create_conversation(user_id, request.conversation_id)
        
        # 2. Get history
        history_objs = await chat_service.get_conversation_history(conversation.id)
        history = [{"role": m.role, "content": m.content} for m in history_objs]
        
        # 3. Add user message to DB
        await chat_service.add_message(conversation.id, "user", request.message)
        
        try:
            # 4. Get agent response
            response_text = await agent.chat(request.message, user_id, history)
            
            # 5. Add assistant message to DB
            await chat_service.add_message(conversation.id, "assistant", response_text)
            
            return ChatResponse(
                response=response_text,
                conversation_id=conversation.id,
                status="success"
            )
        except Exception as e:
            print(f"Agent Error: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"AI Agent failed to respond: {str(e)}"
            )

@router.get("/history/{conversation_id}")
async def get_chat_history(
    conversation_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id)
):
    async with AsyncSessionLocal() as session:
        chat_service = ChatService(session)
        # Verify ownership
        conversation = await chat_service.get_or_create_conversation(user_id, conversation_id)
        if conversation.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this conversation")
            
        history = await chat_service.get_conversation_history(conversation_id)
        return history
