# Implementation Plan: AI Todo Chatbot

**Branch**: `004-ai-todo-chatbot` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-ai-todo-chatbot/spec.md`

## Summary

Phase-3 introduces an AI-powered chatbot to the Todo application, allowing users to manage tasks through natural language. The technical approach involves building an MCP (Model Context Protocol) server within the existing FastAPI backend to expose task tools (CRUD) to an AI agent powered by the **Cohere Python SDK**. Conversations will be persisted in the existing PostgreSQL database to maintain statelessness at the application level.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/Next.js (Frontend)  
**Primary Dependencies**: FastAPI, SQLModel, Official MCP Python SDK, **Groq SDK**, lucide-react (Icons)  
**Storage**: Neon Serverless PostgreSQL (Existing `users` and `tasks` tables)  
**Testing**: pytest (Backend), npm test/lint (Frontend)  
**Target Platform**: Web (Modern Browsers)
**Project Type**: Web application (FastAPI + Next.js)  
**Performance Goals**: < 500ms visual acknowledgement, < 5s end-to-end task creation  
**Constraints**: Stateless server (no runtime conversation state), minimal new files (max 3 core backend files), reuse Phase-2 auth.  
**Scale/Scope**: Support individual user task management via chat.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Smallest Viable Diff**: Only adding necessary files for AI integration and Chat UI.
- [x] **Cite Existing Code**: Reusing SQLModel session and auth dependencies.
- [x] **Testable Changes**: All MCP tools and chat endpoints will be independently testable.
- [x] **No Hardcoded Secrets**: Utilizing `.env` for **Cohere** and Database credentials.

## Project Structure

### Documentation (this feature)

```text
specs/004-ai-todo-chatbot/
├── spec.md              # Feature requirements
├── plan.md              # This file (Architectural design)
├── research.md          # Phase 0: SDK & Pattern analysis
├── data-model.md        # Phase 1: Chat persistence schema
├── quickstart.md        # Phase 1: Setup instructions
└── contracts/           # Phase 1: API definitions (OpenAPI)
```

### Source Code (repository root)

```text
backend/
├── app.py               # Main FastAPI entry (CORS, Routers)
├── mcp_tools.py         # [NEW] MCP Server & Task Tools
├── agent.py             # [NEW] AI Agent logic (OpenAI SDK)
├── routes/
│   ├── chat.py          # [NEW] Chat API endpoints
│   └── tasks.py         # Existing task routes
├── models/
│   ├── chat.py          # [NEW] Chat Conversation & Message models
│   └── task.py          # Existing task models
└── src/
    ├── database/        # Existing DB session management
    └── api/             # Existing Auth logic

frontend/
├── app/
│   ├── dashboard/       # Dashboard with Chat component
│   └── components/
│       └── auth/        # Existing Auth forms
├── components/
│   └── chat/            # [NEW] ChatKit UI components
└── lib/
    └── api.ts           # Updated with Chat API calls
```

**Structure Decision**: Web application structure. Minimal additions to `backend/` and a new `components/chat` directory in `frontend/` to maintain a clean separation of concerns.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | N/A                                 |