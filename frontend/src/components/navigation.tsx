"use client"

/**
 * Navigation header component with glassmorphism effect and profile dropdown.
 *
 * Features:
 * - Sticky navbar with blur effect
 * - Profile dropdown instead of logout button
 * - Glassmorphic styling
 * - Smooth animations
 */
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"
import { nav } from "framer-motion/client"

export function Navigation() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setShowProfileDropdown(false)
    router.push("/")
  }

  // Glassmorphism effect classes
  const glassClasses = scrolled
    ? "bg-obsidian-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg"
    : "bg-obsidian-950/50 backdrop-blur-md border-b border-white/5"

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-obsidian-950 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg animate-pulse" />
              <div className="ml-3 h-6 w-24 bg-white/5 rounded animate-pulse hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/5 rounded-lg animate-pulse" />
              <div className="w-16 h-8 bg-white/5 rounded animate-pulse hidden sm:block" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 font-sans ${glassClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center flex-shrink-0"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-lobster_two text-xl font-bold text-gradient hidden sm:block ">TaskFlow</span>
            </button>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-2 font-comfortaa ">
            <ThemeToggle />

            {isLoggedIn ? (
              <>
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  className="btn-ghost hidden md:flex"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Dashboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="ml-2 font-julius_sans_one">Dashboard</span>
                </motion.button>

                <motion.button
                  onClick={() => router.push("/chat")}
                  className="btn-ghost hidden md:flex"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="AI Chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="ml-2 font-comfortaa">AI Chat</span>
                </motion.button>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-2 px-3 py-2 glass rounded-lg hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg">
                      {getInitials(email)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-medium text-white truncate max-w-[120px]">
                        {email.split('@')[0]}
                      </p>
                    </div>
                    <motion.svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: showProfileDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-glass border border-white/10 overflow-hidden"
                      >
                        <div className="p-3 border-b border-white/5">
                          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">{email}</p>
                        </div>

                        <div className="py-1">
                          <motion.button
                            onClick={() => {
                              router.push("/dashboard")
                              setShowProfileDropdown(false)
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3"
                            whileHover={{ x: 4 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </motion.button>

                          <motion.button
                            onClick={() => {
                              router.push("/chat")
                              setShowProfileDropdown(false)
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3"
                            whileHover={{ x: 4 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            AI Chat
                          </motion.button>
                        </div>

                        <div className="border-t border-white/5 py-1">
                          <motion.button
                            onClick={handleLogout}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-3"
                            whileHover={{ x: 4 }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign out
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => router.push("/login")}
                  className="btn-ghost"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => router.push("/signup")}
                  className="btn-primary"
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
