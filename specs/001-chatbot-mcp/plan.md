# Implementation Plan: Todo AI Chatbot with MCP Integration

**Branch**: `001-chatbot-mcp` | **Date**: 2026-01-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-chatbot-mcp/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan implements an AI-powered chatbot interface for the existing Todo application, enabling users to manage tasks through natural language conversation. The implementation follows the constitution's AI Chatbot Architecture principle (VIII), ensuring stateless server design, MCP-first task operations, and proper user isolation.

**Technical Approach**:
- Add Conversation and Message tables to existing Neon PostgreSQL database via SQLModel migrations
- Implement MCP Python SDK server with 5 core tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Create FastAPI endpoint `/api/{user_id}/chat` that orchestrates OpenAI Agents SDK with MCP tools
- Build frontend chat interface using ChatKit integrated with existing Next.js 16 application
- Configure environment variables for OpenAI API key, Neon database URL, and domain keys

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.9+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, OpenAI Agents SDK, Official MCP Python SDK, Pydantic v2
- Frontend: Next.js 16, ChatKit, React Server Components
**Storage**: Neon PostgreSQL (serverless Postgres) - existing database with new tables
**Testing**: pytest (backend), Vitest (frontend)
**Target Platform**: Vercel (frontend), Railway/Render (backend FastAPI server)
**Project Type**: web (monorepo with frontend + backend)
**Performance Goals**:
- Chat API response time: <3 seconds p95 (including AI processing)
- Task creation via chat: <10 seconds end-to-end
- Support 100 concurrent chat sessions
**Constraints**:
- Stateless server architecture (per constitution principle VIII)
- All task operations MUST go through MCP SDK (no direct DB access for tasks)
- Every operation must include user_id for data isolation
- Single POST endpoint for all chat interactions
**Scale/Scope**:
- Initial deployment for ~100 users
- Target: 1000 concurrent sessions post-MVP
- Conversation history: up to 100 messages per conversation before archival

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Monorepo Architecture ✅ PASS

**Requirement**: All code in monorepo with clear frontend/backend separation

**Compliance**:
- Backend: New chat endpoint in `backend/src/api/routes/chat.py`
- Frontend: New chat page component in `frontend/src/app/chat/page.tsx`
- Models: New `backend/src/models/conversation.py` and `message.py`
- MCP server: New `backend/src/mcp/` directory with server implementation
- **No new repositories or projects required**

### II. Spec-Driven Development ✅ PASS

**Requirement**: Implementation derived from specification artifacts

**Compliance**:
- This plan.md is derived from spec.md
- All user stories (P1: Start Chat, P2: Manage Tasks, P3: Multi-Turn Context) mapped to implementation phases
- tasks.md will be generated next via `/sp.tasks` command

### III. User Isolation via JWT ✅ PASS

**Requirement**: Enforce user data isolation through JWT-based authentication

**Compliance**:
- All database queries filter by user_id from JWT `sub` claim
- Conversation and Message tables include user_id foreign key
- Chat endpoint validates JWT and extracts user_id before processing
- MCP tool calls include user_id parameter
- Conversation ownership validated before allowing access

### IV. Frontend Server-First ✅ PASS

**Requirement**: Prioritize React Server Components over Client Components

**Compliance**:
- Chat page uses Next.js App Router with Server Components by default
- Only chat input area uses Client Component for real-time interactivity
- Message history rendered server-side on initial load
- Tailwind CSS for all styling

### V. Type Safety and Validation ✅ PASS

**Requirement**: Strict type safety across frontend and backend

**Compliance**:
- Backend: Pydantic models for request/response validation
- Frontend: TypeScript strict mode for all components
- Database: SQLModel with explicit types and constraints
- API contracts: OpenAPI schema auto-generated from FastAPI

### VI. Integration Testing ⚠️ ACTION REQUIRED

**Requirement**: Cross-boundary communication testing

**Compliance**:
- MUST add integration tests for chat endpoint
- MUST test JWT authentication and user isolation for chat
- MUST test error handling across frontend/backend for AI failures
- These tests will be added in tasks.md phase

### VII. Observability ✅ PASS

**Requirement**: Structured logging and request tracing

**Compliance**:
- Chat endpoint logs: user_id, conversation_id, message_count, AI processing time
- MCP tool calls logged with user_id, tool_name, success/failure
- Frontend errors logged with sufficient context

### VIII. AI Chatbot Architecture ✅ PASS (CRITICAL)

