/**
 * Application configuration
 *
 * Production URLs are hardcoded to avoid build-time env variable issues
 */

export const config = {
  get apiUrl(): string {
    // Use Hugging Face backend
    return 'https://mawb-mcp-todo.hf.space'
  },

  get betterAuthUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://taskflow-app-frontend-4kmp-emsultiio-mawbs-projects.vercel.app'
    }
    return 'http://localhost:3000'
  },
}
