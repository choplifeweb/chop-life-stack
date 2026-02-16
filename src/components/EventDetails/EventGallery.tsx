import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import type { EventImagePublic } from "@/client/types.gen"

interface EventGalleryProps {
  images: EventImagePublic[]
  getImageUrl: (path: string) => string | undefined
  autoSlideInterval?: number // in milliseconds, default 3000 (3s)
}

export function EventGallery({
  images,
  getImageUrl,
  autoSlideInterval = 3000,
}: EventGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Don't render anything if there are no images
  if (!images || images.length === 0) {
    return null
  }

  // Sort images by display_order
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)

  // Filter out images without valid URLs
  const validImages = sortedImages
    .map((image) => ({
      ...image,
      resolvedUrl: getImageUrl(image.image_url),
    }))
    .filter((image) => image.resolvedUrl)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }, [validImages.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }, [validImages.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || validImages.length <= 1) return

    const interval = setInterval(goToNext, autoSlideInterval)
    return () => clearInterval(interval)
  }, [isPaused, validImages.length, autoSlideInterval, goToNext])

  if (validImages.length === 0) {
    return null
  }

  return (
    <div
      className="event-details__gallery"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Container */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10">
        {/* Images */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {validImages.map((image, index) => (
            <img
              key={image.id}
              src={image.resolvedUrl}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="mt-3 text-center text-sm text-white/60">
          {currentIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  )
}

export default EventGallery
