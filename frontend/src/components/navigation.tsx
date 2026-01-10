"use client"

/**
 * Navigation header component with glassmorphism effect and responsive design.
 *
 * Shows app branding, theme toggle, and authentication controls.
 */
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

export function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem("auth_token")
      const userEmail = localStorage.getItem("user_email")

      setIsLoggedIn(!!token)
      setEmail(userEmail || "")
    }

    checkAuth()

    // Listen for custom auth state changes
    const handleAuthChange = () => checkAuth()
    window.addEventListener('auth-change', handleAuthChange)

    // Handle scroll for glassmorphism effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  // Glassmorphism effect classes
  const glassClasses = scrolled
    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
    : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg animate-pulse" />
              <div className="ml-2 h-6 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse hidden xs:block" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              <div className="w-14 sm:w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse hidden sm:block" />
              <div className="w-14 sm:w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${glassClasses}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 hidden xs:block">TaskFlow</span>
            </button>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <motion.span
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden md:block font-medium truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {email}
                </motion.span>
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Dashboard"
                >
                  <span className="hidden sm:inline">Dashboard</span>
                  <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => router.push("/login")}
                  className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => router.push("/signup")}
                  className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
