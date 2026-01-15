/**
 * Application configuration
 *
 * Production URLs are hardcoded to avoid build-time env variable issues
 */

export const config = {
  get apiUrl(): string {
    // Hardcoded production URL - this is the ONLY way to make it work
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://backend-production-7c3b.up.railway.app'
    }
    // Local development
    return 'http://localhost:8000'
  },

  get betterAuthUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://taskflow-app-frontend-4kmp-emsultiio-mawbs-projects.vercel.app'
    }
    return 'http://localhost:3000'
  },
}
