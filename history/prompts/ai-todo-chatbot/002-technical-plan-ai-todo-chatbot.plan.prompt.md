---
id: 002
title: Technical Plan for AI Todo Chatbot
stage: plan
date: 2026-02-08
surface: agent
model: gemini-2.0-flash
feature: ai-todo-chatbot
branch: 004-ai-todo-chatbot
user: Wajihakamran-14
command: /sp.plan Create: 1. Backend MCP tools...
labels: ["plan", "architecture", "design", "ai"]
links:
  spec: specs/004-ai-todo-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-ai-todo-chatbot/plan.md
  - specs/004-ai-todo-chatbot/research.md
  - specs/004-ai-todo-chatbot/data-model.md
  - specs/004-ai-todo-chatbot/quickstart.md
  - specs/004-ai-todo-chatbot/contracts/chat.openapi.json
tests:
  - Constitution Check
---

## Prompt

/sp.plan Create:1. **Backend MCP tools** (`backend/mcp_tools.py`):   - add_task, list_tasks, complete_task, delete_task, update_task.   - Chat endpoint `/api/{user_id}/chat` connects to MCP tools.   - Reuse Phase-2 DB models (Task, Conversation, Message).2. **AI Agent integration** (`backend/agent.py`):   - Fetch conversation history from DB.   - Build message array: history + user input.   - Agent calls MCP tools and stores responses in DB.   - Connect agent to chat endpoint.3. **Frontend Chat UI** (`frontend/`):   - ChatKit page/component to display conversation.   - Connect API client to `/api/{user_id}/chat` with JWT.   - Elegant UI with colors + button animations.   - Support all task operations via natural language commands.4. **Testing & Validation**:   - Test MCP tools independently.   - Test agent with sample natural language commands.   - Test chat UI displays responses correctly.   - Verify stateless behavior: server holds no state, DB stores conversation.5. **Minimal folder/files**:   - All new code inside existing Phase-2 `backend/` and `frontend/`.   - Do not create extra folders or files.

## Response snapshot

Generated a comprehensive technical implementation plan for the AI Todo Chatbot. This included:
- Researching the integration of Official MCP SDK and OpenAI Agents SDK.
- Designing a stateless database schema for chat persistence (`ChatConversation`, `ChatMessage`).
- Defining OpenAPI contracts for the new chat endpoints.
- Updating agent context to include the new technical stack.
- Ensuring compliance with the project constitution (minimal diff, testable units).

## Outcome

- ✅ Impact: High - Provides the technical blueprint for Phase-3 AI integration.
- 🧪 Tests: Constitution check passed; design artifacts ready for task breakdown.
- 📁 Files: created plan.md, research.md, data-model.md, quickstart.md, and chat.openapi.json.
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Successfully balanced the "minimal files" constraint with the need for a robust, stateless architecture.

## Evaluation notes (flywheel)

- Failure modes observed: None in this phase.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
