/**
 * Loading state for chat page.
 *
 * Per @specs/001-chatbot-mcp/tasks.md T053
 */
export default function ChatLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
      </div>
    </div>
  )
}
