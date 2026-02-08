# Tasks: Authentication for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 2)

**Input**: Design documents from `/specs/002-auth-jwt-better/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure in backend/ directory
- [X] T002 Initialize Python project with FastAPI, SQLModel, PyJWT, psycopg2-binary dependencies in backend/requirements.txt
- [X] T003 [P] Configure linting and formatting tools (black, flake8) in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T004 Setup database connection and session management in backend/src/database/
- [X] T005 [P] Create JWT utility functions for token creation and verification in backend/src/utils/jwt_utils.py
- [X] T006 [P] Setup API routing and middleware structure in backend/src/main.py
- [X] T007 Create base models that all stories depend on in backend/src/models/__init__.py
- [X] T008 Configure error handling and logging infrastructure in backend/src/exceptions/
- [X] T009 Setup environment configuration management in backend/config/settings.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure User Registration and Login (Priority: P1) 🎯 MVP

**Goal**: Users can securely sign up and sign in using Better Auth on the frontend. The system ensures that only authenticated users can access their own tasks, with proper JWT token handling throughout the session.

**Independent Test**: Can be fully tested by registering a new user, logging in, obtaining a JWT token, and verifying that the token allows access to task operations while preventing access to other users' tasks.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for authentication endpoints in backend/tests/integration/test_auth_endpoints.py
- [ ] T011 [P] [US1] Integration test for user authentication flow in backend/tests/integration/test_auth_flow.py

### Implementation for User Story 1

- [X] T012 [P] [US1] Create Task model in backend/src/models/task.py
- [X] T013 [P] [US1] Create User model in backend/src/models/user.py
- [X] T014 [US1] Implement TaskService in backend/src/services/task_service.py (depends on T012, T013)
- [X] T015 [US1] Implement Task API endpoints in backend/src/api/tasks.py
- [X] T016 [US1] Add JWT middleware for authentication in backend/src/middleware/jwt_middleware.py
- [X] T017 [US1] Add task ownership validation to ensure users can only access their own tasks

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Task Ownership Enforcement (Priority: P2)

**Goal**: Authenticated users can only access, modify, or delete their own tasks. The system enforces proper task ownership by validating the authenticated user ID against the task owner.

**Independent Test**: Can be tested by creating tasks for one user, authenticating as a different user, and verifying that attempts to access the first user's tasks return 403 Forbidden responses.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Database persistence test in backend/tests/integration/test_persistence.py
- [ ] T019 [P] [US2] Data integrity test in backend/tests/unit/test_data_integrity.py

### Implementation for User Story 2

- [X] T020 [P] [US2] Create database migration scripts for users and tasks tables in backend/alembic/versions/
- [X] T021 [US2] Implement database session management with proper transaction handling in backend/src/database/session.py
- [X] T022 [US2] Add database connection health checks in backend/src/health.py
- [X] T023 [US2] Implement proper error handling for database operations in backend/src/services/task_service.py
- [X] T024 [US2] Add data validation to ensure integrity in backend/src/models/task.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - JWT Token Verification (Priority: P3)

**Goal**: The backend properly verifies JWT tokens on all protected routes and handles invalid or expired tokens appropriately.

**Independent Test**: Can be tested by sending requests with expired tokens, invalid tokens, and no tokens to verify appropriate 401 responses.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US3] Validation error test in backend/tests/unit/test_validation_errors.py
- [ ] T026 [P] [US3] Authentication error test in backend/tests/integration/test_auth_errors.py

### Implementation for User Story 3

- [X] T027 [P] [US3] Create custom exception handlers in backend/src/exceptions/handlers.py
- [X] T028 [US3] Implement request validation using Pydantic models in backend/src/models/request_models.py
- [X] T029 [US3] Add comprehensive error response formatting in backend/src/schemas/error.py
- [X] T030 [US3] Implement edge case handling for invalid task IDs in backend/src/api/tasks.py
- [X] T031 [US3] Add malformed JWT token handling in backend/src/middleware/jwt_middleware.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Authentication Endpoints (Priority: P4)

**Goal**: Implement proper authentication endpoints for user registration, login, and logout using JWT tokens.

**Independent Test**: Can be tested by registering a new user, logging in, and verifying that valid JWT tokens are issued and can be used to access protected endpoints.

### Tests for User Story 4 (OPTIONAL - only if tests requested) ⚠️

- [ ] T032 [P] [US4] Registration endpoint test in backend/tests/integration/test_registration.py
- [ ] T033 [P] [US4] Login endpoint test in backend/tests/integration/test_login.py

### Implementation for User Story 4

- [X] T034 [P] [US4] Create User model for authentication in backend/src/models/user.py
- [X] T035 [US4] Implement authentication service in backend/src/services/auth_service.py
- [X] T036 [US4] Implement registration endpoint in backend/src/api/auth.py
- [X] T037 [US4] Implement login endpoint in backend/src/api/auth.py
- [X] T038 [US4] Implement logout endpoint in backend/src/api/auth.py
- [X] T039 [US4] Update settings with auth configuration in backend/config/settings.py

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Protected Task Operations (Priority: P5)

**Goal**: All task operations require authentication and enforce user ownership. Users can only perform CRUD operations on their own tasks.

**Independent Test**: Can be tested by authenticating as a user, creating tasks, and verifying that only that user's tasks are accessible through the API endpoints.

### Tests for User Story 5 (OPTIONAL - only if tests requested) ⚠️

- [ ] T040 [P] [US5] Protected task operations test in backend/tests/integration/test_protected_tasks.py
- [ ] T041 [P] [US5] User isolation test in backend/tests/integration/test_user_isolation.py

### Implementation for User Story 5

- [X] T042 [P] [US5] Update task endpoints to require authentication in backend/src/api/tasks.py
- [X] T043 [US5] Implement user context dependency in backend/src/dependencies/user.py
- [X] T044 [US5] Add user filtering to task service methods in backend/src/services/task_service.py
- [X] T045 [US5] Implement 401 Unauthorized responses for unauthenticated requests in backend/src/exceptions/handlers.py
- [X] T046 [US5] Implement 403 Forbidden responses for unauthorized access in backend/src/exceptions/handlers.py

**Checkpoint**: All user stories should now be fully integrated and functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T047 [P] Documentation updates in backend/docs/
- [X] T048 Code cleanup and refactoring
- [ ] T049 Performance optimization across all stories
- [ ] T050 [P] Additional unit tests in backend/tests/unit/
- [X] T051 Security hardening
- [X] T052 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Builds authentication foundation
- **User Story 5 (P5)**: Depends on US4 (authentication) - Enforces user isolation on task operations

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 4

```bash
# Launch all tests for User Story 4 together (if tests requested):
Task: "Registration endpoint test in backend/tests/integration/test_registration.py"
Task: "Login endpoint test in backend/tests/integration/test_login.py"

# Launch all models for User Story 4 together:
Task: "Create User model for authentication in backend/src/models/user.py"
Task: "Update settings with auth configuration in backend/config/settings.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Basic task operations)
4. Complete Phase 4: User Story 2 (Task ownership)
5. Complete Phase 5: User Story 3 (JWT verification)
6. Complete Phase 6: User Story 4 (Authentication endpoints)
7. **STOP and VALIDATE**: Test authentication flow independently
8. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic tasks!)
3. Add User Story 2 → Test independently → Deploy/Demo (Task ownership!)
4. Add User Story 3 → Test independently → Deploy/Demo (Secure tokens!)
5. Add User Story 4 → Test independently → Deploy/Demo (Login/registration!)
6. Add User Story 5 → Test independently → Deploy/Demo (Complete isolation!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Basic task ops)
   - Developer B: User Story 2 (Ownership)
   - Developer C: User Story 3 (Token verification)
   - Developer D: User Story 4 (Auth endpoints)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence