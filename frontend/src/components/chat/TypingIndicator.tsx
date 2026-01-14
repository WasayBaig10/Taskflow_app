/**
 * TypingIndicator - Loading state while AI is thinking with glassmorphic neon aesthetic.
 *
 * Per @specs/001-chatbot-mcp/tasks.md T058
 */
"use client"

import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="glass px-5 py-4 rounded-2xl border border-white/10 shadow-glass">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]"></span>
          <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]" style={{ animationDelay: '0.2s' }}></span>
          <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.6)]" style={{ animationDelay: '0.4s' }}></span>
          <span className="ml-2 text-xs text-gray-400">AI is typing...</span>
        </div>
      </div>
    </motion.div>
  )
}
