"use client"

/**
 * AddTask component with Command Palette aesthetic and glassmorphism.
 *
 * Features:
 * - Floating command palette design
 * - Glassmorphic styling with backdrop blur
 * - Smooth animations and transitions
 * - Priority selector with neon colors
 */
import { useState } from "react"
import { createTask } from "@/lib/api-client"
import type { TaskCreateRequest, Task } from "@/types/task"
import { motion, AnimatePresence } from "framer-motion"

type Priority = "low" | "medium" | "high"

interface AddTaskFormProps {
  userId: string
  token: string
  onTaskCreated?: (task: Task) => void
}

export function AddTaskForm({ userId, token, onTaskCreated }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const data: TaskCreateRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      }

      const task = await createTask(userId, data, token)

      setTitle("")
      setDescription("")
      setPriority("medium")
      setIsExpanded(false)

      onTaskCreated?.(task)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "text-priority-low border-priority-low" },
    { value: "medium", label: "Medium", color: "text-priority-medium border-priority-medium" },
    { value: "high", label: "High", color: "text-priority-high border-priority-high" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="relative"
    >
      {/* Command Palette Container */}
      <div className="glass rounded-2xl overflow-hidden shadow-glass">
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add New Task</h2>
              <p className="text-xs text-gray-400">
                {isExpanded ? "Click to collapse" : "Click to expand • Press Enter to submit"}
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>

        {/* Expandable Form */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 glass border-l-4 border-l-priority-high rounded-lg"
                  >
                    <p className="text-sm text-priority-high">{error}</p>
                  </motion.div>
                )}

                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title <span className="text-priority-high">*</span>
                  </label>
                  <motion.input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    minLength={1}
                    maxLength={255}
                    className="input-glass w-full"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                    autoFocus
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <motion.textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details (optional)..."
                    rows={3}
                    maxLength={5000}
                    className="input-glass w-full resize-none"
                    disabled={isLoading}
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>

                {/* Priority Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    {priorities.map((p) => (
                      <motion.button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                          priority === p.value
                            ? `${p.color} bg-opacity-20 shadow-lg`
                            : "border-gray-700 text-gray-400 hover:border-gray-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-sm font-medium">{p.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || !title.trim()}
                  className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
                    isLoading || !title.trim()
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-500/30"
                  }`}
                  whileHover={!isLoading && title.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isLoading && title.trim() ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Task...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Task
                    </span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard shortcut hint */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute -bottom-6 left-4 text-xs text-gray-500"
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-obsidian-800 text-gray-400">⌘K</kbd> to expand
        </motion.div>
      )}
    </motion.div>
  )
}
