---

description: "Task list for Todo AI Chatbot with MCP Integration implementation"
---

# Tasks: Todo AI Chatbot with MCP Integration

**Input**: Design documents from `/specs/001-chatbot-mcp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Integration tests are included as this feature requires cross-boundary testing per constitution principle VI.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below reflect the monorepo structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are the actual implementation tasks for this
  feature, organized by user story to enable independent testing and delivery.

  Each user story (P1, P2, P3) can be implemented and tested independently.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [X] T001 Install backend dependencies in backend/requirements.txt: openai>=1.0.0, anthropic-mcp-sdk>=0.1.0
- [X] T002 [P] Install frontend dependency @anthropics/chatkit-react in frontend/package.json
- [X] T003 [P] Update backend/.env with OPENAI_API_KEY, NEON_DATABASE_URL, MCP_SERVER_PORT, OPENAI_MODEL
- [X] T004 [P] Update frontend/.env.local with NEXT_PUBLIC_OPENAI_DOMAIN_KEY, NEXT_PUBLIC_API_URL
- [X] T005 Create backend/src/mcp directory for MCP server implementation
- [X] T006 [P] Create backend/src/agents directory for OpenAI Agents SDK orchestration
- [X] T007 [P] Create backend/src/api/schemas directory for Pydantic request/response models
- [X] T008 [P] Create frontend/src/components/chat directory for chat UI components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [X] T009 Create ConversationTable model in backend/src/models/conversation.py with id, user_id, title, created_at, updated_at fields
- [X] T010 [P] Create MessageTable model in backend/src/models/message.py with id, conversation_id, role, content, created_at, metadata fields
- [X] T011 [P] Update backend/src/models/__init__.py to export ConversationTable and MessageTable
- [X] T012 Update backend/src/models/user.py to add conversations relationship (back_populates="user")

### Database Migration

- [X] T013 Create Alembic migration in alembic/versions/001_add_chatbot_tables.py to create conversations table
- [X] T014 Create Alembic migration in alembic/versions/001_add_chatbot_tables.py to create messages table
- [X] T015 Create Alembic migration indexes: (user_id, updated_at DESC) on conversations, (conversation_id, created_at ASC) on messages

### MCP Server Infrastructure

- [X] T016 Create MCP server initialization in backend/src/mcp/server.py using mcp.Server("todo-mcp-server")
- [X] T017 [P] Create MCP tool registry in backend/src/mcp/tools.py with decorator pattern for tool registration
- [X] T018 Implement MCP service wrapper in backend/src/services/mcp.py for MCP server lifecycle management

### Backend Configuration

- [X] T019 Update backend/src/config.py to add OPENAI_API_KEY, NEON_DATABASE_URL, MCP_SERVER_PORT, OPENAI_MODEL environment variable loading
- [X] T020 [P] Update backend/src/main.py to include MCP server startup configuration

### Backend Schemas

- [X] T021 Create ChatRequest Pydantic schema in backend/src/api/schemas/chat.py with conversation_id (optional), message (required) fields
- [X] T022 [P] Create ChatResponse Pydantic schema in backend/src/api/schemas/chat.py with conversation_id, message, tasks fields
- [X] T023 [P] Create Message schema in backend/src/api/schemas/chat.py with id, role, content, created_at fields
- [X] T024 [P] Update backend/src/api/schemas/__init__.py to export chat schemas

**Checkpoint**: Foundation ready - User Story 1 implementation can now begin

---

## Phase 3: User Story 1 - Start New Chat Conversation (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks via natural language chat interface

**Independent Test**: A user can open the chat interface, send "Add a task to buy groceries", and verify the task appears in their task list with the correct title.

### MCP Tools Implementation (US1)

- [ ] T025 [P] [US1] Implement add_task tool in backend/src/mcp/tools.py with user_id, title, description parameters
- [ ] T026 [P] [US1] Implement list_tasks tool in backend/src/mcp/tools.py with user_id, include_completed parameters
- [ ] T027 [P] [US1] Implement complete_task tool in backend/src/mcp/tools.py with user_id, task_id parameters
- [ ] T028 [P] [US1] Implement delete_task tool in backend/src/mcp/tools.py with user_id, task_id parameters
- [ ] T029 [P] [US1] Implement update_task tool in backend/src/mcp/tools.py with user_id, task_id, title, description parameters

### MCP Tool Logic (US1)

- [ ] T030 [US1] Implement add_task tool logic in backend/src/mcp/tools.py that calls existing backend/src/services/task.py TaskService.create_task()
- [ ] T031 [P] [US1] Implement list_tasks tool logic in backend/src/mcp/tools.py that calls existing backend/src/services/task.py TaskService.list_tasks()
- [ ] T032 [P] [US1] Implement complete_task tool logic in backend/src/mcp/tools.py that calls existing backend/src/services/task.py TaskService.complete_task()
- [ ] T033 [P] [US1] Implement delete_task tool logic in backend/src/mcp/tools.py that calls existing backend/src/services/task.py TaskService.delete_task()
- [ ] T034 [P] [US1] Implement update_task tool logic in backend/src/mcp/tools.py that calls existing backend/src/services/task.py TaskService.update_task()

### OpenAI Agent Orchestration (US1)

- [ ] T035 [US1] Create TodoAgent class in backend/src/agents/todo_agent.py with OpenAI client initialization
- [ ] T036 [US1] Define agent system prompt in backend/src/agents/todo_agent.py for friendly, concise, task-oriented behavior
- [ ] T037 [US1] Register MCP tools as OpenAI agent functions in backend/src/agents/todo_agent.py with proper JSON schemas
- [ ] T038 [US1] Implement agent conversation runner in backend/src/agents/todo_agent.py with message processing and tool execution

### Chat Business Logic (US1)

- [ ] T039 [US1] Create chat service in backend/src/services/chat.py with create_conversation() for new conversations
- [ ] T040 [P] [US1] Implement store_message() in backend/src/services/chat.py to save user and AI messages
- [ ] T041 [P] [US1] Implement get_conversation_history() in backend/src/services/chat.py with user_id validation
- [ ] T042 [P] [US1] Implement sanitize_user_input() in backend/src/services/chat.py for prompt injection prevention

### Chat Endpoint (US1)

- [ ] T043 [US1] Create POST /api/{user_id}/chat endpoint in backend/src/api/routes/chat.py
- [ ] T044 [US1] Implement JWT authentication dependency in backend/src/api/routes/chat.py to extract user_id from token
- [ ] T045 [US1] Implement conversation_id validation in backend/src/api/routes/chat.py to verify user ownership
- [ ] T046 [US1] Implement conversation creation logic in backend/src/api/routes/chat.py for first messages
- [ ] T047 [US1] Integrate OpenAI agent in backend/src/api/routes/chat.py with MCP tool execution
- [ ] T048 [US1] Implement AI response persistence in backend/src/api/routes/chat.py with metadata for tool calls
- [ ] T049 [US1] Add error handling in backend/src/api/routes/chat.py for OpenAI API failures with user-friendly messages
- [ ] T050 [US1] Add request logging in backend/src/api/routes/chat.py with user_id, conversation_id, processing_time

### Frontend Chat UI (US1)

- [ ] T051 [US1] Install @anthropics/chatkit-react dependency in frontend/package.json
- [ ] T052 [US1] Create chat page in frontend/src/app/chat/page.tsx as Server Component
- [ ] T053 [US1] Create loading state in frontend/src/app/chat/loading.tsx
- [ ] T054 [US1] Create ChatContainer component in frontend/src/components/chat/ChatContainer.tsx as Client Component
- [ ] T055 [US1] Implement useChat hook in frontend/src/components/chat/ChatContainer.tsx with /api/chat endpoint
- [ ] T056 [US1] Create MessageList component in frontend/src/components/chat/MessageList.tsx to display messages
- [ ] T057 [US1] Create ChatInput component in frontend/src/components/chat/ChatInput.tsx for user input
- [ ] T058 [US1] Create TypingIndicator component in frontend/src/components/chat/TypingIndicator.tsx for loading state
- [ ] T059 [US1] Style chat components with Tailwind CSS in frontend/src/components/chat/ per design system

### Frontend API Client (US1)

- [ ] T060 [US1] Update frontend/src/lib/api-client.ts to add chatApiClient with sendMessage() function
- [ ] T061 [P] [US1] Update frontend/src/lib/types.ts to add ChatMessage, ChatRequest, ChatResponse type definitions

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create tasks via chat

---

## Phase 4: User Story 2 - View and Manage Tasks via Chat (Priority: P2)

**Goal**: Enable users to list, complete, update, and delete tasks through natural language

**Independent Test**: A user can ask "Show me my tasks" and see a list, then ask "Mark the first task as complete" and verify the task's completion status updates.

### AI System Prompt Enhancement (US2)

- [ ] T062 [US2] Enhance system prompt in backend/src/agents/todo_agent.py with task operation guidance
- [ ] T063 [P] [US2] Add clarification requests to backend/src/agents/todo_agent.py for ambiguous task references
- [ ] T064 [P] [US2] Add confirmation prompts to backend/src/agents/todo_agent.py for destructive operations (deletion)

### Task Reference Resolution (US2)

- [ ] T065 [US2] Implement task reference resolution in backend/src/services/chat.py for "the first/second task" patterns
- [ ] T066 [P] [US2] Implement fuzzy task matching in backend/src/services/chat.py for "the grocery task" patterns
- [ ] T067 [P] [US2] Add clarification logic in backend/src/services/chat.py when multiple tasks match

### Frontend Task Display (US2)

- [ ] T068 [US2] Update ChatResponse in frontend/src/lib/types.ts to include tasks array with task state
- [ ] T069 [P] [US2] Update MessageList in frontend/src/components/chat/MessageList.tsx to display task state changes
- [ ] T070 [P] [US2] Add task cards to frontend/src/components/chat/MessageList.tsx showing title, completion status

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - full CRUD via chat

---

## Phase 5: User Story 3 - Multi-Turn Conversations with Context (Priority: P3)

**Goal**: Enable context-aware conversations that understand references to previously mentioned tasks

**Independent Test**: A user can create a task, then refer to "that task" in subsequent messages, and the system correctly identifies the task.

### Conversation History Management (US3)

- [ ] T071 [US3] Implement LRU cache in backend/src/services/chat.py for conversation history with 100-entry limit
- [ ] T072 [P] [US3] Add cache invalidation in backend/src/services/chat.py on new message creation
- [ ] T073 [P] [US3] Implement message limiting in backend/src/services/chat.py with 50-message default limit

### Context Window Management (US3)

- [ ] T074 [US3] Update agent runner in backend/src/agents/todo_agent.py to load conversation history from database
- [ ] T075 [P] [US3] Implement context window optimization in backend/src/agents/todo_agent.py to include last N messages
- [ ] T076 [P] [US3] Add conversation continuation logic in backend/src/api/routes/chat.py for existing conversations

### Frontend Context Persistence (US3)

- [ ] T077 [US3] Update ChatContainer in frontend/src/components/chat/ChatContainer.tsx to maintain conversation_id state
- [ ] T078 [P] [US3] Implement conversation history loading in frontend/src/app/chat/page.tsx on initial render
- [ ] T079 [P] [US3] Add conversation restoration in frontend/src/components/chat/ChatContainer.tsx for returning users

**Checkpoint**: All user stories should now be independently functional with full context awareness

---

## Phase 6: Integration Testing (Cross-Cutting)

**Purpose**: Validate cross-boundary communication per constitution principle VI

### Contract Tests

- [ ] T080 [P] Create OpenAPI contract test in backend/tests/contract/test_chat_api.py for POST /api/{user_id}/chat
- [ ] T081 [P] Add request validation test in backend/tests/contract/test_chat_api.py for ChatRequest schema
- [ ] T082 [P] Add response validation test in backend/tests/contract/test_chat_api.py for ChatResponse schema

### Integration Tests

- [ ] T083 [P] Create chat endpoint integration test in backend/tests/integration/test_chat.py for task creation flow
- [ ] T084 [P] Add JWT authentication test in backend/tests/integration/test_chat.py for user isolation
- [ ] T085 [P] Add conversation ownership test in backend/tests/integration/test_chat.py for cross-user access prevention
- [ ] T086 [P] Create AI service failure test in backend/tests/integration/test_chat.py for graceful error handling
- [ ] T087 [P] Add MCP tool execution test in backend/tests/integration/test_chat.py for all 5 tools
- [ ] T088 [P] Create frontend-backend integration test in frontend/tests/integration/test-chat.spec.ts for chat flow

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T089 [P] Add typing indicators to frontend/src/components/chat/ChatInput.tsx during AI processing
- [ ] T090 [P] Implement error boundary in frontend/src/components/chat/ChatContainer.tsx for chat error handling
- [ ] T091 [P] Add structured logging to backend/src/api/routes/chat.py with request_id tracing
- [ ] T092 [P] Add performance metrics logging to backend/src/agents/todo_agent.py with AI processing time
- [ ] T093 [P] Create quickstart validation test to verify quickstart.md instructions work
- [ ] T094 Update README.md or quickstart.md with any discovered setup issues

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Builds on US1 but independently testable
  - User Story 3 (P3): Can start after Foundational - May integrate with US1/US2 but independently testable
- **Integration Testing (Phase 6)**: Depends on all desired user stories being complete
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 tools but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances US1/US2 with context but independently testable

### Within Each User Story

- Models before services
- MCP tools before agent orchestration
- Agent orchestration before chat endpoint
- Chat endpoint before frontend UI
- Tests after implementation

### Parallel Opportunities

- **Setup (Phase 1)**: All tasks (T001-T008) can run in parallel
- **Foundational (Phase 2)**: T009-T012 (models) can run in parallel; T013-T015 (migration) sequential; T016-T020 (infrastructure) can run in parallel within groups
- **User Story 1**: T025-T029 (MCP tools) can run in parallel; T030-T034 (tool logic) can run in parallel; T051-T059 (frontend UI) can run in parallel after backend
- **User Story 2**: T062-T064 (system prompt) can run in parallel; T068-T070 (frontend) can run in parallel
- **User Story 3**: T071-T073 (history management) can run in parallel; T077-T079 (frontend) can run in parallel
- **Integration Tests**: All tests (T080-T088) can run in parallel
- **Polish**: All tasks (T089-T094) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all MCP tool implementations together:
Task: "Implement add_task tool in backend/src/mcp/tools.py with user_id, title, description parameters"
Task: "Implement list_tasks tool in backend/src/mcp/tools.py with user_id, include_completed parameters"
Task: "Implement complete_task tool in backend/src/mcp/tools.py with user_id, task_id parameters"
Task: "Implement delete_task tool in backend/src/mcp/tools.py with user_id, task_id parameters"
Task: "Implement update_task tool in backend/src/mcp/tools.py with user_id, task_id, title, description parameters"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T024) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T025-T061)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - Users can now create tasks via chat (MVP!)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T025-T061)
   - Developer B: User Story 2 (T062-T070)
   - Developer C: User Story 3 (T071-T079)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests pass before marking tasks complete
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 94
- Tasks per user story: US1 (37 tasks), US2 (9 tasks), US3 (9 tasks), plus Setup (8), Foundational (16), Testing (9), Polish (6)
- Parallel opportunities: 45 tasks marked with [P] for parallel execution
