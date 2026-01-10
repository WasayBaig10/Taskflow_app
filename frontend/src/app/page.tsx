"use client"

/**
 * Landing page with premium UI/UX.
 *
 * Features:
 * - Dark mode support
 * - Framer Motion animations
 * - Hover effects on feature cards
 * - Page transitions
 */
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { GlowButton, PageTransition } from "@/components/AnimatedWrapper"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    setIsLoggedIn(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    } else {
      router.push("/login")
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
        stiffness: 100,
        damping: 12
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800"
    >
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold text-gray-900 dark:text-gray-100 sm:text-6xl md:text-7xl"
          >
            <span className="block">Manage Your Tasks</span>
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-md mx-auto text-base text-gray-600 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Simple, powerful task management with JWT authentication.
            Stay organized and get things done with TaskFlow.
          </motion.p>

          {/* Auth Buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 max-w-lg mx-auto sm:flex sm:justify-center md:mt-12"
          >
            {!isLoggedIn ? (
              <>
                {/* Sign In Button */}
                <div className="rounded-md shadow-lg sm:ml-3">
                  <GlowButton
                    onClick={() => router.push("/login")}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 md:py-4 md:text-lg md:px-10 transition-all shadow-xl"
                  >
                    Sign In
                  </GlowButton>
                </div>

                {/* Sign Up Button */}
                <div className="mt-3 rounded-md shadow-lg sm:mt-0 sm:ml-3">
                  <GlowButton
                    onClick={() => router.push("/signup")}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-blue-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-all shadow-xl"
                  >
                    Sign Up
                  </GlowButton>
                </div>
              </>
            ) : (
              /* Dashboard Button when logged in */
              <div className="rounded-md shadow-lg">
                <GlowButton
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 md:py-4 md:text-lg md:px-10 transition-all shadow-xl"
                >
                  Go to Dashboard
                </GlowButton>
              </div>
            )}
          </motion.div>

          {/* Additional Help Text */}
          {!isLoggedIn && (
            <motion.div
              variants={itemVariants}
              className="mt-4 text-sm text-gray-600 dark:text-gray-400"
            >
              <p>New user? <span className="font-medium text-blue-600 dark:text-blue-400">Sign Up</span> to create an account</p>
              <p className="mt-1">Already have an account? <span className="font-medium text-blue-600 dark:text-blue-400">Sign In</span> to continue</p>
            </motion.div>
          )}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Track Tasks</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage your tasks with ease. Mark them as complete when done.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with JWT authentication. Only you can see your tasks.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all"
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 dark:from-purple-600 dark:to-violet-700 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Fast</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with FastAPI and Next.js for lightning-fast performance.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Built with Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Next.js 16", "FastAPI", "JWT Auth", "PostgreSQL", "Tailwind CSS", "TypeScript"].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                className="px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 cursor-default"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
