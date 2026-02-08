---
id: 1
title: add-project-constitution
stage: constitution
date: 2026-01-09
surface: agent
model: Claude Sonnet 4.5
feature: none
branch: 001-console-todo
user: user
command: /sp.constitution
labels: [constitution, documentation, setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

```text
$ARGUMENTS
```

Project: Todo Full-Stack Web Application (Hackathon Phase-2)

Core principles:
- Security: All user data and actions must be protected via JWT authentication.
- Accuracy: Backend API endpoints must correctly handle CRUD operations per user.
- Reliability: Backend and frontend must work seamlessly; tasks persist correctly in the database.
- Reproducibility: Implementation must follow the Spec-Kit Plus workflow and be fully traceable.
- Usability: Frontend must provide a responsive and user-friendly interface.

Key standards:
- Backend: RESTful API endpoints implemented using FastAPI and SQLModel ORM.
- Authentication: Better Auth with JWT tokens; backend verifies all requests.
- API behavior: Each endpoint filters tasks by authenticated user ID; unauthorized requests return 401.
- Database: Neon Serverless PostgreSQL for persistent storage.
- Frontend: Next.js 16+ App Router, responsive design, JWT token attached to all API requests.
- Development workflow: Spec → Plan → Tasks → Implementation via Claude Code; no manual coding.
- Testing: All CRUD operations tested per user; task ownership enforced.

Constraints:
- Implement all 5 basic-level features from the original console app as web features.
- API endpoints must cover GET, POST, PUT, DELETE, and PATCH as specified.
- JWT tokens must expire automatically (e.g., 7 days) and be signed with BETTER_AUTH_SECRET.
- Frontend and backend must securely use environment variables for secrets.
- Phase-2 work must be completed following the Agentic Dev Stack workflow.

Success criteria:
- Backend endpoints function correctly, persist data, and enforce task ownership.
- Users can signup/signin and perform CRUD operations securely.
- Frontend reflects backend changes in real-time and is responsive across devices.
- Full traceability of development process with reproducible specifications and plans.

## Response snapshot

The project constitution has been successfully updated with the following details:

**New Version**: 1.0.0 (initial version for this project)
**Bump Rationale**: This is the first version of the constitution for the Todo Full-Stack Web Application project, incorporating all the specified principles and requirements.

**Files Updated**:
- `.specify/memory/constitution.md` - Updated with all specified principles, standards, constraints, and governance rules

**Summary of Changes**:
- Created a comprehensive constitution document with 6 core principles: Security, Accuracy, Reliability, Reproducibility, Usability, and Development Workflow
- Included detailed Key Standards covering backend, authentication, API behavior, database, and frontend requirements
- Added specific Constraints for implementing the web application features
- Defined Governance rules for API endpoint enforcement and development workflow
- Added version tracking with proper dates in ISO format

**Suggested commit message**: `docs: add project constitution v1.0.0 for Todo Full-Stack Web Application`

The constitution now serves as the authoritative document for the project, establishing clear principles and guidelines for the development of the Todo Full-Stack Web Application following the Agentic Dev Stack workflow with Claude Code and Spec-Kit Plus.

## Outcome

- ✅ Impact: Created initial project constitution document with all specified principles
- 🧪 Tests: No tests required for documentation update
- 📁 Files: Updated .specify/memory/constitution.md with new constitution
- 🔁 Next prompts: Continue with spec, plan, and tasks creation for the project
- 🧠 Reflection: Constitution properly captures all specified requirements and constraints

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin creating feature specification based on constitution