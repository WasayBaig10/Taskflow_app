/**
 * MessageList - Displays chat messages with glassmorphic neon aesthetic.
 *
 * Per @specs/001-chatbot-mcp/tasks.md T056
 */
"use client"

import { motion } from "framer-motion"
import { type ChatMessage } from "@/lib/api-client"

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={message.id} message={message} index={index} />
      ))}
    </div>
  )
}

function MessageBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30"
            : "glass text-gray-100 border border-white/10 shadow-glass"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </motion.div>
  )
}
