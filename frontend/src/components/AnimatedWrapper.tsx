"use client";

/**
 * AnimatedWrapper - Professional animation components and variants for Framer Motion
 *
 * Provides reusable animation patterns:
 * - Staggered list animations
 * - Page transitions
 * - Interactive feedback (tap, hover, layout)
 * - Empty state animations
 * - Button enhancements
 */

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

/**
 * Staggered container variants for list items
 * Children animate in one by one with a delay
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/**
 * Slide up animation for list items
 */
export const slideUpItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Fade in from bottom for page content
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Scale animation for interactive elements (buttons, checkboxes)
 */
export const tapScale = {
  tap: { scale: 0.95 },
  hover: { scale: 1.02 },
};

/**
 * Gentle floating animation for empty states
 */
export const floating: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Page slide transition variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// =============================================================================
// WRAPPER COMPONENTS
// =============================================================================

/**
 * StaggeredList - Wrapper for animating list items with staggered entrance
 *
 * @param children - List items to animate
 * @param className - Additional CSS classes
 */
export function StaggeredList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedItem - Wrapper for individual list items with layout animation
 *
 * @param children - Content to animate
 * @param className - Additional CSS classes
 * @param onClick - Optional click handler
 */
export function AnimatedItem({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      variants={slideUpItem}
      layout
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageWrapper - Wraps page content with fade-in animation
 *
 * @param children - Page content
 * @param className - Additional CSS classes
 */
export function PageWrapper({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedButton - Button with hover and tap effects
 *
 * @param children - Button content
 * @param onClick - Click handler
 * @param className - Additional CSS classes
 * @param disabled - Disable button
 */
export function AnimatedButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      whileFocus={!disabled ? { scale: 1.02 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/**
 * AnimatedCheckbox - Checkbox with bounce effect on tap
 *
 * @param checked - Is checkbox checked
 * @param onChange - Change handler
 * @param children - Checkbox content
 * @param className - Additional CSS classes
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  children,
  className = "",
}: {
  checked: boolean;
  onChange: () => void;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={onChange}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FloatingElement - Adds gentle floating animation (for empty states)
 *
 * @param children - Content to float
 * @param className - Additional CSS classes
 */
export function FloatingElement({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={floating}
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * PageTransition - Wraps content for page-to-page transitions
 *
 * @param children - Page content
 * @param className - Additional CSS classes
 */
export function PageTransition({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * GlowButton - Button with subtle glow effect on hover
 *
 * @param children - Button content
 * @param onClick - Click handler
 * @param className - Additional CSS classes
 * @param disabled - Disable button
 */
export function GlowButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? {
        scale: 1.02,
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// Export all variants for custom use
export const variants = {
  staggerContainer,
  slideUpItem,
  fadeInUp,
  tapScale,
  floating,
  pageTransition,
};
