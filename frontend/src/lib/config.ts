/**
 * Application configuration
 *
 * Uses environment variables with production fallbacks
 */
export const config = {
  // API URL - use environment variable or fallback based on environment
  apiUrl: process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname === 'taskflow-app-frontend-4kmp-emsultiio-mawbs-projects.vercel.app')
      ? 'https://backend-production-7c3b.up.railway.app'
      : 'http://localhost:8000',

  // Better Auth URLs
  betterAuthUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
}
