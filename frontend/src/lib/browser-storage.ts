/**
 * Browser-based task storage using localStorage.
 *
 * This allows the app to work without a backend server.
 * Tasks are stored in the browser's localStorage.
 */

export interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  created_at: string
  completed_at: string | null
}

const STORAGE_KEY = "taskflow_tasks"

export class BrowserTaskStorage {
  /**
   * Get all tasks from localStorage
   */
  static getTasks(): Task[] {
    if (typeof window === "undefined") return []

    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  /**
   * Save tasks to localStorage
   */
  static saveTasks(tasks: Task[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error("Failed to save tasks:", error)
    }
  }

  /**
   * Create a new task
   */
  static createTask(taskData: { title: string; description?: string }): Task {
    const tasks = this.getTasks()

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title,
      description: taskData.description || null,
      completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
    }

    tasks.push(newTask)
    this.saveTasks(tasks)

    return newTask
  }

  /**
   * List all tasks
   */
  static listTasks(): Task[] {
    return this.getTasks()
  }

  /**
   * Get a specific task by ID
   */
  static getTask(id: string): Task | null {
    const tasks = this.getTasks()
    return tasks.find((t) => t.id === id) || null
  }

  /**
   * Toggle task completion
   */
  static toggleTask(id: string): Task | null {
    const tasks = this.getTasks()
    const task = tasks.find((t) => t.id === id)

    if (!task) return null

    task.completed = !task.completed
    task.completed_at = task.completed ? new Date().toISOString() : null

    this.saveTasks(tasks)
    return task
  }

  /**
   * Update a task
   */
  static updateTask(id: string, updates: Partial<Pick<Task, "title" | "description">>): Task | null {
    const tasks = this.getTasks()
    const task = tasks.find((t) => t.id === id)

    if (!task) return null

    if (updates.title !== undefined) task.title = updates.title
    if (updates.description !== undefined) task.description = updates.description

    this.saveTasks(tasks)
    return task
  }

  /**
   * Delete a task
   */
  static deleteTask(id: string): boolean {
    const tasks = this.getTasks()
    const filteredTasks = tasks.filter((t) => t.id !== id)

    if (filteredTasks.length === tasks.length) return false

    this.saveTasks(filteredTasks)
    return true
  }

  /**
   * Clear all tasks
   */
  static clearAllTasks(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  }
}
