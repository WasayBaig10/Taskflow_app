<!--
Sync Impact Report:
Version change: (none) → 1.0.0
Modified principles: N/A (initial constitution)
Added sections: All sections (initial constitution)
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (aligned with monorepo structure)
  ✅ .specify/templates/spec-template.md (aligned with feature requirements)
  ✅ .specify/templates/tasks-template.md (aligned with task organization)
Follow-up TODOs: None
-->

# Hackathon Todo Phase II Constitution

## Core Principles

### I. Monorepo Architecture

All code MUST reside in a monorepo structure with clear separation between frontend and backend:

- **Root Level**: Configuration files, shared documentation, and monorepo tooling
- **`/frontend`**: Next.js 16 application using React Server Components by default
- **`/backend`**: FastAPI application with Python type hints throughout
- **`/specs`**: Feature specifications, plans, and tasks (managed by SpecKit Plus)
- **`/.specify`**: Templates, memory, and configuration for SpecKit Plus

**Rationale**: Monorepo structure enables code sharing, unified tooling, and clear separation of concerns while maintaining tight coupling between frontend and backend development workflows.

### II. Spec-Driven Development (NON-NEGOTIABLE)

All feature implementations MUST be derived from specifications under `/specs/`:

1. **Specification First**: Every feature MUST have a `spec.md` defining user stories, requirements, and success criteria
2. **Architecture Plan**: Every feature MUST have a `plan.md` detailing technical approach, data models, and API contracts
3. **Testable Tasks**: Every feature MUST have a `tasks.md` breaking down implementation into discrete, testable units
4. **No Manual Code**: Implementation MUST NOT proceed without corresponding specification artifacts
5. **Traceability**: Every code change MUST reference a specific task from `tasks.md`

**Rationale**: Spec-driven development ensures alignment with user needs, enables parallel development, provides auditability, and prevents scope creep.

### III. User Isolation via JWT

Backend MUST enforce user data isolation through JWT-based authentication:

- **JWT Structure**: Tokens MUST include a `sub` claim containing the user's unique identifier
- **Data Scoping**: All database queries MUST filter by `user_id` derived from JWT `sub` claim
- **Middleware Enforcement**: FastAPI middleware MUST validate JWT on every protected endpoint
- **No Cross-User Access**: Backend MUST reject any attempt to access another user's data
- **Session Management**: JWT validation MUST occur before any business logic execution

**Rationale**: Strong user isolation prevents data leakage, ensures multi-user security, and provides clear audit trails for all data access.

### IV. Frontend Server-First

Frontend components MUST prioritize React Server Components over Client Components:

- **Default to Server Components**: Use Server Components unless interactivity requires Client Components
- **Tailwind CSS**: All styling MUST use Tailwind CSS utility classes
- **No Client-Side State Management**: Prefer server state and URL parameters over client state
- **Progressive Enhancement**: Core functionality MUST work without JavaScript
- **Type Safety**: All components MUST use TypeScript with strict mode enabled

**Rationale**: Server Components reduce client bundle size, improve SEO, enhance security, and simplify state management by leveraging server capabilities.

### V. Type Safety and Validation

Both frontend and backend MUST enforce strict type safety:

- **Backend**: All FastAPI endpoints MUST use Pydantic models for request/response validation
- **Frontend**: All components and utilities MUST use TypeScript with no implicit any
- **Database**: SQLModel MUST define all table structures with explicit types and constraints
- **API Contracts**: OpenAPI schema MUST be generated and validated on backend startup
- **Runtime Validation**: No type assertions that bypass runtime checks

**Rationale**: Strong typing catches errors at compile time, improves developer experience, enables better IDE support, and serves as living documentation.

### VI. Integration Testing

Cross-boundary communication MUST be tested with integration tests:

- **API Contracts**: Test backend endpoints against OpenAPI schema
- **Frontend-Backend Integration**: Test that frontend correctly consumes backend APIs
- **Authentication Flow**: Test complete JWT authentication and user isolation
- **Error Scenarios**: Test error handling across frontend/backend boundary
- **Data Consistency**: Test that frontend state reflects backend state accurately

**Rationale**: Integration tests catch contract violations, ensure API compatibility, and validate end-to-end user journeys that unit tests miss.

### VII. Observability

All components MUST provide visibility into operation and failures:

- **Structured Logging**: Use structured JSON logging with consistent field names
- **Request Tracing**: Include request IDs in logs across frontend and backend
- **Error Context**: Logs MUST include user ID (from JWT), endpoint, and relevant state
- **Performance Metrics**: Track API response times and database query performance
- **Frontend Monitoring**: Log client-side errors with sufficient context for debugging

**Rationale**: Observability enables rapid debugging, performance optimization, and proactive issue detection in production.

## Definition of Done

A feature is considered complete ONLY when ALL of the following are satisfied:

1. **Type Checking**: All TypeScript and Python type checks pass without errors
2. **Linting**: All linters (ESLint, Pylint/Ruff) pass without warnings
3. **Tests**: All tests (integration, contract if applicable) pass successfully
4. **API Connectivity**: Frontend can successfully communicate with all required backend endpoints
5. **Specification Complete**: All tasks in `tasks.md` are checked off
6. **User Stories Validated**: Each user story can be demonstrated independently
7. **No Hardcoded Secrets**: All configuration uses environment variables
8. **Documentation**: Any new APIs or components are documented in code comments

**Rationale**: A rigorous Definition of Done ensures quality, prevents technical debt, and validates that the feature delivers the intended user value.

## Technology Stack Mandates

### Backend

- **Framework**: FastAPI with Python 3.11+
- **ORM**: SQLModel for database models and migrations
- **Database**: Neon PostgreSQL (serverless Postgres)
- **Authentication**: Better Auth with JWT integration
- **Validation**: Pydantic v2 for all request/response models
- **API Documentation**: Auto-generated OpenAPI/Swagger UI

### Frontend

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with strict design tokens
- **Components**: React Server Components by default
- **TypeScript**: Strict mode enabled, no implicit any
- **State**: Server state via Next.js data fetching, minimal client state

### Development

- **Version Control**: Git with feature branches
- **Monorepo Tooling**: Turborepo or Nx for task orchestration
- **Code Quality**: ESLint, Prettier (frontend), Ruff/Black (backend)
- **Testing**: Vitest (frontend), pytest (backend)

## Governance

### Amendment Process

1. Proposals for constitutional changes MUST be documented in an Architecture Decision Record (ADR)
2. Changes MUST be reviewed and approved by the lead architect
3. Amendments MUST include migration plan for existing code
4. Version MUST be incremented according to semantic versioning:
   - **MAJOR**: Incompatible changes requiring code migration
   - **MINOR**: New principles or backward-compatible additions
   - **PATCH**: Clarifications and non-semantic refinements

### Compliance Review

- All pull requests MUST verify compliance with constitution principles
- Violations MUST be justified with explicit reasoning in the PR description
- Complexity (additional dependencies, patterns, abstractions) MUST be justified against principles
- When in doubt, prefer simpler solutions aligned with core principles

### Runtime Guidance

For development practices beyond this constitution, reference:
- `.specify/templates/plan-template.md` for architecture planning
- `.specify/templates/spec-template.md` for feature specification
- `.specify/templates/tasks-template.md` for task breakdown

This constitution supersedes all other practices and serves as the ultimate authority for development decisions.

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
