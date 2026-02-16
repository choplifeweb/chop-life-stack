import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface ParallaxProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down"
}

export function Parallax({
  children,
  className = "",
  speed = 0.5,
  direction = "up",
}: ParallaxProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const multiplier = direction === "up" ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100 * multiplier])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} className={className} style={{ y: smoothY }}>
      {children}
    </motion.div>
  )
}

// Parallax with scale effect
interface ParallaxScaleProps {
  children: ReactNode
  className?: string
  scaleRange?: [number, number]
}

export function ParallaxScale({
  children,
  className = "",
  scaleRange = [1, 1.1],
}: ParallaxScaleProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], scaleRange)
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 })

  return (
    <motion.div ref={ref} className={className} style={{ scale: smoothScale }}>
      {children}
    </motion.div>
  )
}

// Parallax with opacity fade
interface ParallaxFadeProps {
  children: ReactNode
  className?: string
  opacityRange?: [number, number]
}

export function ParallaxFade({
  children,
  className = "",
  opacityRange = [0, 1],
}: ParallaxFadeProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [opacityRange[0], 1, opacityRange[1]])

  return (
    <motion.div ref={ref} className={className} style={{ opacity }}>
      {children}
    </motion.div>
  )
}

// Floating animation (continuous)
interface FloatProps {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}

export function Float({
  children,
  className = "",
  duration = 3,
  distance = 10,
}: FloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance / 2, distance / 2, -distance / 2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  )
}

// Magnetic hover effect
interface MagneticProps {
  children: ReactNode
  className?: string
  strength?: number
}

export function Magnetic({
  children,
  className = "",
  strength = 0.3,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(0, { stiffness: 300, damping: 30 })
  const y = useSpring(0, { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength
    x.set(deltaX)
    y.set(deltaY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
