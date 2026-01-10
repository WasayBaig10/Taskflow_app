# Quickstart Guide

**Feature**: 001-auth-api-bridge
**Purpose**: Developer onboarding for local development and testing
**Last Updated**: 2026-01-07

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** and **npm** (for Next.js frontend)
- **Python 3.11+** and **pip** (for FastAPI backend)
- **Git** (for version control)
- **Docker Desktop** (optional, for containerized Neon DB)
- **Neon PostgreSQL account** (free tier works)

## Repository Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd to-do-nextjs

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Return to root
cd ..
```

### 2. Environment Configuration

Create a `.env` file at the repository root:

```bash
# Copy the example template
cp .env.example .env
```

Edit `.env` with your values:

```bash
# =============================================================================
# BETTER AUTH CONFIGURATION
# =============================================================================
# Secret key for signing JWT tokens (MUST be same on frontend and backend)
BETTER_AUTH_SECRET="your-super-secret-key-min-32-characters-long"

# Frontend URL
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# Backend API URL (for Better Auth to call)
BETTER_AUTH_API_URL="http://localhost:8000"

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# =============================================================================
# FRONTEND CONFIGURATION
# =============================================================================
NEXT_PUBLIC_API_URL="http://localhost:8000"

# =============================================================================
# BACKEND CONFIGURATION
# =============================================================================
# FastAPI configuration
API_PORT=8000
API_HOST="localhost"
DEBUG="true"  # Set to "false" in production

# =============================================================================
# OPTIONAL: NEON LOCAL DEVELOPMENT
# =============================================================================
# If using Docker Compose for local Neon
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neondb"
```

### Generate a Secure BETTER_AUTH_SECRET

```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

**IMPORTANT**: Never commit `.env` to version control. Add it to `.gitignore`.

## Neon Database Setup

### Option A: Use Neon Cloud (Recommended)

1. **Create Neon Account**:
   - Go to https://neon.tech
   - Sign up for free tier

2. **Create Database**:
   - Create new project: "todo-app"
   - Copy connection string (SSL mode required)

3. **Configure Environment**:
   - Paste connection string into `.env` as `DATABASE_URL`

### Option B: Local PostgreSQL (For Development)

```bash
# Using Docker Compose
docker-compose up -d postgres

# Or install PostgreSQL locally
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql
```

## Backend Development

### Start Backend Server

```bash
# From repository root
cd backend

# Activate virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run database migrations
alembic upgrade head

# Start FastAPI development server
uvicorn src.main:app --reload --port 8000
```

### Access Swagger Documentation

1. Open browser to: http://localhost:8000/docs
2. You should see interactive API documentation
3. Test the health check endpoint:
   - Click `GET /health`
   - Click "Try it out"
   - Click "Execute"
   - Verify response: `{"status": "healthy", "database": "connected", "version": "1.0.0"}`

### Backend Directory Structure

```
backend/
├── src/
│   ├── main.py           # FastAPI app entry point
│   ├── config.py         # Environment configuration
│   ├── models/           # SQLModel database models
│   ├── services/         # Business logic (auth, task CRUD)
│   └── api/              # API routes and dependencies
│       ├── dependencies.py  # Auth middleware
│       └── routes/
│           ├── tasks.py      # Task endpoints
│           └── health.py     # Health check
├── tests/                # pytest tests
├── alembic/              # Database migrations
└── requirements.txt      # Python dependencies
```

## Frontend Development

### Start Frontend Server

```bash
# From repository root
cd frontend

# Start Next.js development server
npm run dev
```

Frontend runs at: http://localhost:3000

### Frontend Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with auth provider
│   │   ├── page.tsx         # Home page
│   │   ├── login/
│   │   │   └── page.tsx     # Better Auth login page
│   │   └── dashboard/
│   │       ├── page.tsx     # Task dashboard (Server Component)
│   │       └── components/  # Dashboard components
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── auth/            # Auth-related components
│   ├── lib/
│   │   ├── auth.ts          # Better Auth configuration
│   │   ├── api-client.ts    # Backend API client
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── task.ts          # TypeScript types
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind configuration
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies
```

## Database Migrations

### Create a New Migration

```bash
cd backend

# Auto-generate migration from model changes
alembic revision --autogenerate -m "description of changes"

# Review the generated file in alembic/versions/
# Edit if necessary

# Apply migration
alembic upgrade head
```

### Rollback Migration

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

### Reset Database (Development Only)

```bash
# Drop all tables and recreate
alembic downgrade base
alembic upgrade head
```

**WARNING**: Never run `alembic downgrade base` in production!

## Testing the Authentication Flow

### 1. Create Test User via Better Auth

```bash
# Navigate to login page
open http://localhost:3000/login

