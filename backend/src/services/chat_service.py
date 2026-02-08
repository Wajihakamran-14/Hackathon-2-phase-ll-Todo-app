import uuid
from typing import List, Optional
from sqlmodel import select, desc
from sqlmodel.ext.asyncio.session import AsyncSession
from models.chat import ChatConversation, ChatMessage

class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create_conversation(self, user_id: uuid.UUID, conversation_id: Optional[uuid.UUID] = None) -> ChatConversation:
        if conversation_id:
            # Check if conversation exists and belongs to user
            statement = select(ChatConversation).where(
                ChatConversation.id == conversation_id,
                ChatConversation.user_id == user_id
            )
            result = await self.session.exec(statement)
            conversation = result.first()
            if conversation:
                return conversation

        # Create new conversation
        conversation = ChatConversation(user_id=user_id)
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def add_message(self, conversation_id: uuid.UUID, role: str, content: str) -> ChatMessage:
        message = ChatMessage(
            conversation_id=conversation_id,
            role=role,
            content=content
        )
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def get_conversation_history(self, conversation_id: uuid.UUID, limit: int = 20) -> List[ChatMessage]:
        statement = select(ChatMessage).where(
            ChatMessage.conversation_id == conversation_id
        ).order_by(desc(ChatMessage.created_at)).limit(limit)
        
        result = await self.session.exec(statement)
        messages = list(result.all())
        return messages[::-1] # Return in chronological order
