import { motion, type Variants } from "framer-motion"

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  staggerChildren?: number
  type?: "chars" | "words" | "lines"
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { stagger: number; delay: number }) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.delay,
    },
  }),
}

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
}

export function AnimatedText({
  text,
  className = "",
  delay = 0,
  staggerChildren = 0.03,
  type = "chars",
}: AnimatedTextProps) {
  if (type === "words") {
    const words = text.split(" ")
    return (
      <motion.span
        className={className}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        custom={{ stagger: staggerChildren, delay }}
        style={{ display: "inline-block" }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            style={{ display: "inline-block", marginRight: "0.25em" }}
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    )
  }

  const chars = text.split("")
  return (
    <motion.span
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={{ stagger: staggerChildren, delay }}
      style={{ display: "inline-block" }}
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          variants={charVariants}
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Split text reveal animation - each line slides up with mask
interface SplitTextRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SplitTextReveal({
  children,
  className = "",
  delay = 0,
}: SplitTextRevealProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Staggered text reveal for multiple lines
interface StaggeredRevealProps {
  lines: string[]
  className?: string
  lineClassName?: string
  baseDelay?: number
  staggerDelay?: number
}

export function StaggeredReveal({
  lines,
  className = "",
  lineClassName = "",
  baseDelay = 0.5,
  staggerDelay = 0.15,
}: StaggeredRevealProps) {
  return (
    <div className={className}>
      {lines.map((line, index) => (
        <div key={index} className="overflow-hidden">
          <motion.div
            className={lineClassName}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: baseDelay + index * staggerDelay,
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  )
}
