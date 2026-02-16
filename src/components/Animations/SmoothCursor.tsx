import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

interface SmoothCursorProps {
  isHoveringClickable?: boolean
  isHoveringVideo?: boolean
}

export function SmoothCursor({ isHoveringClickable = false, isHoveringVideo = false }: SmoothCursorProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Raw mouse position
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for cursor
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorX = useSpring(mouseX, springConfig)
  const cursorY = useSpring(mouseY, springConfig)

  // Slower spring for the outer ring (creates trailing effect)
  const ringSpringConfig = { damping: 20, stiffness: 150, mass: 0.8 }
  const ringX = useSpring(mouseX, ringSpringConfig)
  const ringY = useSpring(mouseY, ringSpringConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
    }
  }, [mouseX, mouseY, isVisible])

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="smooth-cursor"
        style={{
          x: cursorX,
          y: cursorY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHoveringClickable ? 0.5 : isHoveringVideo ? 1.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Africa map that trails the cursor */}
      <motion.div
        className="smooth-cursor__africa"
        style={{
          x: ringX,
          y: ringY,
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isHoveringClickable ? 0.6 : isHoveringVideo ? 1.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <img
          src="/assets/images/afrika-outline.svg"
          alt=""
          className="smooth-cursor__africa-img"
        />
        {/* Play icon when hovering video area */}
        <motion.div
          className="smooth-cursor__play"
          animate={{
            opacity: isHoveringVideo ? 1 : 0,
            scale: isHoveringVideo ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      </motion.div>
    </>
  )
}

// Hook to manage cursor state across components
import { createContext, useContext, type ReactNode } from "react"

interface CursorContextType {
  setIsHoveringClickable: (value: boolean) => void
  setIsHoveringVideo: (value: boolean) => void
  isHoveringClickable: boolean
  isHoveringVideo: boolean
}

const CursorContext = createContext<CursorContextType | null>(null)

export function CursorProvider({ children }: { children: ReactNode }) {
  const [isHoveringClickable, setIsHoveringClickable] = useState(false)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)

  return (
    <CursorContext.Provider value={{
      isHoveringClickable,
      setIsHoveringClickable,
      isHoveringVideo,
      setIsHoveringVideo
    }}>
      {children}
      <SmoothCursor
        isHoveringClickable={isHoveringClickable}
        isHoveringVideo={isHoveringVideo}
      />
    </CursorContext.Provider>
  )
}

export function useCursor() {
  const context = useContext(CursorContext)
  if (!context) {
    // Return no-op functions if not in provider
    return {
      setIsHoveringClickable: () => {},
      setIsHoveringVideo: () => {},
      isHoveringClickable: false,
      isHoveringVideo: false,
    }
  }
  return context
}
