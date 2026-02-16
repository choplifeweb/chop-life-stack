import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useSpring,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo, startTransition, useCallback, memo } from "react";
import { useCursor } from "../Animations";

// Optimized Image component with lazy loading and skeleton
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  imageFit,
  onLoad,
}: {
  src: string;
  alt: string;
  imageFit: "fill" | "cover" | "contain" | "none" | "scale-down";
  onLoad?: () => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  return (
    <>
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="kinetic-drag-gallery__skeleton"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "8px",
          }}
        />
      )}
      {/* Error state */}
      {hasError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: "0.75rem",
            borderRadius: "8px",
          }}
        >
          Failed to load
        </div>
      )}
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: "100%",
          height: "100%",
          objectFit: imageFit,
          userSelect: "none",
          pointerEvents: "none",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        draggable={false}
      />
    </>
  );
});

// Memoized tile component - keeps useTransform hooks stable per tile instance
const TileComponent = memo(function TileComponent({
  x,
  y,
  tileIndexX,
  tileIndexY,
  totalWidth,
  totalHeight,
  gridColumns,
  imageWidth,
  imageGap,
  filterStyle,
  children,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  tileIndexX: number;
  tileIndexY: number;
  totalWidth: number;
  totalHeight: number;
  gridColumns: number;
  imageWidth: number;
  imageGap: number;
  filterStyle: MotionValue<string>;
  children: React.ReactNode;
}) {
  // useTransform hooks are now stable per tile instance
  const tileX = useTransform(x, (xVal) => xVal + tileIndexX * totalWidth);
  const tileY = useTransform(y, (yVal) => yVal + tileIndexY * totalHeight);

  return (
    <motion.div
      style={{
        position: "absolute",
        display: "grid",
        gridTemplateColumns: `repeat(${gridColumns}, ${imageWidth}px)`,
        gap: imageGap,
        left: 0,
        top: 0,
        x: tileX,
        y: tileY,
        filter: filterStyle,
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
});

interface GalleryImage {
  src: string;
  alt: string;
}

interface KineticDragGalleryProps {
  images?: GalleryImage[];
  scrollSpeed?: number;
  backgroundColor?: string;
  motionBlur?: boolean;
  blurIntensity?: number;
  imageScale?: number;
  imageGap?: number;
  autoScroll?: boolean;
  scrollAngle?: number;
  pauseOnHover?: boolean;
  smallImagesOnMobile?: boolean;
  imageFit?: "fill" | "cover" | "contain" | "none" | "scale-down";
}

// Check if we should use production assets
const useProductionAssets = import.meta.env.VITE_USE_PRODUCTION_ASSETS === "true";

// Development placeholder images
const devImages: GalleryImage[] = [
  { src: "https://picsum.photos/seed/gx1/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx2/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx3/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx4/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx5/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx6/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx7/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx8/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx9/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx10/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx11/500/700", alt: "" },
  { src: "https://picsum.photos/seed/gx12/500/700", alt: "" },
];

// Production cultural images
const productionImages: GalleryImage[] = [
  { src: "/assets/cultural_images/1.webp", alt: "" },
  { src: "/assets/cultural_images/2.webp", alt: "" },
  { src: "/assets/cultural_images/3.webp", alt: "" },
  { src: "/assets/cultural_images/4.webp", alt: "" },
  { src: "/assets/cultural_images/5.webp", alt: "" },
  { src: "/assets/cultural_images/6.webp", alt: "" },
  { src: "/assets/cultural_images/7.webp", alt: "" },
  { src: "/assets/cultural_images/8.webp", alt: "" },
  { src: "/assets/cultural_images/9.webp", alt: "" },
  { src: "/assets/cultural_images/10.webp", alt: "" },
  { src: "/assets/cultural_images/11.webp", alt: "" },
  { src: "/assets/cultural_images/12.webp", alt: "" },
  { src: "/assets/cultural_images/13.webp", alt: "" },
  { src: "/assets/cultural_images/14.webp", alt: "" },
  { src: "/assets/cultural_images/15.webp", alt: "" },
  { src: "/assets/cultural_images/16.webp", alt: "" },
  { src: "/assets/cultural_images/17.webp", alt: "" },
  { src: "/assets/cultural_images/18.webp", alt: "" },
  { src: "/assets/cultural_images/19.webp", alt: "" },
  { src: "/assets/cultural_images/20.webp", alt: "" },
  { src: "/assets/cultural_images/21.webp", alt: "" },
  { src: "/assets/cultural_images/22.webp", alt: "" },
  { src: "/assets/cultural_images/23.webp", alt: "" },
  { src: "/assets/cultural_images/24.webp", alt: "" },
  { src: "/assets/cultural_images/25.webp", alt: "" },
  { src: "/assets/cultural_images/26.webp", alt: "" },
  { src: "/assets/cultural_images/27.webp", alt: "" },
  { src: "/assets/cultural_images/28.webp", alt: "" },
  { src: "/assets/cultural_images/29.webp", alt: "" },
  { src: "/assets/cultural_images/30.webp", alt: "" },
  { src: "/assets/cultural_images/31.webp", alt: "" },
  { src: "/assets/cultural_images/32.webp", alt: "" },
  { src: "/assets/cultural_images/33.webp", alt: "" },
  { src: "/assets/cultural_images/34.webp", alt: "" },
  { src: "/assets/cultural_images/35.webp", alt: "" },
  { src: "/assets/cultural_images/36.webp", alt: "" },
  { src: "/assets/cultural_images/37.webp", alt: "" },
  { src: "/assets/cultural_images/38.webp", alt: "" },
  { src: "/assets/cultural_images/39.webp", alt: "" },
  { src: "/assets/cultural_images/40.webp", alt: "" },
  { src: "/assets/cultural_images/41.webp", alt: "" },
  { src: "/assets/cultural_images/42.webp", alt: "" },
  { src: "/assets/cultural_images/43.webp", alt: "" },
  { src: "/assets/cultural_images/44.webp", alt: "" },
  { src: "/assets/cultural_images/45.webp", alt: "" },
  { src: "/assets/cultural_images/46.webp", alt: "" },
  { src: "/assets/cultural_images/47.webp", alt: "" },
  { src: "/assets/cultural_images/48.webp", alt: "" },
  { src: "/assets/cultural_images/49.webp", alt: "" },
  { src: "/assets/cultural_images/50.webp", alt: "" },
  { src: "/assets/cultural_images/51.webp", alt: "" },
  { src: "/assets/cultural_images/52.webp", alt: "" },
  { src: "/assets/cultural_images/53.webp", alt: "" },
  { src: "/assets/cultural_images/54.webp", alt: "" },
  { src: "/assets/cultural_images/55.webp", alt: "" },
  { src: "/assets/cultural_images/56.webp", alt: "" },
  { src: "/assets/cultural_images/57.webp", alt: "" },
  { src: "/assets/cultural_images/58.webp", alt: "" },
  { src: "/assets/cultural_images/59.webp", alt: "" },
  { src: "/assets/cultural_images/60.webp", alt: "" },
  { src: "/assets/cultural_images/61.webp", alt: "" },
  { src: "/assets/cultural_images/62.webp", alt: "" },
  { src: "/assets/cultural_images/63.webp", alt: "" },
  { src: "/assets/cultural_images/64.webp", alt: "" },
  { src: "/assets/cultural_images/65.webp", alt: "" },
  { src: "/assets/cultural_images/66.webp", alt: "" },
  { src: "/assets/cultural_images/67.webp", alt: "" },
  { src: "/assets/cultural_images/68.webp", alt: "" },
  { src: "/assets/cultural_images/69.webp", alt: "" },
  { src: "/assets/cultural_images/70.webp", alt: "" },
  { src: "/assets/cultural_images/71.webp", alt: "" },
  { src: "/assets/cultural_images/72.webp", alt: "" },
  { src: "/assets/cultural_images/73.webp", alt: "" },
  { src: "/assets/cultural_images/74.webp", alt: "" },
  { src: "/assets/cultural_images/75.webp", alt: "" },
  { src: "/assets/cultural_images/76.webp", alt: "" },
  { src: "/assets/cultural_images/77.webp", alt: "" },
  { src: "/assets/cultural_images/78.webp", alt: "" },
  { src: "/assets/cultural_images/79.webp", alt: "" },
  { src: "/assets/cultural_images/80.webp", alt: "" },
  { src: "/assets/cultural_images/81.webp", alt: "" },
  { src: "/assets/cultural_images/82.webp", alt: "" },
  { src: "/assets/cultural_images/83.webp", alt: "" },
  { src: "/assets/cultural_images/84.webp", alt: "" },
  { src: "/assets/cultural_images/85.webp", alt: "" },
  { src: "/assets/cultural_images/86.webp", alt: "" },
  { src: "/assets/cultural_images/87.webp", alt: "" },
  { src: "/assets/cultural_images/88.webp", alt: "" },
  { src: "/assets/cultural_images/89.webp", alt: "" },
  { src: "/assets/cultural_images/90.webp", alt: "" },
  { src: "/assets/cultural_images/91.webp", alt: "" },
  { src: "/assets/cultural_images/92.webp", alt: "" },
  { src: "/assets/cultural_images/93.webp", alt: "" },
  { src: "/assets/cultural_images/94.webp", alt: "" },
  { src: "/assets/cultural_images/95.webp", alt: "" },
  { src: "/assets/cultural_images/96.webp", alt: "" },
  { src: "/assets/cultural_images/97.webp", alt: "" },
  { src: "/assets/cultural_images/98.webp", alt: "" },
  { src: "/assets/cultural_images/99.webp", alt: "" },
  { src: "/assets/cultural_images/100.webp", alt: "" },
  { src: "/assets/cultural_images/101.webp", alt: "" },
  { src: "/assets/cultural_images/102.webp", alt: "" },
  { src: "/assets/cultural_images/103.webp", alt: "" },
  { src: "/assets/cultural_images/104.webp", alt: "" },
  { src: "/assets/cultural_images/105.webp", alt: "" },
  { src: "/assets/cultural_images/106.webp", alt: "" },
  { src: "/assets/cultural_images/107.webp", alt: "" },
  { src: "/assets/cultural_images/108.webp", alt: "" },
  { src: "/assets/cultural_images/109.webp", alt: "" },
  { src: "/assets/cultural_images/110.webp", alt: "" },
  { src: "/assets/cultural_images/111.webp", alt: "" },
  { src: "/assets/cultural_images/112.webp", alt: "" },
  { src: "/assets/cultural_images/113.webp", alt: "" },
  { src: "/assets/cultural_images/114.webp", alt: "" },
  { src: "/assets/cultural_images/115.webp", alt: "" },
  { src: "/assets/cultural_images/116.webp", alt: "" },
  { src: "/assets/cultural_images/117.webp", alt: "" },
  { src: "/assets/cultural_images/118.webp", alt: "" },
  { src: "/assets/cultural_images/119.webp", alt: "" },
  { src: "/assets/cultural_images/120.webp", alt: "" },
  { src: "/assets/cultural_images/121.webp", alt: "" },
  { src: "/assets/cultural_images/122.webp", alt: "" },
  { src: "/assets/cultural_images/123.webp", alt: "" },
  { src: "/assets/cultural_images/124.webp", alt: "" },
  { src: "/assets/cultural_images/125.webp", alt: "" },
  { src: "/assets/cultural_images/126.webp", alt: "" },
  { src: "/assets/cultural_images/127.webp", alt: "" },
  { src: "/assets/cultural_images/128.webp", alt: "" },
  { src: "/assets/cultural_images/129.webp", alt: "" },
  { src: "/assets/cultural_images/130.webp", alt: "" },
  { src: "/assets/cultural_images/131.webp", alt: "" },
  { src: "/assets/cultural_images/132.webp", alt: "" },
  { src: "/assets/cultural_images/133.webp", alt: "" },
  { src: "/assets/cultural_images/134.webp", alt: "" },
  { src: "/assets/cultural_images/135.webp", alt: "" },
  { src: "/assets/cultural_images/136.webp", alt: "" },
  { src: "/assets/cultural_images/137.webp", alt: "" },
  { src: "/assets/cultural_images/138.webp", alt: "" },
  { src: "/assets/cultural_images/139.webp", alt: "" },
  { src: "/assets/cultural_images/140.webp", alt: "" },
  { src: "/assets/cultural_images/141.webp", alt: "" },
  { src: "/assets/cultural_images/142.webp", alt: "" },
  { src: "/assets/cultural_images/143.webp", alt: "" },
  { src: "/assets/cultural_images/144.webp", alt: "" },
  { src: "/assets/cultural_images/145.webp", alt: "" },
  { src: "/assets/cultural_images/146.webp", alt: "" },
  { src: "/assets/cultural_images/147.webp", alt: "" },
  { src: "/assets/cultural_images/148.webp", alt: "" },
  { src: "/assets/cultural_images/149.webp", alt: "" },
  { src: "/assets/cultural_images/150.webp", alt: "" },
  { src: "/assets/cultural_images/151.webp", alt: "" },
  { src: "/assets/cultural_images/152.webp", alt: "" },
  { src: "/assets/cultural_images/153.webp", alt: "" },
  { src: "/assets/cultural_images/154.webp", alt: "" },
  { src: "/assets/cultural_images/155.webp", alt: "" },
  { src: "/assets/cultural_images/156.webp", alt: "" },
  { src: "/assets/cultural_images/157.webp", alt: "" },
  { src: "/assets/cultural_images/158.webp", alt: "" },
  { src: "/assets/cultural_images/159.webp", alt: "" },
  { src: "/assets/cultural_images/160.webp", alt: "" },
  { src: "/assets/cultural_images/161.webp", alt: "" },
  { src: "/assets/cultural_images/162.webp", alt: "" },
  { src: "/assets/cultural_images/163.webp", alt: "" },
  { src: "/assets/cultural_images/164.webp", alt: "" },
  { src: "/assets/cultural_images/165.webp", alt: "" },
  { src: "/assets/cultural_images/166.webp", alt: "" },
  { src: "/assets/cultural_images/167.webp", alt: "" },
  { src: "/assets/cultural_images/168.webp", alt: "" },
  { src: "/assets/cultural_images/169.webp", alt: "" },
  { src: "/assets/cultural_images/170.webp", alt: "" },
  { src: "/assets/cultural_images/171.webp", alt: "" },
  { src: "/assets/cultural_images/172.webp", alt: "" },
  { src: "/assets/cultural_images/173.webp", alt: "" },
  { src: "/assets/cultural_images/174.webp", alt: "" },
  { src: "/assets/cultural_images/175.webp", alt: "" },
  { src: "/assets/cultural_images/176.webp", alt: "" },
  { src: "/assets/cultural_images/177.webp", alt: "" },
  { src: "/assets/cultural_images/178.webp", alt: "" },
  { src: "/assets/cultural_images/179.webp", alt: "" },
  { src: "/assets/cultural_images/180.webp", alt: "" },
  { src: "/assets/cultural_images/181.webp", alt: "" },
  { src: "/assets/cultural_images/182.webp", alt: "" },
  { src: "/assets/cultural_images/183.webp", alt: "" },
  { src: "/assets/cultural_images/184.webp", alt: "" },
  { src: "/assets/cultural_images/185.webp", alt: "" },
  { src: "/assets/cultural_images/186.webp", alt: "" },
  { src: "/assets/cultural_images/187.webp", alt: "" },
  { src: "/assets/cultural_images/188.webp", alt: "" },
  { src: "/assets/cultural_images/189.webp", alt: "" },
  { src: "/assets/cultural_images/190.webp", alt: "" },
];

const defaultImages: GalleryImage[] = useProductionAssets ? productionImages : devImages;

// Image Modal Component
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
  const [isModalImageLoaded, setIsModalImageLoaded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Reset loading state when modal opens with new image
      setIsModalImageLoaded(false);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, image?.src]);

  return (
    <AnimatePresence>
      {isOpen && image && (
        <motion.div
          className="kinetic-drag-gallery__modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="kinetic-drag-gallery__modal-backdrop"
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              backdropFilter: "blur(10px)",
            }}
            onClick={onClose}
          />
          {/* Loading spinner */}
          {!isModalImageLoaded && (
            <motion.div
              style={{
                position: "absolute",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2
                className="w-10 h-10 text-white animate-spin"
                style={{ animation: "spin 1s linear infinite" }}
              />
            </motion.div>
          )}
          <motion.img
            src={image.src}
            alt={image.alt}
            loading="eager"
            decoding="async"
            onLoad={() => setIsModalImageLoaded(true)}
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              opacity: isModalImageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
            animate={{ scale: 1, opacity: isModalImageLoaded ? 1 : 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateX: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          />
          <motion.div
            className="kinetic-drag-gallery__modal-info"
            style={{
              position: "absolute",
              bottom: "5%",
              left: "50%",
              transform: "translateX(-50%)",
              color: "white",
              textAlign: "center",
              opacity: isModalImageLoaded ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isModalImageLoaded ? 1 : 0, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.1 }}
          >
            <span style={{ fontSize: "1.25rem", fontWeight: 500 }}>{image.alt}</span>
          </motion.div>
          <motion.button
            className="kinetic-drag-gallery__modal-close"
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={onClose}
            onMouseEnter={() => setIsHoveringClickable(true)}
            onMouseLeave={() => setIsHoveringClickable(false)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function KineticDragGallery({
  images = defaultImages,
  scrollSpeed = 1,
  backgroundColor = "#000000",
  motionBlur = true,
  blurIntensity = 8,
  imageScale = 1,
  imageGap = 32,
  autoScroll = true,
  scrollAngle = 45,
  pauseOnHover = true,
  smallImagesOnMobile = false,
  imageFit = "cover",
}: KineticDragGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragDistance = useRef(0);
  const lastDragTime = useRef(0);
  const dragVelocity = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const touchIdentifier = useRef<number | null>(null);
  const { setIsHoveringClickable } = useCursor();

  const duplicatedImages = useMemo(() => {
    if (images.length === 0) return [];
    const minItems = 50;
    const repetitions = Math.ceil(minItems / images.length);
    return Array(repetitions).fill(images).flat() as GalleryImage[];
  }, [images]);

  const imageWidth = 400 * imageScale * (smallImagesOnMobile ? 0.6 : 1);
  const imageHeight = 300 * imageScale * (smallImagesOnMobile ? 0.6 : 1);
  const gridColumns = 5;
  const totalWidth = (imageWidth + imageGap) * gridColumns;
  const totalHeight =
    (imageHeight + imageGap) * Math.ceil(duplicatedImages.length / gridColumns);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const velocityX = useMotionValue(0);
  const velocityY = useMotionValue(0);
  const scale = useSpring(1, { stiffness: 300, damping: 30 });

  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1200,
    height: 600,
  });

  const handleImageClick = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    const unsubscribeX = x.on("change", (latest) => {
      setCurrentPos((prev) => ({ ...prev, x: latest }));
    });
    const unsubscribeY = y.on("change", (latest) => {
      setCurrentPos((prev) => ({ ...prev, y: latest }));
    });
    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [x, y]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDimensions = () => {
      if (containerRef.current) {
        startTransition(() => {
          setContainerDimensions({
            width: containerRef.current?.clientWidth || 1200,
            height: containerRef.current?.clientHeight || 600,
          });
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const blurAmount = useTransform(
    [velocityX, velocityY],
    ([vx, vy]: number[]) => {
      if (!motionBlur) return 0;
      const velocity = Math.sqrt(vx * vx + vy * vy);
      return Math.min(velocity * blurIntensity * 0.01, blurIntensity);
    }
  );

  const filterStyle = useTransform(blurAmount, (blur) => `blur(${blur}px)`);

  useAnimationFrame(() => {
    if (!autoScroll || (pauseOnHover && isHovered) || isDragging) return;

    const speed = scrollSpeed * 0.5;
    const radians = scrollAngle * (Math.PI / 180);
    const vx = Math.cos(radians) * speed;
    const vy = Math.sin(radians) * speed;

    const newX = x.get() - vx;
    const newY = y.get() - vy;

    x.set(newX);
    y.set(newY);
    velocityX.set(-vx * 10);
    velocityY.set(-vy * 10);
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragDistance.current = 0;
    lastDragTime.current = Date.now();
    dragVelocity.current = { x: 0, y: 0 };
    isDraggingRef.current = true;
    setIsDragging(true);
    scale.set(0.98);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const now = Date.now();
    const deltaTime = Math.max(now - lastDragTime.current, 1);
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    // Track total drag distance
    dragDistance.current += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const currentX = x.get();
    const currentY = y.get();

    x.set(currentX + deltaX);
    y.set(currentY + deltaY);

    const newVelX = (deltaX / deltaTime) * 16.67;
    const newVelY = (deltaY / deltaTime) * 16.67;

    dragVelocity.current = {
      x: dragVelocity.current.x * 0.7 + newVelX * 0.3,
      y: dragVelocity.current.y * 0.7 + newVelY * 0.3,
    };

    velocityX.set(dragVelocity.current.x * 10);
    velocityY.set(dragVelocity.current.y * 10);

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastDragTime.current = now;
  }, [x, y, velocityX, velocityY]);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    scale.set(1);

    const applyMomentum = () => {
      const friction = 0.95;
      const minVelocity = 0.1;

      dragVelocity.current.x *= friction;
      dragVelocity.current.y *= friction;

      x.set(x.get() + dragVelocity.current.x);
      y.set(y.get() + dragVelocity.current.y);

      velocityX.set(dragVelocity.current.x * 10);
      velocityY.set(dragVelocity.current.y * 10);

      if (
        Math.abs(dragVelocity.current.x) > minVelocity ||
        Math.abs(dragVelocity.current.y) > minVelocity
      ) {
        animationFrameId.current = requestAnimationFrame(applyMomentum);
      } else {
        animationFrameId.current = null;
      }
    };

    if (
      Math.abs(dragVelocity.current.x) > 0.1 ||
      Math.abs(dragVelocity.current.y) > 0.1
    ) {
      animationFrameId.current = requestAnimationFrame(applyMomentum);
    }
  }, [scale, x, y, velocityX, velocityY]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;

    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }

    const touch = e.touches[0];
    touchIdentifier.current = touch.identifier;
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    dragDistance.current = 0;
    lastDragTime.current = Date.now();
    dragVelocity.current = { x: 0, y: 0 };
    isDraggingRef.current = true;
    setIsDragging(true);
    scale.set(0.98);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || touchIdentifier.current === null) return;

    const touch = Array.from(e.touches).find(
      (t) => t.identifier === touchIdentifier.current
    );
    if (!touch) return;

    const now = Date.now();
    const deltaTime = Math.max(now - lastDragTime.current, 1);
    const deltaX = touch.clientX - dragStartPos.current.x;
    const deltaY = touch.clientY - dragStartPos.current.y;

    // Track total drag distance
    dragDistance.current += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const currentX = x.get();
    const currentY = y.get();

    x.set(currentX + deltaX);
    y.set(currentY + deltaY);

    const newVelX = (deltaX / deltaTime) * 16.67;
    const newVelY = (deltaY / deltaTime) * 16.67;

    dragVelocity.current = {
      x: dragVelocity.current.x * 0.7 + newVelX * 0.3,
      y: dragVelocity.current.y * 0.7 + newVelY * 0.3,
    };

    velocityX.set(dragVelocity.current.x * 10);
    velocityY.set(dragVelocity.current.y * 10);

    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
    lastDragTime.current = now;
  }, [x, y, velocityX, velocityY]);

  const handleTouchEnd = useCallback(() => {
    touchIdentifier.current = null;
    handleMouseUp();
  }, [handleMouseUp]);

  // Global mouse/touch event listeners for drag
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      x.set(x.get() - deltaX);
      y.set(y.get() - deltaY);
      velocityX.set(-deltaX * 10);
      velocityY.set(-deltaY * 10);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [x, y, velocityX, velocityY]);

  const renderImages = useCallback(() => {
    return duplicatedImages.map((item, index) => {
      if (!item.src) {
        return null;
      }
      return (
        <div
          key={index}
          className="kinetic-drag-gallery__image-wrapper"
          style={{
            position: "relative",
            width: imageWidth,
            height: imageHeight,
            flexShrink: 0,
            overflow: "hidden",
            pointerEvents: "auto",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onClick={(e) => {
            // Only open modal if we didn't drag significantly
            if (dragDistance.current < 5) {
              e.stopPropagation();
              handleImageClick(item);
            }
          }}
          onMouseEnter={() => setIsHoveringClickable(true)}
          onMouseLeave={() => setIsHoveringClickable(false)}
        >
          <OptimizedImage
            src={item.src}
            alt={item.alt || ""}
            imageFit={imageFit}
          />
          <div
            className="kinetic-drag-gallery__image-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
              opacity: 0,
              transition: "opacity 0.2s ease",
              display: "flex",
              alignItems: "flex-end",
              padding: "16px",
              pointerEvents: "none",
            }}
          >
            <span style={{ color: "white", fontWeight: 500, fontSize: "0.875rem" }}>
              {item.alt}
            </span>
          </div>
        </div>
      );
    });
  }, [duplicatedImages, imageWidth, imageHeight, imageFit, handleImageClick, setIsHoveringClickable]);

  const containerWidth = containerDimensions.width;
  const containerHeight = containerDimensions.height;
  // Reduced tile buffer from +3 to +2 for better performance (~40% fewer tiles)
  const tilesX = Math.ceil(containerWidth / totalWidth) + 2;
  const tilesY = Math.ceil(containerHeight / totalHeight) + 2;
  const startTileX = Math.floor(-currentPos.x / totalWidth) - 1;
  const startTileY = Math.floor(-currentPos.y / totalHeight) - 1;

  const tiles = [];
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileIndexX = startTileX + tx;
      const tileIndexY = startTileY + ty;
      tiles.push(
        <TileComponent
          key={`${tileIndexX}-${tileIndexY}`}
          x={x}
          y={y}
          tileIndexX={tileIndexX}
          tileIndexY={tileIndexY}
          totalWidth={totalWidth}
          totalHeight={totalHeight}
          gridColumns={gridColumns}
          imageWidth={imageWidth}
          imageGap={imageGap}
          filterStyle={filterStyle}
        >
          {renderImages()}
        </TileComponent>
      );
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className="kinetic-drag-gallery"
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          backgroundColor,
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
        }}
        onMouseEnter={() => startTransition(() => setIsHovered(true))}
        onMouseLeave={() => startTransition(() => setIsHovered(false))}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <motion.div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            scale,
          }}
        >
          {tiles}
        </motion.div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        image={selectedImage}
        onClose={handleCloseModal}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .kinetic-drag-gallery__image-wrapper:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          z-index: 10;
        }
        .kinetic-drag-gallery__image-wrapper:hover .kinetic-drag-gallery__image-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
