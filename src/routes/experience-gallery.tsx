import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"

import { PublicLayout } from "@/components/Common/PublicLayout"
import { KineticDragGallery, PreloadAnimation } from "@/components/Gallery"

// Static config - defined outside component to prevent recreation
const GALLERY_CONFIG = {
  autoScroll: true,
  scrollSpeed: 1,
  scrollAngle: 45,
  pauseOnHover: true,
  motionBlur: true,
  blurIntensity: 1,
  imageScale: 1,
  imageGap: 32,
  backgroundColor: "#000000",
  imageFit: "cover" as const,
} as const

const PRELOAD_CONFIG = {
  backgroundColor: "#000000",
  fillDuration: 1.5,
  revealDuration: 0.8,
  initialDelay: 0.3,
} as const

const CTA_DELAY_MS = 3000

// Animation variants - defined outside to prevent recreation
const CTA_HIDDEN = { opacity: 0, y: 20 }
const CTA_VISIBLE = { opacity: 1, y: 0 }
const CTA_TRANSITION = { duration: 0.5, ease: "easeOut" } as const

export const Route = createFileRoute("/experience-gallery")({
  component: ExperienceGallery,
  head: () => ({
    meta: [
      {
        title: "Experience Gallery - Chop Life",
      },
    ],
  }),
})

function ExperienceGallery() {
  const [showCta, setShowCta] = useState(false)

  // Show CTA after a delay to let users immerse in the gallery first
  useEffect(() => {
    const timer = setTimeout(() => setShowCta(true), CTA_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <PreloadAnimation {...PRELOAD_CONFIG}>
      <PublicLayout headerBlur>
        <div className="experience-gallery">
          <KineticDragGallery {...GALLERY_CONFIG} />

          {/* Floating CTA to Calendar Events */}
          <motion.div
            className="experience-gallery__cta"
            initial={CTA_HIDDEN}
            animate={showCta ? CTA_VISIBLE : CTA_HIDDEN}
            transition={CTA_TRANSITION}
          >
            <Link
              to="/calendar-events"
              preload="intent"
              className="experience-gallery__cta-button"
            >
              <CalendarDays className="experience-gallery__cta-icon" />
              <span className="experience-gallery__cta-text">
                <span className="experience-gallery__cta-label">Join the next experience</span>
                <span className="experience-gallery__cta-sublabel">View upcoming events</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </PublicLayout>
    </PreloadAnimation>
  )
}
