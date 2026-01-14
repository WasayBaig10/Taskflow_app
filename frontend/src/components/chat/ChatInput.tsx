/**
 * ChatInput - User input field with glassmorphic neon aesthetic.
 *
 * Per @specs/001-chatbot-mcp/tasks.md T057
 */
"use client"

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput("")
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-white/10 p-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <motion.textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            disabled={disabled}
            rows={1}
            className={`input-glass w-full resize-none pr-12 transition-all duration-300 ${
              isFocused ? 'ring-2 ring-blue-500/50 border-blue-400/50' : ''
            }`}
            style={{ minHeight: "48px", maxHeight: "120px" }}
            whileFocus={{ scale: 1.01 }}
          />
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-priority-low rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </motion.div>
          )}
        </div>
        <motion.button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-blue-500/30 disabled:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
          whileHover={!disabled && input.trim() ? { scale: 1.05 } : {}}
          whileTap={!disabled && input.trim() ? { scale: 0.95 } : {}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </form>
    </div>
  )
}
