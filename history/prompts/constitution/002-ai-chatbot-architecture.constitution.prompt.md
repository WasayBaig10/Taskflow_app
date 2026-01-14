---
id: "002"
title: "AI Chatbot Architecture principle addition"
stage: "constitution"
date: "2026-01-11"
surface: "agent"
model: "glm-4.6"
feature: "none"
branch: "main"
user: "user"
command: "/sp.constitution"
labels: ["constitution", "ai-chatbot", "mcp", "openai-agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md (verified aligned)
  - .specify/templates/spec-template.md (verified aligned)
  - .specify/templates/tasks-template.md (verified aligned)
tests:
  - None (constitution update)
---

## Prompt

"Act as a Senior AI Engineer. Your goal is to implement a stateless AI Chatbot for an existing Todo application. Core Principles:

Statelessness: The FastAPI server must not store session data in memory. All state (history/tasks) must come from the Neon PostgreSQL DB.

MCP First: All task manipulations MUST go through the Official MCP SDK. The Agent should not call the DB directly for tasks; it must use the MCP Tools.

Protocol Adherence: Use OpenAI Agents SDK for the orchestration and ChatKit for the UI.

Safety: Ensure every tool call includes the user_id to maintain data isolation."

## Response snapshot

Successfully updated the Hackathon Todo Phase II Constitution from v1.0.0 to v1.1.0 by adding Principle VIII: AI Chatbot Architecture (NON-NEGOTIABLE).

**New Principle VIII: AI Chatbot Architecture**

The new principle establishes six mandatory requirements for all AI Chatbot implementations:

1. **Statelessness** - FastAPI server MUST NOT store session data in memory; all state (conversation history, task context) MUST be retrieved from and persisted to Neon PostgreSQL database
2. **MCP First** - All task manipulations (CRUD operations on todos) MUST go through Official MCP SDK; AI Agent MUST NOT call database directly for task operations
3. **Protocol Adherence** - AI orchestration MUST use OpenAI Agents SDK for agent lifecycle and tool orchestration; Frontend UI MUST use ChatKit for chat interface components
4. **Data Isolation** - Every MCP tool call and database operation MUST include user_id to maintain data isolation between users
5. **No Direct DB Access** - Agent tool implementations MUST wrap MCP SDK calls, not bypass them with direct SQLModel queries
6. **Conversation Persistence** - Chat history MUST be stored in database with proper user_id scoping, not in server memory

**Technology Stack Updates**

Updated backend mandates to include:
- AI Orchestration: OpenAI Agents SDK for agent lifecycle management
- Task Operations: Official MCP SDK for todo manipulations

Updated frontend mandates to include:
- Chat UI: ChatKit for chat interface components

**Rationale**: Stateless architecture enables horizontal scaling, MCP SDK integration ensures consistent data access patterns, proper protocol adherence provides vendor interoperability, and user_id enforcement prevents cross-user data leakage.

## Outcome

- ✅ Impact: Added comprehensive AI Chatbot Architecture principle (VIII) to constitution with six mandatory requirements covering statelessness, MCP integration, protocol adherence, and data isolation
- 🧪 Tests: N/A (constitution update)
- 📁 Files: Updated .specify/memory/constitution.md with new principle VIII and updated technology stack mandates; verified alignment with all template files
- 🔁 Next prompts: Consider creating ADR for MCP SDK integration architecture before implementing AI Chatbot feature
- 🧠 Reflection: Constitution now explicitly governs AI Chatbot implementations, ensuring architectural consistency with existing stateless, user-isolated backend design

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution amendment completed successfully
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Consider adding specific MCP tool call timeout and retry policies to observability principle based on production patterns
