"use client"

/**
 * Client-side dashboard component with JWT token and premium UI/UX.
 *
 * Features:
 * - Dark mode support
 * - Framer Motion animations
 * - Glassmorphism effects
 * - Loading skeleton
 * - Smooth transitions
 */
import { useState, useEffect } from "react"
import { createTask, listTasks, completeTask, updateTask } from "@/lib/api-client"
import type { Task } from "@/types/task"
import { AddTaskForm } from "./add-task-form"
import { TaskSkeleton } from "@/components/task-skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { FloatingElement } from "@/components/AnimatedWrapper"

interface TaskDashboardClientProps {
  userId: string
  token: string
}

export function TaskDashboardClient({ userId, token }: TaskDashboardClientProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoadingTasks(true)
      setTasksError(null)

      try {
        const response = await listTasks(userId, token)
        setTasks(response.tasks)
      } catch (err) {
        setTasksError(err instanceof Error ? err.message : "Failed to load tasks")
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchTasks()
  }, [userId, token])

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
  }

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await completeTask(userId, taskId, token)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )
    } catch (err) {
      console.error("Failed to complete task:", err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/${userId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTitle("")
    setEditDescription("")
  }

  const handleSaveEdit = async (taskId: string) => {
    try {
      const updatedTask = await updateTask(userId, taskId, { title: editTitle, description: editDescription }, token)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )
      handleCancelEdit()
    } catch (err) {
      console.error("Failed to update task:", err)
      alert("Failed to update task. Please try again.")
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <>
      {/* AddTask Component */}
      <AddTaskForm
        userId={userId}
        token={token}
        onTaskCreated={handleTaskCreated}
      />

      {/* Task List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg rounded-xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50"
      >
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Your Tasks
        </h2>

        {tasksError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-lg backdrop-blur-sm"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{tasksError}</p>
          </motion.div>
        )}

        {isLoadingTasks ? (
          <TaskSkeleton />
        ) : tasks.length === 0 ? (
          <FloatingElement className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              No tasks yet
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 dark:text-gray-500 text-sm mt-1"
            >
              Create your first task above!
            </motion.p>
          </FloatingElement>
        ) : (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.li
                  key={task.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className={`flex flex-col sm:flex-row items-start justify-between gap-3 p-3 sm:p-4 border rounded-xl transition-all ${
                    task.completed
                      ? "bg-green-50/80 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50 backdrop-blur-sm"
                      : "bg-white/80 dark:bg-gray-800/80 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-md hover:border-blue-200/50 dark:hover:border-blue-800/50"
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 w-full">
                    {/* Checkbox */}
                    <motion.input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />

                    {/* Task Content - Edit Mode or View Mode */}
                    {editingTaskId === task.id ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex-1 space-y-2 w-full"
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Task title"
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="Task description (optional)"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handleSaveEdit(task.id)}
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Save
                          </motion.button>
                          <motion.button
                            onClick={handleCancelEdit}
                            className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm sm:text-base font-medium ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"} break-words`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-xs sm:text-sm mt-1 ${task.completed ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"} break-words`}>
                            {task.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2">
                          {new Date(task.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {editingTaskId !== task.id && (
                    <div className="flex gap-2 sm:ml-4 w-full sm:w-auto justify-end">
                      <motion.button
                        onClick={() => handleStartEdit(task)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/80 dark:hover:bg-red-900/20 rounded-lg border border-red-200/50 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-all backdrop-blur-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </motion.div>
    </>
  )
}
