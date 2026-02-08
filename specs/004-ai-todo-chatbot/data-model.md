# Data Model: AI Todo Chatbot

This document defines the entities and relationships required for chat persistence.

## Entities

### ChatConversation
Represents a unique chat session between a user and the AI.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (generated) |
| user_id | UUID | Foreign key to `users.id` |
| created_at | DateTime | Timestamp of creation |

**Relationships**:
- Many-to-One with `User`.
- One-to-Many with `ChatMessage`.

### ChatMessage
Represents an individual message in a conversation.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (generated) |
| conversation_id | UUID | Foreign key to `chat_conversations.id` |
| role | String | 'user' or 'assistant' |
| content | Text | The text content of the message |
| tool_calls | JSON | Optional metadata for tool executions |
| created_at | DateTime | Timestamp of creation |

**Relationships**:
- Many-to-One with `ChatConversation`.

## Validation Rules
- `role` must be one of: `user`, `assistant`.
- `content` cannot be empty for user messages.
- `conversation_id` must point to a valid conversation owned by the authenticated user.

## State Transitions
- **New Conversation**: Created on the first message from a user.
- **Message Append**: Messages are appended sequentially to the active conversation.
