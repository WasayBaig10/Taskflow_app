# Quickstart: Todo AI Chatbot Development

**Feature**: 001-chatbot-mcp
**Last Updated**: 2026-01-11

This guide helps you set up and run the Todo AI Chatbot feature locally.

## Prerequisites

Before starting, ensure you have:

- **Python 3.11+** - Backend runtime
- **Node.js 20+** - Frontend runtime
- **Git** - Version control
- **OpenAI API key** - Get from https://platform.openai.com/api-keys
- **Neon PostgreSQL database** - Get free database at https://neon.tech
- **Existing Todo app** - This feature extends the existing application

## Step 1: Clone and Setup Repository

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-org/todo-app.git
cd todo-app

# Switch to the chatbot feature branch
git checkout 001-chatbot-mcp

# Install root dependencies
npm install
```

## Step 2: Backend Setup

### 2.1 Install Python Dependencies

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add new dependencies for chatbot feature
pip install openai anthropic-mcp-sdk
```

### 2.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# .env

# Existing variables (keep your current values)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
BETTER_AUTH_SECRET=your-secret-key

# New variables for chatbot feature
OPENAI_API_KEY=sk-your-openai-api-key-here
NEON_DATABASE_URL=postgresql://user:pass@ep-cool-neon.us-east-2.aws.neon.tech/dbname
OPENAI_MODEL=gpt-4-turbo-preview
MCP_SERVER_PORT=8000

# Optional
DEBUG=false
LOG_LEVEL=info
```

### 2.3 Run Database Migrations

```bash
# Make sure your virtual environment is activated
source venv/bin/activate

# Run Alembic migrations to create new tables
alembic upgrade head

# Verify tables were created
# You should see 'conversations' and 'messages' tables
python -c "from sqlmodel import Session; from src.models import engine; print('Tables OK')"
```

### 2.4 Test Backend Server

```bash
# Start the FastAPI development server
uvicorn src.main:app --reload --port 8000

# In another terminal, test the health endpoint
curl http://localhost:8000/health

# You should see: {"status": "ok"}
```

## Step 3: Frontend Setup

### 3.1 Install Node Dependencies

```bash
cd ../frontend

# Install dependencies
npm install

# Install ChatKit for chat UI components
npm install @anthropics/chatkit-react
```

### 3.2 Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# .env.local

# Existing variables (keep your current values)
NEXT_PUBLIC_API_URL=http://localhost:8000

# New variables for chatbot feature
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=sk-your-domain-restricted-key-here
```

### 3.3 Start Frontend Dev Server

```bash
# Start the Next.js development server
npm run dev

# Visit http://localhost:3000
```

## Step 4: Test the Chatbot Feature

### 4.1 Access the Chat Interface

1. Open your browser and navigate to: http://localhost:3000/chat
2. You should see a chat interface with an input field

### 4.2 Test Basic Functionality

Try these example prompts:

**Create a task:**
```
Add a task to buy groceries
```
Expected: AI confirms task creation and shows the task

**List tasks:**
```
Show me my tasks
```
Expected: AI displays your current task list

**Complete a task:**
```
Mark the grocery task as complete
```
Expected: AI confirms task completion

**Delete a task:**
```
Delete the grocery task
```
Expected: AI confirms deletion

### 4.3 Verify Backend Logs

Check your backend terminal for logs:

```
INFO:     Received chat request from user 550e8400-e29b-41d4-a716-446655440000
INFO:     Conversation ID: 123e4567-e89b-12d3-a456-426614174000
INFO:     MCP tool called: add_task
INFO:     Task created: 789e0123-e45b-67d8-a901-234567890123
INFO:     OpenAI response time: 1.2s
INFO:     Total request time: 1.5s
```

## Troubleshooting

### Backend Issues

**Problem**: `ImportError: No module named 'openai'`

**Solution**:
```bash
pip install openai anthropic-mcp-sdk
```

---

**Problem**: `Database connection failed`

**Solution**:
1. Verify `NEON_DATABASE_URL` is correct in `.env`
2. Check your Neon database is active (not paused)
3. Ensure firewall allows connections from your IP

---

**Problem**: `Migration failed: table "conversations" already exists`

