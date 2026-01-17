/**
 * Chat page for AI-powered task management with glassmorphic neon aesthetic.
 *
 * Per @specs/001-chatbot-mcp/plan.md - User Story 1
 * Client component with localStorage auth (demo mode)
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatContainer } from "@/components/chat/ChatContainer"

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<{ userId: string; token: string; email: string } | null>(null)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("auth_token")
    const userId = localStorage.getItem("user_id")
    const email = localStorage.getItem("user_email")

    if (!token || !userId) {
      router.push("/login")
      return
    }

    setSession({ token, userId, email: email || "" })
  }, [router])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const { userId, token } = session

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            AI Task Assistant
          </h1>
          <p className="text-gray-400 mt-1">
            Create and manage tasks using natural language
          </p>
        </div>

        {/* Chat Container */}
        <ChatContainer userId={userId} token={token} />
      </div>
    </div>
  )
}