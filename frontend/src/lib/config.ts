/**
 * Application configuration
 *
 * Uses environment variables with production fallbacks
 */

// Helper function to get API URL based on environment
function getApiUrl(): string {
  // Check if we're in production on Vercel FIRST (before env var check)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('vercel.app')) {
      return 'https://backend-production-7c3b.up.railway.app'
    }
  }

  // If env var is set, use it (for local development with custom backend)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // Default to localhost
  return 'http://localhost:8000'
}

// Helper function to get Better Auth URL
function getBetterAuthUrl(): string {
  // Check if we're in production on Vercel FIRST
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('vercel.app')) {
      return 'https://taskflow-app-frontend-4kmp-emsultiio-mawbs-projects.vercel.app'
    }
  }

  // If env var is set, use it
  if (process.env.NEXT_PUBLIC_BETTER_AUTH_URL) {
    return process.env.NEXT_PUBLIC_BETTER_AUTH_URL
  }

  return 'http://localhost:3000'
}

export const config = {
  get apiUrl() {
    return getApiUrl()
  },
  get betterAuthUrl() {
    return getBetterAuthUrl()
  },
}
