import { motion, useInView, type Variants } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  distance?: number
  once?: boolean
  threshold?: number
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 30,
  once = true,
  threshold = 0.1,
}: FadeInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const getDirectionalValues = () => {
    switch (direction) {
      case "up":
        return { y: distance }
      case "down":
        return { y: -distance }
      case "left":
        return { x: distance }
      case "right":
        return { x: -distance }
      default:
        return {}
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...getDirectionalValues() }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

// Staggered children animation
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  staggerDelay?: number
  once?: boolean
}

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number; stagger: number }) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delay,
      staggerChildren: custom.stagger,
    },
  }),
}

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={{ delay, stagger: staggerDelay }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerItemVariants}>
      {children}
    </motion.div>
  )
}

// Scale fade animation
interface ScaleFadeProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  initialScale?: number
}

export function ScaleFade({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  initialScale = 0.95,
}: ScaleFadeProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: initialScale }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
