import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCursor } from "../Animations";

// Gallery images
const galleryImages = [
  { id: 1, src: "https://picsum.photos/seed/gx1/500/700", title: "Night Vibes" },
  { id: 2, src: "https://picsum.photos/seed/gx2/500/700", title: "City Lights" },
  { id: 3, src: "https://picsum.photos/seed/gx3/500/700", title: "Golden Hour" },
  { id: 4, src: "https://picsum.photos/seed/gx4/500/700", title: "Urban Flow" },
  { id: 5, src: "https://picsum.photos/seed/gx5/500/700", title: "Midnight" },
  { id: 6, src: "https://picsum.photos/seed/gx6/500/700", title: "Sunset" },
  { id: 7, src: "https://picsum.photos/seed/gx7/500/700", title: "Electric" },
  { id: 8, src: "https://picsum.photos/seed/gx8/500/700", title: "Neon Glow" },
  { id: 9, src: "https://picsum.photos/seed/gx9/500/700", title: "Dreams" },
  { id: 10, src: "https://picsum.photos/seed/gx10/500/700", title: "Vibes" },
  { id: 11, src: "https://picsum.photos/seed/gx11/500/700", title: "Flow" },
  { id: 12, src: "https://picsum.photos/seed/gx12/500/700", title: "Energy" },
];

interface GalleryImage {
  id: number;
  src: string;
  title: string;
}

// Grid item with simple CSS hover effect
function GridItem({
  image,
  index,
  onClick,
}: {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}) {
  const { setIsHoveringClickable } = useCursor();

  return (
    <motion.div
      className="gallery-x__item"
      onClick={onClick}
      onMouseEnter={() => setIsHoveringClickable(true)}
      onMouseLeave={() => setIsHoveringClickable(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index, 11) * 0.04,
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      <div className="gallery-x__image-container">
        <img
          src={image.src}
          alt={image.title}
          className="gallery-x__image"
          draggable={false}
        />
        <div className="gallery-x__overlay">
          <span className="gallery-x__title">{image.title}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Fullscreen modal
function ImageModal({
  isOpen,
  image,
  onClose,
}: {
  isOpen: boolean;
  image: GalleryImage | null;
  onClose: () => void;
}) {
  const { setIsHoveringClickable } = useCursor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          className="gallery-x__modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="gallery-x__modal-backdrop"
            onClick={onClose}
          />
          <motion.img
            src={image.src}
            alt={image.title}
            className="gallery-x__modal-image"
            initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
          <motion.div
            className="gallery-x__modal-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <span className="gallery-x__modal-title">{image.title}</span>
          </motion.div>
          <motion.button
            className="gallery-x__modal-close"
            onClick={onClose}
            onMouseEnter={() => setIsHoveringClickable(true)}
            onMouseLeave={() => setIsHoveringClickable(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function KineticGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [displayImages, setDisplayImages] = useState<GalleryImage[]>([
    ...galleryImages,
    ...galleryImages,
    ...galleryImages,
  ]);
  const isLoadingMore = useRef(false);

  // Infinite scroll - add more images when near bottom (with debounce)
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore.current) return;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // When user scrolls near the bottom (within 500px), add more images
      if (scrollTop + windowHeight >= docHeight - 500) {
        isLoadingMore.current = true;
        setDisplayImages((prev) => [...prev, ...galleryImages]);
        // Reset loading flag after a short delay
        setTimeout(() => {
          isLoadingMore.current = false;
        }, 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleImageClick = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <>
      <div className="gallery-x" ref={scrollRef}>
        <div className="gallery-x__header">
          <motion.h1
            className="gallery-x__heading"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Experience Gallery
          </motion.h1>
          <motion.p
            className="gallery-x__subheading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            Hover to explore • Click to view • Scroll for more
          </motion.p>
        </div>

        <motion.div
          className="gallery-x__container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="gallery-x__grid">
            {displayImages.map((image, index) => (
              <GridItem
                key={`${image.id}-${index}`}
                image={image}
                index={index}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          className="gallery-x__scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="gallery-x__scroll-indicator"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span>Scroll for more</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        image={selectedImage}
        onClose={handleCloseModal}
      />
    </>
  );
}
