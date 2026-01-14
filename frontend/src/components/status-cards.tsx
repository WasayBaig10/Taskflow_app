"use client"

/**
 * StatusCards component - High-impact task statistics display.
 *
 * Features:
 * - Glassmorphic design with hover effects
 * - Animated counters
 * - Neon glow indicators
 * - Responsive grid layout
 */
import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"

interface StatusCardsProps {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

interface CounterProps {
  value: number
  duration?: number
}

function AnimatedCounter({ value, duration = 1000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const startValue = 0
    const endValue = value

    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(startValue + (endValue - startValue) * easeOutQuart))

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    requestAnimationFrame(animateCount)
  }, [isVisible, value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
    </span>
  )
}

export function StatusCards({ totalTasks, completedTasks, pendingTasks }: StatusCardsProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      glowColor: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-priority-low to-green-500",
      glowColor: "shadow-[0_0_20px_rgba(57,255,20,0.3)]",
    },
    {
      label: "Pending",
      value: pendingTasks,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-priority-medium to-orange-500",
      glowColor: "shadow-[0_0_20px_rgba(255,140,0,0.3)]",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
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
        damping: 24,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          whileHover={{
            y: -4,
            scale: 1.02,
            transition: { type: "spring", stiffness: 400, damping: 20 },
          }}
          className="glass-card group relative overflow-hidden"
        >
          {/* Background gradient glow on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.color} ${stat.glowColor}`}>
                {stat.icon}
              </div>
              <div className={`text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-to-br ${stat.color} bg-opacity-20 text-white/80`}>
                {index === 0 && "All"}
                {index === 1 && "Done"}
                {index === 2 && "Todo"}
              </div>
            </div>

            <div className="space-y-1">
              <motion.p
                className="text-3xl sm:text-4xl font-bold text-white tabular-nums"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              >
                <AnimatedCounter value={stat.value} />
              </motion.p>
              <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
            </div>

            {/* Progress bar for completed */}
            {stat.label === "Completed" && totalTasks > 0 && (
              <div className="mt-4 h-1.5 bg-obsidian-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-priority-low to-green-500 rounded-full"
                />
              </div>
            )}
          </div>

          {/* Subtle border glow on hover */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
        </motion.div>
      ))}
    </motion.div>
  )
}
