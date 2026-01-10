/**
 * Authentication utilities.
 *
 * Simple JWT token management using localStorage.
 * This is a demo implementation - in production, use secure httpOnly cookies.
 */

/**
 * Client-side session retrieval from localStorage.
 * Use this in Client Components via useEffect.
 */
export async function getClientSession() {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const token = localStorage.getItem("auth_token")
    const userId = localStorage.getItem("user_id")
    const email = localStorage.getItem("user_email")

    if (!token || !userId) {
      return null
    }

    return {
      user: {
        id: userId,
        email: email || "",
      },
      token,
      userId,
    }
  } catch (error) {
    console.error("Failed to fetch client session:", error)
    return null
  }
}
