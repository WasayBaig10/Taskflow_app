/**
 * Task Dashboard with JWT authentication and responsive design.
 *
 * Client component that retrieves token from localStorage (demo mode).
 * Per @specs/001-auth-api-bridge/research.md
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { TaskDashboardClient } from "./components/task-dashboard-client"

export default function DashboardPage() {
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
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  const { userId, token, email } = session

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Task Dashboard
          </h1>
        </div>

        {/* Client component with session token */}
        <TaskDashboardClient
          userId={userId}
          token={token}
        />
      </div>
    </div>
  )
}
