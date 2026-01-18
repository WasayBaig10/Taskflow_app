/**
 * Backend API client with JWT Bearer token handling.
 *
 * Per @specs/001-auth-api-bridge/research.md
 */
import type { Task, TaskCreateRequest, TaskListResponse, ErrorResponse } from "@/types/task"
import { config } from "./config"

/**
 * Generic API request handler with automatic token inclusion.
 *
 * @param endpoint - API endpoint path (e.g., "/api/{user_id}/tasks")
 * @param options - Fetch request options
 * @param token - Optional JWT token from Better Auth session
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${config.apiUrl}${endpoint}`

  // Build headers with JWT Bearer token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  // Attach JWT token as Bearer if provided
  // This token comes from Better Auth session and is verified by backend
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      // Still include cookies for any cookie-based auth fallback
      credentials: "include",
    })
  } catch (error) {
    // Network error (e.g., backend not running, CORS issue)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(`Unable to connect to backend at ${config.apiUrl}. Please ensure the backend server is running.`)
    }
    throw error
  }

  // Handle error responses - extract message from different response formats
  if (!response.ok) {
    let errorMessage = "An error occurred"
    try {
      const data = await response.json()
      // FastAPI returns { "detail": "..." } for validation errors
      // Our custom errors return { "error": { "message": "..." } }
      // Chat endpoint returns { "detail": { "error": "...", "message": "...", ... } }
      if (typeof data === "object" && data !== null) {
        const detail = (data as Record<string, unknown>).detail

        // Handle nested detail object (from chat endpoint)
        if (typeof detail === "object" && detail !== null) {
          errorMessage = (detail as Record<string, unknown>).message as string ||
                        (detail as Record<string, unknown>).error as string ||
                        errorMessage
        }
        // Handle string detail (standard FastAPI error)
        else if (typeof detail === "string") {
          errorMessage = detail
        }
        // Handle ErrorResponse format
        else {
          errorMessage = (data as ErrorResponse).error?.message ||
                        errorMessage
        }
      }
    } catch {
      // If parsing JSON fails, use status text
      errorMessage = response.statusText || errorMessage
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

/**
 * Create a new task.
 *
 * Per @specs/001-auth-api-bridge/api/rest-endpoints.md
 *
 * @param userId - User ID from Better Auth session
 * @param data - Task creation data
 * @param token - JWT token from Better Auth session
 */
export async function createTask(
  userId: string,
  data: TaskCreateRequest,
  token?: string
): Promise<Task> {
  return apiRequest<Task>(`/api/${userId}/tasks`, {
    method: "POST",
    body: JSON.stringify(data),
  }, token)
}

/**
 * List all tasks for a user.
 *
 * @param userId - User ID from Better Auth session
 * @param token - JWT token from Better Auth session
 */
export async function listTasks(
  userId: string,
  token?: string
): Promise<TaskListResponse> {
  return apiRequest<TaskListResponse>(`/api/${userId}/tasks`, {}, token)
}

/**
 * Get a specific task by ID.
 *
 * @param userId - User ID from Better Auth session
 * @param taskId - Task ID to fetch
 * @param token - JWT token from Better Auth session
 */
export async function getTask(
  userId: string,
  taskId: string,
  token?: string
): Promise<Task> {
  return apiRequest<Task>(`/api/${userId}/tasks/${taskId}`, {}, token)
}

/**
 * Mark a task as completed.
 *
 * @param userId - User ID from Better Auth session
 * @param taskId - Task ID to complete
 * @param token - JWT token from Better Auth session
 */
export async function completeTask(
  userId: string,
  taskId: string,
  token?: string
): Promise<Task> {
  return apiRequest<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
    method: "PATCH",
  }, token)
}

/**
 * Update a task's title and/or description.
 *
 * @param userId - User ID from Better Auth session
 * @param taskId - Task ID to update
 * @param data - Update data with optional title and/or description
 * @param token - JWT token from Better Auth session
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: { title?: string; description?: string; priority?: "low" | "medium" | "high" },
  token?: string
): Promise<Task> {
  return apiRequest<Task>(`/api/${userId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, token)
}

/**
 * Delete a task.
 *
 * @param userId - User ID from Better Auth session
 * @param taskId - Task ID to delete
 * @param token - JWT token from Better Auth session
 */
export async function deleteTask(
  userId: string,
  taskId: string,
  token?: string
): Promise<void> {
  return apiRequest<void>(`/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
  }, token)
}

// =============================================================================
// Chat API Client (T060)
// Per @specs/001-chatbot-mcp/contracts/openapi.yaml
// =============================================================================

/**
 * Chat message types
 */
export type ChatMessageRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: ChatMessageRole
  content: string
  created_at: string
}

export interface TaskSummary {
  id: string
  title: string
  description: string | null
  completed: boolean
}

export interface ChatRequest {
  conversation_id?: string
  message: string
}

export interface ChatResponse {
  conversation_id: string
  message: ChatMessage
  tasks?: TaskSummary[]
}

/**
 * Send a chat message to the AI assistant.
 *
 * Per @specs/001-chatbot-mcp/contracts/openapi.yaml
 *
 * @param userId - User ID from Better Auth session
 * @param data - Chat request with optional conversation_id and message
 * @param token - JWT token from Better Auth session
 */
export async function sendChatMessage(
  userId: string,
  data: ChatRequest,
  token?: string
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>(`/api/${userId}/chat`, {
    method: "POST",
    body: JSON.stringify(data),
  }, token)
}

/**
 * List all conversations for a user.
 *
 * @param userId - User ID from Better Auth session
 * @param token - JWT token from Better Auth session
 */
export async function listConversations(
  userId: string,
  token?: string
): Promise<{ conversations: Array<{ id: string; title: string; created_at: string; updated_at: string }>; count: number }> {
  return apiRequest<{ conversations: Array<{ id: string; title: string; created_at: string; updated_at: string }>; count: number }>(`/api/${userId}/conversations`, {}, token)
}

/**
 * Get messages in a conversation.
 *
 * @param userId - User ID from Better Auth session
 * @param conversationId - Conversation ID
 * @param token - JWT token from Better Auth session
 */
export async function getConversationMessages(
  userId: string,
  conversationId: string,
  token?: string
): Promise<{ conversation_id: string; messages: ChatMessage[]; count: number }> {
  return apiRequest<{ conversation_id: string; messages: ChatMessage[]; count: number }>(`/api/${userId}/conversations/${conversationId}/messages`, {}, token)
}


