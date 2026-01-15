/**
 * ChatContainer - Main chat interface with glassmorphic neon aesthetic.
 *
 * Per @specs/001-chatbot-mcp/tasks.md T054, T055
 * Client Component with message state management
 */
"use client"

import { useState, useRef, useEffect } from "react"
import { sendChatMessage, type ChatMessage, type ChatRequest } from "@/lib/api-client"
import { config } from "@/lib/config"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { TypingIndicator } from "./TypingIndicator"

interface ChatContainerProps {
  userId: string
  token: string
}

export function ChatContainer({ userId, token }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Check backend availability on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const response = await fetch(`${config.apiUrl}/health`, {
          method: "GET",
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
        setBackendAvailable(response.ok)
      } catch {
        setBackendAvailable(false)
      }
    }
    checkBackend()
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to backend
      const request: ChatRequest = {
        conversation_id: conversationId,
        message: messageText
      }

      const response = await sendChatMessage(userId, request, token)

      // Update conversation ID for subsequent messages
      if (response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      // Add assistant response
      setMessages(prev => [...prev, response.message])

    } catch (error) {
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartNew = () => {
    setMessages([])
    setConversationId(undefined)
  }

  // Show backend unavailable state
  if (backendAvailable === false) {
    return (
      <div className="glass rounded-2xl shadow-glass overflow-hidden">
        <div className="glass-strong px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-white">Task Assistant</h2>
            <p className="text-xs text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Backend Unavailable
            </p>
          </div>
        </div>

        <div className="h-[500px] overflow-y-auto p-6">
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="max-w-md">
              <div className="text-4xl mb-4">🔴</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                AI Assistant Unavailable
              </h3>
              <p className="text-gray-400 mb-4">
                The AI chat feature requires the backend server to be running.
              </p>
              <div className="glass border-l-4 border-l-priority-medium rounded-lg p-4 mb-4">
                <p className="text-sm text-priority-medium font-medium mb-2">
                  To enable AI Chat:
                </p>
                <ol className="text-sm text-left text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Open a terminal in the <code className="glass px-2 py-0.5 rounded text-xs">backend</code> folder</li>
                  <li>Run: <code className="glass px-2 py-0.5 rounded text-xs">python -m uvicorn src.main:app --reload</code></li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <p className="text-sm text-gray-500">
                Your task dashboard and manual task management will continue to work normally.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-4 opacity-50">
          <div className="flex gap-2">
            <input
              type="text"
              disabled
              placeholder="AI chat requires backend server..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-gray-500 cursor-not-allowed"
            />
            <button
              disabled
              className="px-6 py-3 bg-white/10 text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking backend
  if (backendAvailable === null) {
    return (
      <div className="glass rounded-2xl shadow-glass overflow-hidden">
        <div className="glass-strong px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Task Assistant</h2>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-gray-400">Connecting to AI assistant...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl shadow-glass overflow-hidden backdrop-blur-xl">
      <div className="glass-strong px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-white">Task Assistant</h2>
          <p className="text-xs text-priority-low flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-priority-low opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-priority-low"></span>
            </span>
            Online
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleStartNew}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            New Chat
          </button>
        )}
      </div>

      <div
        ref={messagesContainerRef}
        className="h-[500px] overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="max-w-md glass p-8 rounded-2xl">
              <div className="text-5xl mb-4 animate-float">💬</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Start a conversation
              </h3>
              <p className="text-gray-400 mb-6">
                Try saying things like:
              </p>
              <ul className="text-left text-sm text-gray-300 space-y-3">
                <li className="flex items-start gap-3 p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-blue-400">•</span>
                  <span>"Add a task to buy groceries"</span>
                </li>
                <li className="flex items-start gap-3 p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-purple-400">•</span>
                  <span>"Show me my tasks"</span>
                </li>
                <li className="flex items-start gap-3 p-3 glass rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-pink-400">•</span>
                  <span>"Mark the first task as complete"</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}
