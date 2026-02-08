---
description: "Task list for AI Todo Chatbot implementation"
---

# Tasks: AI Todo Chatbot

**Input**: Design documents from `/specs/004-ai-todo-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup

- [X] T001 [P] Install backend dependencies (mcp, cohere) in backend/requirements.txt
- [X] T002 Configure COHERE_API_KEY in backend/.env
- [X] T003 [P] Initialize ChatKit components structure in frontend/components/chat/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and services required for all user stories

- [X] T004 Create ChatConversation and ChatMessage models in backend/models/chat.py
- [X] T005 [P] Register new chat models in backend/app.py (ensure imports for SQLModel metadata)
- [X] T006 Implement ChatService for message persistence in backend/src/services/chat_service.py
- [X] T007 Initialize base MCP server and register task tools module in backend/mcp_tools.py

**Checkpoint**: Foundation ready - Database schema and message persistence service are functional.

---

## Phase 3: User Story 1 - Manage tasks via natural language chat (Priority: P1) 🎯 MVP

**Goal**: Allow users to add and list tasks using natural language.

**Independent Test**: Send "Add a task to buy groceries" in the chat and verify the task is created in the database.

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement `add_task` and `list_tasks` MCP tools in backend/mcp_tools.py
- [X] T009 [US1] Implement core AI agent logic using Cohere SDK in backend/agent.py
- [X] T010 [US1] Create chat router and POST /api/v1/chat/ endpoint in backend/routes/chat.py
- [X] T011 [P] [US1] Add `chat` router to the main application in backend/app.py
- [X] T012 [P] [US1] Create ChatInterface UI component in frontend/components/chat/ChatInterface.tsx
- [X] T013 [US1] Add chat API call method to ApiClient in frontend/lib/api.ts
- [X] T014 [US1] Integrate ChatInterface into the Dashboard in frontend/app/dashboard/page.tsx

**Checkpoint**: User Story 1 functional - Users can now talk to the AI to manage basic tasks.

---

## Phase 4: User Story 2 - Persist and view conversation history (Priority: P2)

**Goal**: Save and retrieve previous chat messages.

**Independent Test**: Refresh the page and verify that previous chat messages are still visible.

### Implementation for User Story 2

- [X] T015 [P] [US2] Implement GET /api/v1/chat/history/{id} endpoint in backend/routes/chat.py
- [X] T016 [US2] Update ChatInterface to fetch and render history on mount in frontend/components/chat/ChatInterface.tsx
- [X] T017 [US2] Ensure agent logic retrieves and includes last N messages from DB in backend/agent.py

**Checkpoint**: User Story 2 functional - Conversations are now persistent across sessions.

---

## Phase 5: User Story 3 - Natural language task updates and deletions (Priority: P3)

**Goal**: Complete the CRUD cycle via chat.

**Independent Test**: Send "Delete my grocery task" and verify the task is removed from the database.

### Implementation for User Story 3

- [X] T018 [P] [US3] Implement `update_task` and `delete_task` MCP tools in backend/mcp_tools.py
- [X] T019 [P] [US3] Implement `complete_task` MCP tool in backend/mcp_tools.py
- [X] T020 [US3] Update AI agent system instructions to handle task updates and deletions in backend/agent.py

**Checkpoint**: User Story 3 functional - Full task lifecycle management via natural language is complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: UI/UX enhancements and final validation

- [X] T021 [P] Add animations to chat messages in frontend/components/chat/ChatMessage.tsx
- [X] T022 Implement "Auto-scroll to bottom" logic in frontend/components/chat/ChatInterface.tsx
- [X] T023 [P] Add error boundary and loading states to the chat interface
- [X] T024 Perform final end-to-end validation against quickstart.md scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 (Setup)**: Start immediately.
2. **Phase 2 (Foundational)**: Depends on Phase 1. BLOCKS all user stories.
3. **Phase 3 (US1)**: Depends on Phase 2. (MVP)
4. **Phase 4 (US2)**: Depends on Phase 3.
5. **Phase 5 (US3)**: Depends on Phase 3 (can run parallel to US2).
6. **Phase 6 (Polish)**: Depends on all user stories being complete.

### Parallel Opportunities

- **Setup**: All tasks (T001, T003) can run in parallel.
- **Foundational**: T005 and T007 can be started once T004 is drafted.
- **US1**: UI work (T012) can start while backend (T008, T009) is being developed.
- **US2/US3**: Once US1 is done, history (T015) and additional tools (T018, T019) can be built in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundation.
2. Implement basic chat with `add` and `list` capabilities.
3. Verify that the AI can correctly call tools and update the task list.

### Incremental Delivery

1. Foundation -> Solid base for data and tools.
2. US1 -> Chat MVP (The core "wow" feature).
3. US2 -> Professional feel (persistence).
4. US3 -> Full functionality.
5. Polish -> Visual quality.
