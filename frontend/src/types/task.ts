/**
 * TypeScript types matching backend Pydantic models.
 *
 * Per @specs/001-auth-api-bridge/contracts/pydantic-models.md
 */

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority?: "low" | "medium" | "high"
  created_at: string  // ISO 8601 datetime
  completed_at: string | null
}

export interface TaskCreateRequest {
  title: string
  description?: string
  priority?: "low" | "medium" | "high"
}

export interface TaskListResponse {
  tasks: Task[]
  count: number
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details: Record<string, unknown>
  }
}
