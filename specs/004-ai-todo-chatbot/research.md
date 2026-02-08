# Research: AI Todo Chatbot

This document captures the technical research and decisions made during the planning phase of the AI Todo Chatbot.

## Decision 1: MCP SDK Integration in FastAPI
- **Decision**: Embed the MCP server logic within the FastAPI application using the `mcp` Python library.
- **Rationale**: The official MCP SDK provides high-level decorators for tool definitions. By running the MCP server within the same process or as a sidecar, we can directly reuse the SQLModel sessions and business logic.
- **Alternatives considered**: Running a separate MCP server process (rejected due to deployment complexity and overhead).

## Decision 2: AI Agent Orchestration
- **Decision**: Use the **Cohere Python SDK** to manage the interaction loop.
- **Rationale**: Cohere's Command models offer excellent performance for tool-calling and conversational logic. The SDK provides a straightforward way to pass tools and manage multi-turn conversations.
- **Best Practices**: 
  - Define clear tool descriptions for the Cohere model.
  - Implement strict type checking for tool arguments.
  - Use system prompts to keep the agent focused on task management.

## Decision 3: Stateless Conversation Persistence
- **Decision**: Implement `Conversation` and `Message` tables in SQLModel linked to the `User` table.
- **Rationale**: To maintain statelessness, the server will fetch the last N messages from the database at the start of every chat request. This ensures that context is preserved even if the server restarts or the user switches devices.
- **Schema Design**:
  - `Conversation`: `id`, `user_id`, `created_at`.
  - `Message`: `id`, `conversation_id`, `role` (user/assistant), `content`, `tool_call_id`, `created_at`.

## Decision 4: Frontend Chat Interface
- **Decision**: Build a custom Chat component using **Tailwind CSS** and standard React state management, inspired by ChatKit patterns.
- **Rationale**: Minimal setup requirement means we should avoid adding heavy external libraries if standard React hooks and Tailwind can achieve the same "Elegant UI" results with better control over animations and color palettes.
- **Integration**: API calls will be made via the existing `apiClient` with proper JWT headers.

## Decision 5: API Protocol
- **Decision**: Standard REST `POST` endpoint for `/chat` with JSON responses.
- **Rationale**: While streaming (SSE) is popular, a standard JSON request/response is simpler to implement and maintain for a "Minimal Spec" while still meeting the performance targets (< 2s acknowledgement).