**Solution**:
```bash
# Check current migration version
alembic current

# If already applied, downgrade and re-upgrade
alembic downgrade -1
alembic upgrade head
```

---

**Problem**: `OpenAI API error: Incorrect API key provided`

**Solution**:
1. Verify `OPENAI_API_KEY` in `.env` starts with `sk-`
2. Check the key is valid at https://platform.openai.com/api-keys
3. Ensure the key has API access enabled

### Frontend Issues

**Problem**: `Module not found: @anthropics/chatkit-react`

**Solution**:
```bash
cd frontend
npm install @anthropics/chatkit-react
```

---

**Problem**: `API request failed: 401 Unauthorized`

**Solution**:
1. Verify backend server is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Ensure JWT authentication is working (check existing app first)

---

**Problem**: Chat page shows nothing / blank screen

**Solution**:
1. Check browser console for errors (F12)
2. Verify you're logged in (chat requires authentication)
3. Check Next.js dev server logs for errors

### MCP Tools Issues

**Problem**: `MCP tool not found: add_task`

**Solution**:
1. Verify MCP server is running in backend logs
2. Check `backend/src/mcp/server.py` exists
3. Ensure tools are registered at server startup

---

**Problem**: `Tool execution failed: user_id mismatch`

**Solution**:
1. Verify JWT token contains correct `sub` claim
2. Check user_id is being passed to MCP tools
3. Ensure user isolation is working (check database)

## Development Workflow

### Run Tests

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
cd frontend
npm run test
```

### Type Checking

```bash
# Backend type checking
cd backend
mypy src/

# Frontend type checking
cd frontend
npm run type-check
```

### Linting

```bash
# Backend linting
cd backend
ruff check src/
black src/

# Frontend linting
cd frontend
npm run lint
npm run format
```

## Project Structure Reference

```
.
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── conversation.py  # NEW: Conversation model
│   │   │   └── message.py       # NEW: Message model
│   │   ├── mcp/
│   │   │   ├── server.py        # NEW: MCP server setup
│   │   │   └── tools.py         # NEW: 5 MCP tool implementations
│   │   ├── agents/
│   │   │   └── todo_agent.py    # NEW: OpenAI Agents SDK orchestration
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── chat.py      # NEW: Chat endpoint
│   │   └── config.py            # UPDATED: New env vars
│   └── tests/
│       └── integration/
│           └── test_chat.py     # NEW: Chat integration tests
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── chat/
│   │   │       └── page.tsx     # NEW: Chat page
│   │   └── components/
│   │       └── chat/
│   │           ├── ChatContainer.tsx    # NEW
│   │           ├── MessageList.tsx      # NEW
│   │           └── ChatInput.tsx        # NEW
│   └── .env.local             # UPDATED: New env vars
│
└── specs/
    └── 001-chatbot-mcp/
        ├── spec.md
        ├── plan.md
        ├── research.md
        ├── data-model.md
        ├── quickstart.md       # THIS FILE
        └── contracts/
            ├── openapi.yaml
            └── mcp-tools.json
```

## Next Steps

After completing the quickstart:

1. **Run integration tests**: `pytest backend/tests/integration/test_chat.py`
2. **Test error scenarios**: Try invalid input, disconnected database, etc.
3. **Review API docs**: Visit http://localhost:8000/docs for Swagger UI
4. **Customize AI prompt**: Edit `backend/src/agents/todo_agent.py` system prompt
5. **Deploy to production**: See deployment guide (TBD)

## Getting Help

If you encounter issues not covered here:

1. Check the [research.md](research.md) for technology decisions
2. Review the [data-model.md](data-model.md) for database schema
3. See API contracts in [contracts/openapi.yaml](contracts/openapi.yaml)
4. Check logs in both backend and frontend terminals
5. Open an issue on GitHub with error details

## Resources

- **Constitution**: [`.specify/memory/constitution.md`](../../.specify/memory/constitution.md)
- **Feature Spec**: [`spec.md`](spec.md)
- **Implementation Plan**: [`plan.md`](plan.md)
- **MCP Protocol**: https://spec.modelcontextprotocol.io/
- **OpenAI Agents SDK**: https://platform.openai.com/docs/assistants/overview
- **ChatKit React**: https://github.com/anthropics/chatkit-react
