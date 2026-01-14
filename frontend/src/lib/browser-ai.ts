/**
 * Browser-based AI chat service using OpenAI API directly from the client.
 *
 * This allows the chatbot to work without a backend server.
 * The OpenAI API is called directly from the browser.
 */

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface ChatRequest {
  conversation_id?: string
  message: string
}

export interface ChatResponse {
  conversation_id: string
  message: ChatMessage
}

// Get API key from environment or prompt user
const getApiKey = (): string | null => {
  return process.env.NEXT_PUBLIC_OPENAI_API_KEY || localStorage.getItem("openai_api_key") || null
}

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a helpful task management assistant for TaskFlow. Your role is to help users manage their todo tasks through natural language.

Key behaviors:
- Be friendly and concise in your responses
- Focus on helping users create, view, complete, and delete tasks
- When users ask to add tasks, extract the task title and any description
- When users ask to see tasks, list their tasks clearly
- When users ask to complete/delete tasks, confirm the action first
- You will receive the current task list as context when available
- Never make up task information - always work with the provided task data

Available operations:
- Create tasks: When user wants to add a task, respond with action: "create_task" and include title and description
- List tasks: When user wants to see tasks, respond with action: "list_tasks"
- Complete tasks: When user wants to complete a task, respond with action: "complete_task" and task identifier
- Delete tasks: When user wants to delete a task, respond with action: "delete_task" and task identifier
- Update tasks: When user wants to edit a task, respond with action: "update_task" and task details

Format your responses as JSON when taking actions:
{
  "action": "create_task | list_tasks | complete_task | delete_task | update_task | chat",
  "title": "task title (for create/update)",
  "description": "task description (for create/update)",
  "task_id": "task identifier (for complete/delete/update)",
  "message": "friendly message to user"
}

If just chatting normally, use action: "chat" with a message.`

/**
 * Parse AI response and extract action/message
 */
function parseAIResponse(content: string): { action: string; message: string; data?: any } {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content)
    return {
      action: parsed.action || "chat",
      message: parsed.message || content,
      data: parsed,
    }
  } catch {
    // Not JSON, treat as chat message
    return {
      action: "chat",
      message: content,
    }
  }
}

/**
 * Process a chat message using OpenAI API directly from browser
 */
export async function processChatMessage(
  userId: string,
  message: string,
  conversationHistory: ChatMessage[] = [],
  tasks: any[] = []
): Promise<ChatResponse> {
  const apiKey = getApiKey()

  if (!apiKey) {
    // Return a helpful message when no API key is configured
    return {
      conversation_id: "browser",
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'd love to help you manage your tasks! To enable AI chat, please add your OpenAI API key.\n\nYou can:\n1. Add it to your .env.local file as NEXT_PUBLIC_OPENAI_API_KEY\n2. Or I'll prompt you for it when you try to chat\n\nYour task management will continue working perfectly without AI - you can create, complete, and delete tasks manually!",
        created_at: new Date().toISOString(),
      },
    }
  }

  try {
    // Build messages array
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ]

    // Add task context
    if (tasks.length > 0) {
      const taskContext = `Current tasks:\n${tasks.map((t) => `- ${t.title}${t.completed ? " ✓" : ""} (ID: ${t.id})`).join("\n")}`
      messages.push({ role: "system", content: taskContext })
    }

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({ role: msg.role, content: msg.content })
    })

    // Add current message
    messages.push({ role: "user", content: message })

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content || "I apologize, but I couldn't process that request."

    // Parse the AI response
    const parsed = parseAIResponse(aiMessage)

    return {
      conversation_id: "browser",
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content: parsed.message,
        created_at: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("AI chat error:", error)

    return {
      conversation_id: "browser",
      message: {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}. Please check your OpenAI API key and try again.`,
        created_at: new Date().toISOString(),
      },
    }
  }
}

/**
 * Prompt user for OpenAI API key
 */
export function promptForApiKey(): boolean {
  if (typeof window === "undefined") return false

  const key = prompt(
    "Enter your OpenAI API key to enable AI chat:\n\nGet one at: https://platform.openai.com/api-keys\n\nYour key will be stored locally in your browser."
  )

  if (key && key.startsWith("sk-")) {
    localStorage.setItem("openai_api_key", key)
    return true
  }

  return false
}

/**
 * Check if API key is available
 */
export function hasApiKey(): boolean {
  return !!getApiKey()
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("openai_api_key")
}
