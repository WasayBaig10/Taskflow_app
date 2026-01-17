/**
 * Application configuration
 *
 * Production URLs are hardcoded to avoid build-time env variable issues
 */

export const config = {
  get apiUrl(): string {
    // Use local backend for development, Railway for production
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:8000'
    }
    // Production URL
    return 'https://backend-production-7c3b.up.railway.app'
  },

  get betterAuthUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://taskflow-app-frontend-4kmp-emsultiio-mawbs-projects.vercel.app'
    }
    return 'http://localhost:3000'
  },
}
