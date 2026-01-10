# Tasks: Authentication and API Bridge for Task Management

**Input**: Design documents from `/specs/001-auth-api-bridge/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Integration tests included for authentication flow and user isolation (per spec requirements).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `backend/` and `frontend/` at repository root
- **Backend Python**: `backend/src/models/`, `backend/src/services/`, `backend/src/api/`
- **Frontend TypeScript**: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/lib/`, `frontend/src/types/`
- **Tests**: `backend/tests/integration/`, `frontend/tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize monorepo with Turborepo at root per @specs/001-auth-api-bridge/plan.md
- [X] T002 [P] Create backend directory structure: backend/src/{models,services,api/routes}, backend/tests per @specs/001-auth-api-bridge/plan.md
- [X] T003 [P] Create frontend directory structure: frontend/src/{app,components,lib,types} per @specs/001-auth-api-bridge/plan.md
- [X] T004 [P] Initialize Python project with pyproject.toml and requirements.txt in backend/ per @specs/001-auth-api-bridge/quickstart.md
- [X] T005 [P] Initialize Next.js 16 project with TypeScript strict mode in frontend/ per @specs/001-auth-api-bridge/plan.md
- [X] T006 [P] Create .env.example template at root per @specs/001-auth-api-bridge/quickstart.md
- [X] T007 [P] Install Better Auth package in frontend/ per @specs/001-auth-api-bridge/research.md
- [X] T008 [P] Install FastAPI, SQLModel, Pydantic v2, python-jose in backend/ per @specs/001-auth-api-bridge/plan.md
- [X] T009 [P] Configure Tailwind CSS in frontend/tailwind.config.ts per @specs/001-auth-api-bridge/plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Configuration & Database

- [X] T010 Create backend/src/config.py with environment variable loading per @specs/001-auth-api-bridge/research.md
- [X] T011 Setup Neon PostgreSQL connection with SQLAlchemy engine in backend/src/config.py per @specs/001-auth-api-bridge/research.md
- [ ] T012 Configure Alembic for database migrations in backend/alembic/ per @specs/001-auth-api-bridge/data-model.md
- [ ] T013 Create initial database migration (001_initial_schema.py) for users and tasks tables per @specs/001-auth-api-bridge/data-model.md

### Backend Base Application

- [X] T014 Create FastAPI application entry point in backend/src/main.py per @specs/001-auth-api-bridge/plan.md
- [X] T015 Add CORS middleware to backend/src/main.py per @specs/001-auth-api-bridge/quickstart.md
- [X] T016 Create health check endpoint in backend/src/api/routes/health.py per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [X] T017 Register health check route in backend/src/main.py returning HealthResponse per @specs/001-auth-api-bridge/contracts/pydantic-models.md

### Frontend Base Configuration

- [X] T018 Create TypeScript types in frontend/src/types/task.ts matching Pydantic models per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [X] T019 Configure Better Auth in frontend/src/lib/auth.ts per @specs/001-auth-api-bridge/research.md
- [X] T020 Create root layout in frontend/src/app/layout.tsx with auth provider per @specs/001-auth-api-bridge/plan.md
- [X] T021 Create home/landing page in frontend/src/app/page.tsx per @specs/001-auth-api-bridge/plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Access to Personal Tasks (Priority: P1) 🎯 MVP

**Goal**: Implement JWT authentication middleware and verify user isolation on task list endpoint

**Independent Test**: Create two users via Better Auth, have each create tasks, verify neither can access the other's tasks through API or Swagger UI

### Integration Tests for US1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T022 [P] [US1] Create integration test for JWT token verification in backend/tests/integration/test_auth_flow.py per @specs/001-auth-api-bridge/spec.md
- [ ] T023 [P] [US1] Create integration test for user isolation in backend/tests/integration/test_user_isolation.py per @specs/001-auth-api-bridge/spec.md
- [ ] T024 [P] [US1] Create integration test for expired token handling in backend/tests/integration/test_auth_flow.py per @specs/001-auth-api-bridge/spec.md

### Backend Implementation for US1

- [X] T025 [P] [US1] Create UserTable SQLModel in backend/src/models/user.py per @specs/001-auth-api-bridge/data-model.md
- [X] T026 [P] [US1] Create TaskTable SQLModel in backend/src/models/task.py per @specs/001-auth-api-bridge/data-model.md
- [X] T027 [US1] Create JWT verification service in backend/src/services/auth.py per @specs/001-auth-api-bridge/research.md
- [X] T028 [US1] Create get_current_user dependency in backend/src/api/dependencies.py per @specs/001-auth-api-bridge/research.md
- [X] T029 [US1] Create TaskResponse and TaskListResponse Pydantic models in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [X] T030 [US1] Implement GET /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py with user_id filtering per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [X] T031 [US1] Add user ownership verification to GET /api/{user_id}/tasks endpoint (path user_id must match JWT sub) per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [X] T032 [US1] Implement ErrorResponse model and 401/403 error handling in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/contracts/pydantic-models.md

### Frontend Implementation for US1

- [ ] T033 [US1] Create login page in frontend/src/app/login/page.tsx using Better Auth per @specs/001-auth-api-bridge/plan.md
- [X] T034 [US1] Create API client in frontend/src/lib/api-client.ts with Bearer token handling per @specs/001-auth-api-bridge/research.md
- [ ] T035 [US1] Create server-side session retrieval in frontend/src/lib/auth.ts per @specs/001-auth-api-bridge/research.md
- [ ] T036 [US1] Create protected route middleware in frontend/src/middleware.ts per @specs/001-auth-api-bridge/research.md

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently via Swagger UI

---

## Phase 4: User Story 2 - Mark Task as Complete (Priority: P2)

**Goal**: Users can mark tasks as complete through API with proper timestamp recording

**Independent Test**: Create a task, call PATCH /api/{user_id}/tasks/{id}/complete, verify completed=true and completed_at timestamp set

### Integration Tests for US2

- [ ] T037 [P] [US2] Create integration test for task completion endpoint in backend/tests/integration/test_task_completion.py per @specs/001-auth-api-bridge/spec.md
- [ ] T038 [P] [US2] Create integration test for idempotent completion (complete twice) in backend/tests/integration/test_task_completion.py per @specs/001-auth-api-bridge/spec.md
- [ ] T039 [P] [US2] Create integration test for completing another user's task (should 403) in backend/tests/integration/test_task_completion.py per @specs/001-auth-api-bridge/spec.md

### Backend Implementation for US2

- [ ] T040 [P] [US2] Create CompleteTaskRequest Pydantic model in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [ ] T041 [US2] Create Task CRUD service with complete_task method in backend/src/services/task.py per @specs/001-auth-api-bridge/data-model.md
- [ ] T042 [US2] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [ ] T043 [US2] Add user ownership verification to complete endpoint (403 if task.user_id != JWT user_id) per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [ ] T044 [US2] Implement idempotent completion logic (return current state if already completed) per @specs/001-auth-api-bridge/api/rest-endpoints.md

### Frontend Implementation for US2

- [ ] T045 [P] [US2] Create task-list.tsx component in frontend/src/app/dashboard/components/task-list.tsx per @specs/001-auth-api-bridge/plan.md
- [ ] T046 [P] [US2] Create task-item.tsx component in frontend/src/app/dashboard/components/task-item.tsx per @specs/001-auth-api-bridge/plan.md
- [ ] T047 [US2] Add completeTask function to frontend/src/lib/api-client.ts calling PATCH complete endpoint per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [ ] T048 [US2] Add optimistic UI update for task completion in task-item.tsx per @specs/001-auth-api-bridge/plan.md

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Task Details (Priority: P3)

**Goal**: Users can view detailed information about specific tasks

**Independent Test**: Create a task, retrieve it via GET /api/{user_id}/tasks/{id}, verify all fields present

### Integration Tests for US3

- [ ] T049 [P] [US3] Create integration test for get task by ID endpoint in backend/tests/integration/test_task_details.py per @specs/001-auth-api-bridge/spec.md
- [ ] T050 [P] [US3] Create integration test for viewing another user's task (should 403) in backend/tests/integration/test_task_details.py per @specs/001-auth-api-bridge/spec.md
- [ ] T051 [P] [US3] Create integration test for viewing non-existent task (should 404) in backend/tests/integration/test_task_details.py per @specs/001-auth-api-bridge/spec.md

### Backend Implementation for US3

- [ ] T052 [US3] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [ ] T053 [US3] Add user ownership verification to get task endpoint (403 if task.user_id != JWT user_id) per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [ ] T054 [US3] Add 404 Not Found handling for non-existent tasks per @specs/001-auth-api-bridge/api/rest-endpoints.md

### Frontend Implementation for US3

- [ ] T055 [US3] Create dashboard page in frontend/src/app/dashboard/page.tsx as Server Component per @specs/001-auth-api-bridge/plan.md
- [ ] T056 [US3] Add task detail view to task-item.tsx component per @specs/001-auth-api-bridge/plan.md
- [ ] T057 [US3] Add loading states to dashboard page during data fetching per @specs/001-auth-api-bridge/quickstart.md

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Additional CRUD Operations (Task Creation)

**Goal**: Users can create new tasks (foundational for testing other features)

- [X] T058 [P] Create TaskCreateRequest Pydantic model in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [X] T059 [P] Implement create_task method in Task CRUD service in backend/src/services/task.py per @specs/001-auth-api-bridge/data-model.md
- [X] T060 Implement POST /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [X] T061 Add request validation (title required, description optional) to create endpoint per @specs/001-auth-api-bridge/contracts/pydantic-models.md
- [X] T062 Return 201 Created with TaskResponse from create endpoint per @specs/001-auth-api-bridge/api/rest-endpoints.md

### Frontend Task Creation

- [X] T063 [P] Create create-task-form.tsx Client Component in frontend/src/app/dashboard/components/ per @specs/001-auth-api-bridge/plan.md
- [X] T064 Add createTask function to frontend/src/lib/api-client.ts calling POST tasks endpoint per @specs/001-auth-api-bridge/api/rest-endpoints.md
- [X] T065 Add form validation to create-task-form.tsx (title required) per @specs/001-auth-api-bridge/data-model.md
- [X] T066 Add optimistic UI update for task creation in dashboard per @specs/001-auth-api-bridge/plan.md

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Observability & Logging

- [ ] T067 [P] Add structured JSON logging with user_id and request_id to backend/src/main.py per @specs/001-auth-api-bridge/plan.md
- [ ] T068 [P] Add error logging with context to backend/src/api/dependencies.py per @specs/001-auth-api-bridge/plan.md
- [ ] T069 [P] Add performance metrics tracking (API response time) to backend/src/main.py per @specs/001-auth-api-bridge/plan.md

### Documentation

- [ ] T070 [P] Update .env.example with complete environment variable documentation per @specs/001-auth-api-bridge/quickstart.md
- [ ] T071 [P] Add code comments to JWT verification service explaining token flow per @specs/001-auth-api-bridge/research.md
- [ ] T072 [P] Add docstrings to all Pydantic models explaining validation rules per @specs/001-auth-api-bridge/contracts/pydantic-models.md

### Error Handling & UX

- [ ] T073 [P] Add error boundaries to frontend layout per @specs/001-auth-api-bridge/plan.md
- [ ] T074 [P] Add user-friendly error messages in API client for 401/403/404 responses per @specs/001-auth-api-bridge/quickstart.md
- [ ] T075 [P] Add loading indicators to all async operations in frontend per @specs/001-auth-api-bridge/plan.md

### Code Quality

- [ ] T076 [P] Run TypeScript type checking (tsc --noEmit) and fix any errors per constitution Definition of Done
- [ ] T077 [P] Run Python type checking (mypy backend/) and fix any errors per constitution Definition of Done
- [ ] T078 [P] Run ESLint on frontend/ and fix all warnings per constitution Definition of Done
- [ ] T079 [P] Run Ruff on backend/ and fix all warnings per constitution Definition of Done

### Final Verification

- [ ] T080 Verify all integration tests pass per constitution Definition of Done
- [ ] T081 Verify Swagger UI accessible at http://localhost:8000/docs with all endpoints documented per @specs/001-auth-api-bridge/plan.md
- [ ] T082 Test complete user flow: Login → Create Task → Complete Task → View Details per @specs/001-auth-api-bridge/spec.md
- [ ] T083 Verify user isolation with two test users per @specs/001-auth-api-bridge/spec.md (US1 acceptance scenarios)
- [ ] T084 Verify no hardcoded secrets in code (all config from env vars) per constitution Definition of Done

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (Secure Access, P1) - Can start after Foundational (Phase 2)
  - User Story 2 (Mark Complete, P2) - Can start after Foundational (Phase 2), integrates with US1
  - User Story 3 (View Details, P3) - Can start after Foundational (Phase 2), integrates with US1
  - Task Creation (Phase 6) - Can start after Foundational (Phase 2), needed for testing
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires tasks from US1 to test completion
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires tasks from US1 to view
- **Task Creation (Phase 6)**: Can start after Foundational (Phase 2) - Enables testing of all other stories

### Within Each User Story

- Integration tests MUST be written and FAIL before implementation (TDD)
- Models before services
- Services before endpoints
- Core implementation before frontend integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (Phase 1)
- All Foundational tasks marked [P] can run in parallel within Phase 2
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create integration test for JWT token verification in backend/tests/integration/test_auth_flow.py"
Task: "Create integration test for user isolation in backend/tests/integration/test_user_isolation.py"
Task: "Create integration test for expired token handling in backend/tests/integration/test_auth_flow.py"

# Launch all models for User Story 1 together:
Task: "Create UserTable SQLModel in backend/src/models/user.py"
Task: "Create TaskTable SQLModel in backend/src/models/task.py"

# These can run in parallel after models complete:
Task: "Create JWT verification service in backend/src/services/auth.py"
Task: "Create TaskResponse and TaskListResponse Pydantic models in backend/src/api/routes/tasks.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Secure Access)
4. **STOP and VALIDATE**: Test JWT authentication and user isolation via Swagger UI
5. Demo authentication bridge before proceeding

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Secure Access) → Test auth flow → Demo (MVP!)
3. Add Task Creation (Phase 6) → Enable task creation → Demo
4. Add User Story 2 (Mark Complete) → Test completion → Demo
5. Add User Story 3 (View Details) → Test details → Demo
6. Add Polish (Phase 7) → Production-ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Secure Access)
   - Developer B: Task Creation (Phase 6)
   - Developer C: User Story 2 (Mark Complete)
3. Stories complete and integrate independently

---

## Directory-Grouped Tasks (for Claude Code Context Optimization)

### Backend Tasks (Group for Context Switching)

**Setup & Config**: T001, T002, T004, T006, T008, T010, T011, T014, T015, T016, T017
**Models & Database**: T012, T013, T025, T026
**Auth & Security**: T027, T028, T032, T043, T053
**Services**: T041, T042
**Routes & Endpoints**: T029, T030, T031, T040, T044, T052, T054, T058, T060, T061, T062
**Tests**: T022, T023, T024, T037, T038, T039, T049, T050, T051, T080
**Polish**: T067, T068, T069, T071, T072, T077, T079

### Frontend Tasks (Group for Context Switching)

**Setup & Config**: T003, T005, T007, T009, T018, T019, T020, T021
**Auth**: T033, T034, T035, T036
**Components**: T045, T046, T048, T055, T056, T063, T065, T066, T073
**API Client**: T034, T047, T057, T064
**Polish**: T074, T075, T076, T078

### Root/Shared Tasks

**Environment**: T006, T070
**Verification**: T081, T082, T083, T084

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Swagger UI testing recommended after each backend phase
- Frontend testing recommended after each frontend component
- All tasks reference specific spec files for implementation details

---

## Task Summary

- **Total Tasks**: 84
- **Setup Phase**: 9 tasks (T001-T009)
- **Foundational Phase**: 12 tasks (T010-T021)
- **User Story 1 (P1)**: 15 tasks (T022-T036) - 3 tests + 13 implementation
- **User Story 2 (P2)**: 12 tasks (T037-T048) - 3 tests + 9 implementation
- **User Story 3 (P3)**: 9 tasks (T049-T057) - 3 tests + 6 implementation
- **Task Creation**: 9 tasks (T058-T066)
- **Polish Phase**: 18 tasks (T067-T084)

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Two users cannot access each other's tasks
- US2: Task completion sets timestamp correctly
- US3: Task details display all fields accurately
