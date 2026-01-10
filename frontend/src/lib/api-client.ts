/**
 * Backend API client with JWT Bearer token handling.
 *
 * Per @specs/001-auth-api-bridge/research.md
 */
import type { Task, TaskCreateRequest, TaskListResponse, ErrorResponse } from "@/types/task"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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
  const url = `${API_URL}${endpoint}`

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

  const response = await fetch(url, {
    ...options,
    headers,
    // Still include cookies for any cookie-based auth fallback
    credentials: "include",
  })

  // Handle 401 Unauthorized
  if (response.status === 401) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error.message || "Unauthorized - Please log in")
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error.message || "Forbidden - You don't have access to this resource")
  }

  // Handle 404 Not Found
  if (response.status === 404) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error.message || "Resource not found")
  }

  // Handle other errors
  if (!response.ok) {
    const error: ErrorResponse = await response.json()
    throw new Error(error.error.message || "An error occurred")
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
  data: { title?: string; description?: string },
  token?: string
): Promise<Task> {
  return apiRequest<Task>(`/api/${userId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, token)
}

