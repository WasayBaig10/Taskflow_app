/**
 * Server-side authentication utilities.
 *
 * Extracts Better Auth session tokens from cookies for Server Components.
 * Per @specs/001-auth-api-bridge/research.md
 */
import { cookies } from "next/headers"

const BETTER_AUTH_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"

/**
 * Server-side session fetcher.
 * Use in Server Components to get the current user's JWT token.
 *
 * @returns Session object with user data and JWT token, or null if not authenticated
 */
export async function getServerSession(): Promise<{
  user: { id: string; email: string }
  token: string
  userId: string
} | null> {
  try {
    const cookieStore = await cookies()

    // Fetch session from Better Auth server endpoint
    const response = await fetch(`${BETTER_AUTH_URL}/api/get-session`, {
      method: "GET",
      headers: {
        // Forward all cookies from the client request
        Cookie: cookieStore.toString(),
      },
      cache: "no-store", // Always fetch fresh session data
    })

    if (!response.ok) {
      if (response.status === 401) {
        // User not authenticated
        return null
      }
      throw new Error(`Failed to fetch session: ${response.statusText}`)
    }

    const session = await response.json()

    // Better Auth returns session with:
    // - user: { id, email, ... }
    // - token: JWT signed with BETTER_AUTH_SECRET
    return {
      user: {
        id: session.user.id,
        email: session.user.email,
      },
      token: session.token,
      userId: session.user.id,
    }
  } catch (error) {
    console.error("Error fetching server session:", error)
    return null
  }
}

/**
 * Validate that a user ID matches the current session.
 * Use this to prevent users from accessing other users' resources.
 *
 * @param requestedUserId - The user ID being requested
 * @param session - The current session from getServerSession()
 * @throws Error if user IDs don't match
 */
export async function verifyUserAccess(requestedUserId: string, session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session) {
    throw new Error("Not authenticated")
  }

  if (session.userId !== requestedUserId) {
    throw new Error("Forbidden: You can only access your own resources")
  }
}