# Sign up with email/password
# Better Auth will create user and issue JWT token
```

### 2. Obtain JWT Token

After logging in, get the token from browser DevTools:

1. Open DevTools (F12)
2. Go to Application → Cookies
3. Find `better-auth.session_token` cookie
4. Copy the token value

### 3. Test Protected Endpoint via Swagger

1. Open http://localhost:8000/docs
2. Click "Authorize" button (top right)
3. Enter: `Bearer <your-jwt-token>` (include "Bearer " prefix)
4. Click "Authorize"
5. Close authorization dialog
6. Test `GET /api/{user_id}/tasks` endpoint
7. Replace `{user_id}` with your actual user UUID
8. Click "Try it out" → "Execute"
9. Verify response: `{"tasks": [], "count": 0}`

## Testing Task CRUD Operations

### Create a Task

1. In Swagger UI, expand `POST /api/{user_id}/tasks`
2. Click "Try it out"
3. Replace `{user_id}` with your user UUID
4. Enter request body:
   ```json
   {
     "title": "Test task from Swagger",
     "description": "Testing task creation"
   }
   ```
5. Click "Execute"
6. Verify response: 201 Created with task object

### List Tasks

1. Expand `GET /api/{user_id}/tasks`
2. Click "Try it out"
3. Replace `{user_id}` with your user UUID
4. Click "Execute"
5. Verify response: Contains your newly created task

### Complete a Task

1. Expand `PATCH /api/{user_id}/tasks/{task_id}/complete`
2. Click "Try it out"
3. Replace `{user_id}` and `{task_id}` with your UUIDs
4. Click "Execute"
5. Verify response: `completed: true`, `completed_at` timestamp set

### Test User Isolation

1. Create a second user (incognito window)
2. Login as second user
3. Get second user's JWT token
4. In Swagger, authorize with second user's token
5. Try to access first user's tasks:
   - Use first user's `user_id` in path
   - Use second user's token in authorization
6. **Expected result**: 403 Forbidden

## Common Debugging Scenarios

### Backend Won't Start

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

### Database Connection Failed

**Problem**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
1. Verify `DATABASE_URL` in `.env`
2. Check Neon console: Is database active?
3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### JWT Verification Fails

**Problem**: 401 Unauthorized with "Invalid token"

**Solution**:
1. Verify `BETTER_AUTH_SECRET` is identical in frontend and backend `.env`
2. Check token hasn't expired (default 24 hours)
3. Verify token format: `Bearer <token>` (include "Bearer " prefix)

### CORS Errors

**Problem**: Browser blocks requests from `localhost:3000` to `localhost:8000`

**Solution**:
```python
# backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Migration Conflicts

**Problem**: `alembic.util.exc.CommandError: Target database is not up to date`

**Solution**:
```bash
# Check current version
alembic current

# Upgrade to latest
alembic upgrade head

# If stuck, stamp head (use carefully!)
alembic stamp head
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/integration/test_auth_flow.py
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Development Workflow

### Typical Feature Development

1. **Create feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**:
   - Edit code in `backend/src/` or `frontend/src/`
   - Update tests in `backend/tests/` or `frontend/tests/`

3. **Test locally**:
   ```bash
   # Terminal 1: Backend
   cd backend && uvicorn src.main:app --reload

   # Terminal 2: Frontend
   cd frontend && npm run dev

   # Terminal 3: Tests
   pytest  # or npm test
   ```

4. **Create database migration** (if schema changed):
   ```bash
   cd backend
   alembic revision --autogenerate -m "description"
   alembic upgrade head
   ```

5. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

## Production Deployment

### Backend (FastAPI)

1. **Set production environment variables**:
   ```bash
   # .env.production
   DEBUG="false"
   BETTER_AUTH_SECRET="<strong-random-secret>"
   DATABASE_URL="<production-neon-url>"
   ```

2. **Build and deploy**:
   ```bash
   cd backend
   docker build -t todo-backend .
   docker run -p 8000:8000 --env-file .env.production todo-backend
   ```

### Frontend (Next.js)

1. **Build for production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel deploy --prod
   ```

## Useful Commands Reference

```bash
# Backend
cd backend
uvicorn src.main:app --reload                    # Start dev server
pytest                                            # Run tests
alembic upgrade head                             # Run migrations
alembic revision --autogenerate -m "msg"         # Create migration
python -m mypy src/                              # Type checking
ruff check src/                                  # Linting

# Frontend
cd frontend
npm run dev                                      # Start dev server
npm run build                                    # Build for production
npm run lint                                     # Linting
npm run type-check                               # Type checking
npm run test                                     # Run tests

# Monorepo
npm run dev                                      # Start both frontend and backend
turbo run build                                  # Build all workspaces
```

## Getting Help

- **Backend Issues**: Check `backend/src/main.py` logs
- **Frontend Issues**: Check browser console and Next.js logs
- **Database Issues**: Check Neon console for database status
- **Documentation**:
  - FastAPI: https://fastapi.tiangolo.com/
  - Next.js: https://nextjs.org/docs
  - Better Auth: https://www.better-auth.com/docs
  - Neon: https://neon.tech/docs

## Next Steps

Once development environment is set up:

1. ✅ Verify backend starts and `/health` returns 200
2. ✅ Verify frontend starts at http://localhost:3000
3. ✅ Complete Phase 1: Infrastructure setup
4. ✅ Complete Phase 2: Auth bridge implementation
5. ✅ Complete Phase 3: Data layer implementation
6. ✅ Complete Phase 4: Frontend integration

Refer to [`plan.md`](plan.md) for detailed implementation phases.
