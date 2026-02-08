# Implementation Plan: Authentication for Todo Full-Stack Web Application (Hackathon Phase-2, Spec 2)

**Branch**: `002-auth-jwt-better` | **Date**: 2026-01-09 | **Spec**: [specs/002-auth-jwt-better/spec.md](specs/002-auth-jwt-better/spec.md)
**Input**: Feature specification from `/specs/002-auth-jwt-better/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement secure multi-user authentication using Better Auth on the frontend and JWT-based authorization verification in the FastAPI backend. The system will ensure proper task ownership by verifying user identity from JWT tokens and enforcing that users can only access their own tasks. The implementation will maintain compatibility with the existing backend built in Spec 1 while adding authentication and authorization layers.

## Technical Context

**Language/Version**: Python 3.13+ for backend, JavaScript/TypeScript for Better Auth configuration
**Primary Dependencies**:
- FastAPI for backend framework
- Better Auth for frontend authentication
- PyJWT for JWT handling
- python-jose for JWT verification
- bcrypt for password hashing (if needed)

**Storage**: Neon Serverless PostgreSQL (existing from Spec 1)
**Testing**: pytest for backend tests, Jest/Cypress for frontend tests
**Target Platform**: Linux server (backend API) + Web browser (frontend)
**Project Type**: web (full-stack application)
**Performance Goals**: Sub-200ms authentication verification for 95% of requests
**Constraints**: JWT tokens must use shared secret `BETTER_AUTH_SECRET`, task CRUD logic unchanged beyond user filtering
**Scale/Scope**: Support multiple concurrent users with isolated task data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Security: All endpoints must verify JWT tokens and enforce task ownership
- Accuracy: Authentication must correctly identify users and validate tokens
- Reliability: Authentication system must be available when the main API is available
- Reproducibility: Implementation must follow Spec-Kit Plus workflow with Claude Code
- Usability: API must provide clear authentication-related error messages
- Development Workflow: No manual coding; follow Spec → Plan → Tasks → Implementation workflow

## Project Structure

### Documentation (this feature)
```text
specs/002-auth-jwt-better/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
```text
backend/
├── src/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── middleware.py          # JWT verification middleware
│   │   ├── dependencies.py        # Auth dependency injection
│   │   ├── utils.py              # JWT utilities (signing, verification)
│   │   └── schemas.py            # Auth-related schemas
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py               # User model for authentication
│   │   └── task.py               # Updated task model with user relationship
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py       # Authentication service
│   │   └── task_service.py       # Updated task service with user filtering
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py               # Authentication endpoints
│   │   └── tasks.py              # Updated task endpoints with auth
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py           # Updated settings with auth config
│   └── main.py
├── tests/
│   ├── unit/
│   │   ├── test_auth.py          # Auth unit tests
│   │   └── test_jwt.py           # JWT utility tests
│   ├── integration/
│   │   ├── test_auth_endpoints.py # Auth integration tests
│   │   └── test_protected_routes.py # Protected routes tests
│   └── conftest.py
├── requirements.txt
└── alembic/
    └── versions/
```

**Structure Decision**: Full-stack application structure with dedicated authentication modules that integrate with existing task management functionality. Authentication components are separated in the `src/auth/` directory to maintain clear separation of concerns while allowing integration with existing task services.

## Architecture Sketch

### Authentication Flow
```
Frontend (Better Auth) → JWT issued on login → Token stored in session → Token sent in Authorization header
→ Backend middleware extracts and verifies JWT → User context added to request → Protected routes validate user ownership
```

### JWT Token Structure
- **Header**: alg=HS256, typ=JWT
- **Payload**:
  - sub: user_id (UUID)
  - email: user email
  - exp: expiration timestamp
  - iat: issued at timestamp
- **Signature**: HS256 with BETTER_AUTH_SECRET

### Backend Authentication Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │───▶│  FastAPI        │───▶│   Database      │
│ (Better Auth)   │    │  (Authentication│    │  (Task/User    │
│                 │    │   Layer)        │    │   Relations)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                            │
                       ┌────▼────┐
                       │Auth     │
                       │Middleware│
                       │(JWT Veri│
                       │fication) │
                       └─────────┘
                            │
                       ┌────▼────┐
                       │Auth     │
                       │Dependency│
                       │(User     │
                       │Context)  │
                       └─────────┘
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [N/A] | [N/A] | [N/A] |