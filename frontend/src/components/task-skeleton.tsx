/**
 * Loading skeleton component for task list.
 *
 * Provides visual feedback while tasks are being fetched.
 */
import { motion } from "framer-motion"

export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-3">
            {/* Checkbox skeleton */}
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4 mt-2" />
            </div>

            {/* Buttons skeleton */}
            <div className="flex gap-2">
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