**Requirement**: Stateless server, MCP-first, protocol adherence, data isolation

**Compliance**:
- **Statelessness**: No in-memory session storage; conversation history loaded from DB each request
- **MCP First**: All task operations (add_task, list_tasks, complete_task, delete_task, update_task) go through MCP SDK
- **Protocol Adherence**: OpenAI Agents SDK for orchestration, ChatKit for UI
- **Data Isolation**: Every MCP tool call includes user_id; all queries filter by user_id
- **No Direct DB Access**: Agent tools wrap MCP SDK, not direct SQLModel queries
- **Conversation Persistence**: All messages stored in Neon DB with user_id scoping

**Constitution Check Result**: ✅ PASS - All principles satisfied. Integration testing requirements noted for tasks.md phase.

## Project Structure

### Documentation (this feature)

```text
specs/001-chatbot-mcp/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── openapi.yaml     # OpenAPI spec for chat endpoint
│   └── mcp-tools.json   # MCP tool schemas
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # Existing
│   │   ├── task.py          # Existing
│   │   ├── conversation.py  # NEW: Conversation model
│   │   └── message.py       # NEW: Message model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── task.py          # Existing: task CRUD operations
│   │   ├── auth.py          # Existing: JWT validation
│   │   ├── chat.py          # NEW: chat business logic
│   │   └── mcp.py           # NEW: MCP tool implementations
│   ├── mcp/
│   │   ├── __init__.py
│   │   ├── server.py        # NEW: MCP server setup
│   │   └── tools.py         # NEW: 5 MCP tool definitions
│   ├── api/
│   │   ├── dependencies.py  # Existing: JWT dependency
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py    # Existing
│   │   │   ├── tasks.py     # Existing
│   │   │   └── chat.py      # NEW: /api/{user_id}/chat endpoint
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── chat.py      # NEW: request/response schemas
│   ├── agents/
│   │   ├── __init__.py
│   │   └── todo_agent.py    # NEW: OpenAI Agents SDK orchestration
│   ├── config.py            # UPDATE: add new env vars
│   └── main.py              # UPDATE: register chat route
└── tests/
    ├── integration/
    │   └── test_chat.py     # NEW: chat integration tests
    └── contract/
        └── test_chat_api.py # NEW: OpenAPI contract tests

frontend/
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   ├── page.tsx     # NEW: chat page (Server Component)
│   │   │   └── loading.tsx  # NEW: loading state
│   │   └── ...
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx    # NEW: main chat component (Client)
│   │   │   ├── MessageList.tsx      # NEW: message display
│   │   │   ├── ChatInput.tsx        # NEW: input area
│   │   │   └── TypingIndicator.tsx  # NEW: loading state
│   │   └── ...
│   ├── lib/
│   │   ├── api-client.ts  # UPDATE: add chat API client
│   │   └── types.ts       # UPDATE: add chat types
│   └── ...
└── .env.local             # UPDATE: add NEXT_PUBLIC_OPENAI_DOMAIN_KEY

.env                       # UPDATE: add OPENAI_API_KEY, NEON_DATABASE_URL
```

**Structure Decision**: Web application structure (Option 2) - this is a monorepo with existing `/frontend` and `/backend` directories. All new code fits within the established structure.

## Complexity Tracking

> **No constitution violations requiring justification.** All complexity is inherent to the feature (AI chatbot with MCP integration) and compliant with constitutional principles.

## Phase 0: Research & Technology Decisions

### Research Tasks

1. **MCP Python SDK Integration Pattern**
   - Decision: Official MCP Python SDK from Anthropic/modelcontextprotocol
   - Research question: How to structure MCP server with FastAPI?
   - Deliverable: Document MCP server setup pattern, tool registration, and client connection

2. **OpenAI Agents SDK with Custom Tools**
   - Decision: OpenAI Agents SDK (Python) for orchestration
   - Research question: How to register MCP tools as OpenAI agent tools?
   - Deliverable: Document agent initialization, tool registration, and conversation management

3. **ChatKit Integration with Next.js 16**
   - Decision: ChatKit (@anthropics/chatkit-react) for React components
   - Research question: How to integrate ChatKit with Next.js App Router?
   - Deliverable: Document ChatKit setup, component usage, and state management

4. **Conversation History Management**
   - Decision: Retrieve last N messages for context window
   - Research question: Optimal message count for OpenAI context window vs. performance?
   - Deliverable: Document pagination/limiting strategy for conversation history

