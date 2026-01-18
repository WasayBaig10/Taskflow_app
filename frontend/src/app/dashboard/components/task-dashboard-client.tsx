"use client"

/**
 * Client-side dashboard component with stunning glassmorphic design.
 *
 * Features:
 * - Deep obsidian background with radial gradients
 * - Glassmorphic task cards with hover animations
 * - Color-coded priority system (Neon Green, Electric Orange, Crimson)
 * - Smooth transitions for task completion
 * - Status cards for task statistics
 */
import { useState, useEffect } from "react"
import { createTask, listTasks, completeTask, updateTask, deleteTask } from "@/lib/api-client"
import type { Task } from "@/types/task"
import { AddTaskForm } from "./add-task-form"
import { TaskSkeleton } from "@/components/task-skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { FloatingElement } from "@/components/AnimatedWrapper"
import { StatusCards } from "@/components/status-cards"
import { useToast } from "@/components/toast"

type Priority = "low" | "medium" | "high"

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
  const [editPriority, setEditPriority] = useState<Priority>("medium")
  const { showToast } = useToast()

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoadingTasks(true)
      setTasksError(null)

      try {
        const response = await listTasks(userId, token)
        setTasks(response.tasks)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load tasks"
        setTasksError(errorMsg)
        showToast(errorMsg, "error")
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchTasks()
  }, [userId, token, showToast])

  const handleTaskCreated = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev])
    showToast("Task created successfully!", "success")
  }

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await completeTask(userId, taskId, token)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )
      const message = updatedTask.completed ? "Task completed!" : "Task reopened"
      showToast(message, "success")
    } catch (err) {
      console.error("Failed to complete task:", err)
      showToast("Failed to update task status", "error")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(userId, taskId, token)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      showToast("Task deleted successfully", "info")
    } catch (err) {
      console.error("Failed to delete task:", err)
      const errorMsg = err instanceof Error ? err.message : "Failed to delete task"
      showToast(errorMsg, "error")
    }
  }

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditPriority((task.priority as Priority) || "medium")
  }

  const handleCancelEdit = () => {
    setEditingTaskId(null)
    setEditTitle("")
    setEditDescription("")
    setEditPriority("medium")
  }

  const handleSaveEdit = async (taskId: string) => {
    try {
      const updatedTask = await updateTask(userId, taskId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority
      }, token)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      )
      handleCancelEdit()
      showToast("Task updated successfully", "success")
    } catch (err) {
      console.error("Failed to update task:", err)
      showToast("Failed to update task", "error")
    }
  }

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      low: "text-priority-low border-priority-low shadow-neon-green",
      medium: "text-priority-medium border-priority-medium shadow-neon-orange",
      high: "text-priority-high border-priority-high shadow-neon-red",
    }
    return colors[priority]
  }

  const getPriorityDotColor = (priority: Priority) => {
    const colors = {
      low: "bg-priority-low shadow-[0_0_8px_rgba(57,255,20,0.6)]",
      medium: "bg-priority-medium shadow-[0_0_8px_rgba(255,140,0,0.6)]",
      high: "bg-priority-high shadow-[0_0_8px_rgba(220,20,60,0.6)]",
    }
    return colors[priority]
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <>
      {/* Status Cards */}
      <StatusCards
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
      />

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
        className="glass-card"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Your Tasks</h2>
            <p className="text-sm text-gray-400 mt-1">
              {pendingTasks > 0 ? `${pendingTasks} task${pendingTasks > 1 ? 's' : ''} pending` : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 glass rounded-lg">
              <span className="text-sm text-gray-300 font-medium">
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
              </span>
            </div>
          </div>
        </div>

        {tasksError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 glass border-l-4 border-l-priority-high rounded-lg"
          >
            <p className="text-sm text-priority-high">{tasksError}</p>
          </motion.div>
        )}

        {isLoadingTasks ? (
          <TaskSkeleton />
        ) : tasks.length === 0 ? (
          <FloatingElement className="text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 glass rounded-full flex items-center justify-center"
            >
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-lg font-medium"
            >
              No tasks yet
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-500 text-sm mt-2"
            >
              Create your first task to get started!
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
                  className={`task-card group ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <motion.button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`flex-shrink-0 mt-1 w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                        task.completed
                          ? 'bg-priority-low border-priority-low shadow-neon-green'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {task.completed && (
                        <svg className="w-4 h-4 text-obsidian-950 m-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>

                    {/* Task Content - Edit Mode or View Mode */}
                    <div className="flex-1 min-w-0">
                      {editingTaskId === task.id ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="input-glass w-full"
                            placeholder="Task title"
                          />
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="input-glass w-full resize-none"
                            placeholder="Task description (optional)"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            {(["low", "medium", "high"] as Priority[]).map((p) => (
                              <motion.button
                                key={p}
                                type="button"
                                onClick={() => setEditPriority(p)}
                                className={`flex-1 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                                  editPriority === p
                                    ? getPriorityColor(p)
                                    : "border-gray-700 text-gray-400"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </motion.button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleSaveEdit(task.id)}
                              className="btn-primary"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Save
                            </motion.button>
                            <motion.button
                              onClick={handleCancelEdit}
                              className="btn-glass"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            {/* Priority Indicator */}
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getPriorityDotColor((task.priority as Priority) || "medium")}`} />
                            <div className="flex-1">
                              <h3 className={`text-base font-medium text-white break-words ${task.completed ? 'strikethrough completed' : ''}`}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className={`text-sm mt-1 text-gray-400 break-words ${task.completed ? 'strikethrough completed' : ''}`}>
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(task.created_at).toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor((task.priority as Priority) || "medium")}`}>
                                  {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editingTaskId !== task.id && (
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => handleStartEdit(task)}
                          className="btn-ghost press-effect"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-gray-400 hover:text-priority-high hover:bg-priority-high/10 rounded-lg transition-all press-effect"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </motion.div>
    </>
  )
}
