"use client"

/**
 * Landing page with stunning glassmorphic neon aesthetic.
 *
 * Features:
 * - Dynamic mesh gradient background with cursor tracking
 * - Gradient text effects (Electric Blue to Neon Purple)
 * - Glassmorphic feature cards with 3D tilt effect
 * - Neon glow CTA buttons
 * - Smooth animations
 */
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useMotionValue, useTransform } from "framer-motion"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    setIsLoggedIn(!!token)
  }, [])

  // Track mouse position for gradient effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        })
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
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
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(120, 119, 198, 0.15) 0%,
            transparent 50%)
        `
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-obsidian-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 animate-pulse" />
        <div className="absolute inset-0 bg-obsidian-gradient" />
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-bold sm:text-6xl md:text-7xl -tracking-[0.01em]"
          >
            <span className="block text-white">Manage Your Tasks</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
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
                <div className="rounded-lg sm:ml-3">
                  <motion.button
                    onClick={() => router.push("/login")}
                    className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 md:py-4 md:text-lg md:px-10 transition-all shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign In
                  </motion.button>
                </div>

                {/* Sign Up Button */}
                <div className="mt-3 rounded-lg sm:mt-0 sm:ml-3">
                  <motion.button
                    onClick={() => router.push("/signup")}
                    className="w-full flex items-center justify-center px-8 py-3.5 border border-blue-500/30 text-base font-medium rounded-xl text-blue-400 glass md:py-4 md:text-lg md:px-10 transition-all"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              </>
            ) : (
              /* Dashboard Button when logged in */
              <div className="rounded-lg">
                <motion.button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 md:py-4 md:text-lg md:px-10 transition-all shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34, 197, 94, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Dashboard
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Additional Help Text */}
          {!isLoggedIn && (
            <motion.div
              variants={itemVariants}
              className="mt-4 text-sm text-gray-400"
            >
              {/* <p>New user? <span className="font-medium text-blue-400">Sign Up</span> to create an account</p>
              <p className="mt-1">Already have an account? <span className="font-medium text-blue-400">Sign In</span> to continue</p> */}
            </motion.div>
          )}
        </motion.div>

        {/* Features Section with Glassmorphic Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 - Track Tasks */}
            <TiltCard>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Track Tasks</h3>
              <p className="text-gray-400">
                Create and manage your tasks with ease. Mark them as complete when done.
              </p>
            </TiltCard>

            {/* Feature 2 - Secure */}
            <TiltCard>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
              <p className="text-gray-400">
                Your data is protected with JWT authentication. Only you can see your tasks.
              </p>
            </TiltCard>

            {/* Feature 3 - Fast */}
            <TiltCard>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast</h3>
              <p className="text-gray-400">
                Built with FastAPI and Next.js for lightning-fast performance.
              </p>
            </TiltCard>
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
          <h2 className="text-3xl font-bold text-white mb-8">Built with Modern Tech</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {["Next.js 16", "FastAPI", "JWT Auth", "PostgreSQL", "Tailwind CSS", "TypeScript"].map((tech, index) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                className="px-5 py-2.5 glass rounded-full shadow-lg text-sm font-medium text-gray-200 border border-white/10 cursor-default hover:border-white/20"
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

// Tilt Card Component with 3D effect
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((e.clientX - centerX) / 20)
    y.set((e.clientY - centerY) / 20)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const rotateX = useTransform(y, [-10, 10], [5, -5])
  const rotateY = useTransform(x, [-10, 10], [-5, 5])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      className="glass-card p-6 cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}