5. **Prompt Injection Prevention**
   - Decision: Input sanitization + system prompt hardening
   - Research question: Best practices for preventing prompt injection in AI chatbots?
   - Deliverable: Document sanitization approach and system prompt guidelines

### Deliverables: `research.md`

```markdown
# Research: Todo AI Chatbot Technology Decisions

## 1. MCP Python SDK Integration
**Decision**: Use official MCP Python SDK with FastAPI integration pattern
**Rationale**: ...
**Alternatives Considered**: Direct HTTP calls, custom SDK wrapper

## 2. OpenAI Agents SDK with Custom Tools
**Decision**: OpenAI Agents SDK with MCP tool adapters
**Rationale**: ...
**Alternatives Considered**: LangChain, raw OpenAI API

[...]
```

## Phase 1: Design & Contracts

### 1.1 Data Model (`data-model.md`)

```markdown
# Data Model: Todo AI Chatbot

## Entities

### Conversation
- id: UUID (PK)
- user_id: UUID (FK -> users.id)
- created_at: datetime
- updated_at: datetime
- title: string | null (auto-generated from first message)

### Message
- id: UUID (PK)
- conversation_id: UUID (FK -> conversations.id)
- role: enum ('user' | 'assistant')
- content: text
- created_at: datetime
- metadata: jsonb | null (tool calls, tokens used, etc.)

## Relationships
- User -> Conversations: 1:N
- Conversation -> Messages: 1:N
- User -> Messages: 1:N (through conversation)

## Indexes
- conversations: (user_id, updated_at DESC)
- messages: (conversation_id, created_at ASC)
```

### 1.2 API Contracts (`contracts/`)

#### `contracts/openapi.yaml`

```yaml
openapi: 3.0.0
info:
  title: Todo Chat API
  version: 1.0.0
paths:
  /api/{user_id}/chat:
    post:
      summary: Send message to AI chatbot
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [message]
              properties:
                conversation_id:
                  type: string
                  format: uuid
                  description: Existing conversation ID (optional for new chat)
                message:
                  type: string
                  description: User message content
      responses:
        200:
          description: Successful chat response
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversation_id:
                    type: string
                    format: uuid
                  message:
                    type: object
                    properties:
                      id:
                        type: string
                        format: uuid
                      role:
                        type: string
                        enum: [assistant]
                      content:
                        type: string
                      created_at:
                        type: string
                        format: date-time
                  tasks:
                    type: array
                    description: Updated tasks after any tool operations
                    items:
                      $ref: '#/components/schemas/Task'
        401:
          description: Unauthorized
        403:
          description: Forbidden (conversation belongs to different user)
        500:
          description: Internal server error (AI service failure)
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        completed:
          type: boolean
        created_at:
          type: string
          format: date-time
```

#### `contracts/mcp-tools.json`

```json
{
  "tools": [
    {
      "name": "add_task",
      "description": "Create a new todo task for the user",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the user who owns the task"
          },
          "title": {
            "type": "string",
            "description": "Task title"
          },
          "description": {
            "type": "string",
            "description": "Detailed task description"
          }
        },
        "required": ["user_id", "title"]
      }
    },
    {
      "name": "list_tasks",
      "description": "List all tasks for a user",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the user"
          }
        },
        "required": ["user_id"]
      }
    },
    {
      "name": "complete_task",
      "description": "Mark a task as completed",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the user who owns the task"
          },
          "task_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the task to complete"
          }
        },
        "required": ["user_id", "task_id"]
      }
    },
    {
      "name": "delete_task",
      "description": "Delete a task",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the user who owns the task"
          },
          "task_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the task to delete"
          }
        },
        "required": ["user_id", "task_id"]
      }
    },
    {
      "name": "update_task",
      "description": "Update task title or description",
      "inputSchema": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the user who owns the task"
          },
          "task_id": {
            "type": "string",
            "format": "uuid",
            "description": "ID of the task to update"
          },
          "title": {
            "type": "string",
            "description": "New task title"
          },
          "description": {
            "type": "string",
            "description": "New task description"
          }
        },
        "required": ["user_id", "task_id"]
      }
    }
  ]
}
```

### 1.3 Quickstart Guide (`quickstart.md`)

```markdown
# Quickstart: Todo AI Chatbot Development

## Prerequisites

- Python 3.11+
- Node.js 20+
- OpenAI API key
- Neon PostgreSQL database URL

## Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   pip install openai anthropic-mcp-sdk fastapi sqlmodel
   ```

