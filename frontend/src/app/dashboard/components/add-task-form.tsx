"use client"

/**
 * AddTask component with premium UI/UX.
 *
 * Features:
 * - Dark mode support
 * - Framer Motion animations
 * - Glassmorphism effect
 * - Scale-in animation
 */
import { useState } from "react"
import { createTask } from "@/lib/api-client"
import type { TaskCreateRequest, Task } from "@/types/task"
import { motion } from "framer-motion"
import { GlowButton } from "@/components/AnimatedWrapper"

interface AddTaskFormProps {
  userId: string
  token: string
  onTaskCreated?: (task: Task) => void
}

export function AddTaskForm({ userId, token, onTaskCreated }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const data: TaskCreateRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
      }

      // Pass JWT token to API client
      const task = await createTask(userId, data, token)

      // Clear form on success
      setTitle("")
      setDescription("")

      // Notify parent component
      onTaskCreated?.(task)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25
      }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200/50 dark:border-gray-700/50"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        Add New Task
      </h2>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg backdrop-blur-sm"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <motion.input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            required
            minLength={1}
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            disabled={isLoading}
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <motion.textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)..."
            rows={2}
            maxLength={5000}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all text-sm"
            disabled={isLoading}
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        {/* Submit Button */}
        <GlowButton
          type="submit"
          disabled={isLoading || !title.trim()}
          onClick={() => {}}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium text-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            "Create Task"
          )}
        </GlowButton>
      </form>
    </motion.div>
  )
}