2. Set environment variables:
   ```bash
   export OPENAI_API_KEY=sk-...
   export NEON_DATABASE_URL=postgresql://...
   ```

3. Run database migration:
   ```bash
   python -m src.models.conversation
   python -m src.models.message
   ```

4. Start FastAPI server:
   ```bash
   uvicorn src.main:app --reload
   ```

## Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install @anthropics/chatkit-react
   ```

2. Set environment variable:
   ```bash
   echo "NEXT_PUBLIC_OPENAI_DOMAIN_KEY=sk-..." >> .env.local
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

## Testing

1. Visit http://localhost:3000/chat
2. Type: "Add a task to buy groceries"
3. Verify task appears in your task list

## Troubleshooting

- AI service unavailable: Check OPENAI_API_KEY
- Database errors: Verify NEON_DATABASE_URL
- MCP tools not working: Check MCP server logs
```

## Phase 2: Implementation Outline (for tasks.md)

The following implementation phases will be detailed in `tasks.md`:

### Phase 1: Setup & Database (Foundational)
- Create Conversation and Message SQLModel classes
- Run database migrations
- Update backend config with new environment variables

### Phase 2: MCP Server (User Story 1)
- Implement MCP Python server setup
- Define 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- Create MCP tool wrappers that call existing task service
- Test MCP server independently

### Phase 3: Backend Chat Endpoint (User Story 1)
- Create chat request/response Pydantic schemas
- Implement OpenAI Agents SDK initialization
- Register MCP tools as agent tools
- Create `/api/{user_id}/chat` FastAPI endpoint
- Add JWT authentication and user_id extraction
- Implement conversation creation and message persistence
- Add error handling for AI service failures

### Phase 4: Frontend Chat Interface (User Story 1)
- Install ChatKit dependency
- Create chat page with Server Component
- Implement ChatContainer Client Component
- Connect to /chat endpoint
- Display conversation history
- Handle loading states and errors

### Phase 5: Task Operations via Chat (User Story 2)
- Enhance AI system prompt for task operations
- Add task reference resolution logic
- Update frontend to display task state changes
- Test all 5 MCP tools through chat interface

### Phase 6: Multi-Turn Context (User Story 3)
- Implement conversation history retrieval
- Configure context window management
- Add message limiting for performance
- Test context preservation across turns

### Phase 7: Testing & Polish
- Write integration tests for chat endpoint
- Add contract tests for OpenAPI schema
- Test error scenarios (AI failures, ambiguous references)
- Performance testing (100 concurrent sessions)
- Update documentation

## Environment Variables

### Backend (`.env`)
```bash
# Existing
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...

# New
OPENAI_API_KEY=sk-...
NEON_DATABASE_URL=postgresql://...
MCP_SERVER_PORT=8000
```

### Frontend (`.env.local`)
```bash
# New
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=sk-...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Dependencies

### Backend (add to `requirements.txt` or `pyproject.toml`)
```txt
openai>=1.0.0
anthropic-mcp-sdk>=0.1.0
```

### Frontend (add to `package.json`)
```json
{
  "dependencies": {
    "@anthropics/chatkit-react": "^1.0.0"
  }
}
```

## Success Metrics

- Users can create task via chat in <10 seconds
- Chat API responds in <3 seconds (p95)
- 95% success rate for task creation parsing
- Zero cross-user data leakage
- 100 concurrent sessions supported

## Constitution Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Monorepo Architecture | ✅ PASS | All code in existing frontend/backend structure |
| II. Spec-Driven Development | ✅ PASS | Implementation derived from spec.md and this plan.md |
| III. User Isolation via JWT | ✅ PASS | All operations scoped to user_id from JWT |
| IV. Frontend Server-First | ✅ PASS | Chat page uses Server Components, minimal client state |
| V. Type Safety and Validation | ✅ PASS | Pydantic models, TypeScript strict mode, SQLModel types |
| VI. Integration Testing | ⚠️ TODO | Tests to be added in tasks.md phase |
| VII. Observability | ✅ PASS | Structured logging with user_id, conversation_id |
| VIII. AI Chatbot Architecture | ✅ PASS | Stateless, MCP-first, protocol adherence, data isolation |

**Overall**: ✅ PASS - Ready to proceed to Phase 0 (research) and Phase 1 (design)
