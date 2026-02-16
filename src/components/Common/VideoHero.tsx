import { Link as RouterLink } from "@tanstack/react-router";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, Play, X } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { useCursor } from "../Animations";

// YouTube IFrame API type declarations
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }

  namespace YT {
    class Player {
      constructor(
        element: HTMLElement | string,
        options: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            rel?: number;
            mute?: number;
          };
          events?: {
            onStateChange?: (event: OnStateChangeEvent) => void;
            onReady?: (event: { target: Player }) => void;
          };
        },
      );
      destroy(): void;
    }

    interface OnStateChangeEvent {
      data: number;
      target: Player;
    }

    const PlayerState: {
      ENDED: 0;
      PLAYING: 1;
      PAUSED: 2;
      BUFFERING: 3;
      CUED: 5;
    };
  }
}

// Check if we should use production assets
const useProductionAssets =
  import.meta.env.VITE_USE_PRODUCTION_ASSETS === "true";

// Development video (local party video)
const DEV_VIDEO_SRC = "/assets/videos/party.mp4";

// YouTube video IDs for the modal popup
const PRODUCTION_YOUTUBE_ID = "upjTaFcgKQs";
const DEV_YOUTUBE_ID = "YE7VzlLtp-4";

interface VideoHeroProps {
  videoSrc: string;
  posterSrc?: string;
  titleLines: string[];
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  leftLabel?: string;
  rightLabel?: string;
  videoDuration?: string;
}

// Staggered text reveal with smooth easing
function AnimatedLine({
  text,
  delay,
  isLast,
}: {
  text: string;
  delay: number;
  isLast: boolean;
}) {
  return (
    <div className="overflow-hidden">
      <motion.span
        className="video-hero__title-line"
        initial={{ y: "110%", rotateX: -20 }}
        animate={{ y: 0, rotateX: 0 }}
        transition={{
          duration: 1,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {text}
        {isLast && (
          <motion.span
            className="video-hero__title-dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.8, duration: 0.3, ease: "backOut" }}
          />
        )}
      </motion.span>
    </div>
  );
}

// Side metadata label
function SideLabel({
  text,
  position,
}: {
  text: string;
  position: "left" | "right";
}) {
  const isLeft = position === "left";

  return (
    <motion.div
      className={`absolute top-1/2 ${isLeft ? "left-4 md:left-6" : "right-4 md:right-6"} z-10 hidden md:block`}
      initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <span
        className="text-white/70 text-xs font-medium tracking-[0.3em] uppercase"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: isLeft ? "rotate(180deg)" : "none",
        }}
      >
        {text}
      </span>
    </motion.div>
  );
}

// Draggable video preview thumbnail
function VideoPreview({
  videoSrc,
  duration,
  onClick,
}: {
  videoSrc: string;
  duration?: string;
  onClick: () => void;
}) {
  const { setIsHoveringClickable } = useCursor();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Set video to 10 seconds when loaded
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        video.currentTime = 10;
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      // If already loaded, set immediately
      if (video.readyState >= 1) {
        video.currentTime = 10;
      }
      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only trigger click if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <motion.div
      className="video-hero__preview cursor-grab active:cursor-grabbing"
      drag
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        // Small delay to prevent click after drag
        setTimeout(() => setIsDragging(false), 100);
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHoveringClickable(true)}
      onMouseLeave={() => setIsHoveringClickable(false)}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 2.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="video-hero__preview-thumbnail">
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-white/70 text-xs tracking-wider uppercase">
          Watch Video
        </span>
        {duration && <span className="text-white/50 text-xs">{duration}</span>}
      </div>
    </motion.div>
  );
}

// Video modal with YouTube embed
function VideoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const youtubeId = useProductionAssets
    ? PRODUCTION_YOUTUBE_ID
    : DEV_YOUTUBE_ID;
  const playerContainerId = "youtube-player-container";
  const playerInstanceRef = useRef<YT.Player | null>(null);
  const onCloseRef = useRef(onClose);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keep onClose ref updated
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Create player when modal opens and DOM is ready
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const createPlayer = () => {
      if (isCancelled) return;

      const container = document.getElementById(playerContainerId);
      if (!container) return;

      // Destroy existing player if any
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }

      playerInstanceRef.current = new window.YT.Player(playerContainerId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // YT.PlayerState.ENDED = 0
            if (event.data === 0) {
              onCloseRef.current();
            }
          },
        },
      });
    };

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        // Small delay to ensure DOM is rendered after AnimatePresence
        setTimeout(createPlayer, 100);
      } else {
        // Wait for API to load
        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          previousCallback?.();
          setTimeout(createPlayer, 100);
        };
      }
    };

    initPlayer();

    return () => {
      isCancelled = true;
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [isOpen, youtubeId]);

  // ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="video-modal fixed inset-0 flex items-center justify-center cursor-default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="video-modal__backdrop absolute inset-0 bg-black/90"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content Container */}
          <motion.div
            className="video-modal__content relative w-[80vw] max-h-[80vh] aspect-video mt-16"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close video"
              className="video-modal__close-btn"
            >
              <span className="video-modal__close-bracket">[</span>
              <X className="video-modal__close-icon" />
              <span className="video-modal__close-text">Close</span>
              <span className="video-modal__close-bracket">]</span>
            </button>

            {/* YouTube Player */}
            <div id={playerContainerId} className="w-full h-full rounded-lg" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function VideoHero({
  videoSrc,
  posterSrc,
  titleLines,
  subtitle,
  ctaText = "Enter Experience",
  ctaLink = "/experience-gallery",
  leftLabel = "",
  rightLabel = "/EXPERIENCE",
  videoDuration = "",
}: VideoHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  // Show modal only on first visit per session (resets when browser/tab closes)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(() => {
    // this is commented out as per client request
    // const hasSeenVideo = sessionStorage.getItem("choplife_video_seen");
    // if (!hasSeenVideo) {
    //   // Mark as seen immediately when modal opens for the first time
    //   sessionStorage.setItem("choplife_video_seen", "true");
    //   return true;
    // }
    // return false;
    return false;
  });
  const { setIsHoveringVideo, setIsHoveringClickable } = useCursor();

  // Close modal handler
  const handleModalClose = useCallback(() => {
    setIsVideoModalOpen(false);
  }, []);

  // Use dev video in development mode, production video otherwise
  const effectiveVideoSrc = useProductionAssets ? videoSrc : DEV_VIDEO_SRC;

  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const videoY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.8]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Handle click on video area to play
  const handleVideoAreaClick = useCallback((e: React.MouseEvent) => {
    // Check if click target is the video area (not CTA, navbar, or other interactive elements)
    const target = e.target as HTMLElement;
    const isInteractiveElement = target.closest(
      "a, button, nav, .video-hero__cta, .video-hero__preview, .site-header",
    );

    if (!isInteractiveElement) {
      setIsVideoModalOpen(true);
    }
  }, []);

  // Handle mouse enter/leave for video area cursor state
  const handleMouseEnterVideoArea = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest(
        "a, button, nav, .video-hero__cta, .video-hero__preview, .site-header",
      );

      if (!isInteractiveElement) {
        setIsHoveringVideo(true);
      }
    },
    [setIsHoveringVideo],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.closest(
        "a, button, nav, .video-hero__cta, .video-hero__preview, .site-header",
      );

      if (isInteractiveElement) {
        setIsHoveringVideo(false);
      } else {
        setIsHoveringVideo(true);
      }
    },
    [setIsHoveringVideo],
  );

  const handleMouseLeaveVideoArea = useCallback(() => {
    setIsHoveringVideo(false);
  }, [setIsHoveringVideo]);

  return (
    <>
      <section
        ref={containerRef}
        className="video-hero"
        onClick={handleVideoAreaClick}
        onMouseEnter={handleMouseEnterVideoArea}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveVideoArea}
      >
        {/* Background video with parallax */}
        <div className="video-hero__background">
          <motion.video
            className="video-hero__video"
            style={{ y: videoY }}
            autoPlay
            muted
            loop
            playsInline
            poster={posterSrc}
          >
            <source src={effectiveVideoSrc} type="video/mp4" />
          </motion.video>
          <motion.div
            className="video-hero__overlay"
            style={{ opacity: overlayOpacity }}
          />
        </div>

        {/* Side metadata labels */}
        <SideLabel text={leftLabel} position="left" />
        <SideLabel text={rightLabel} position="right" />

        {/* Floating video preview - hidden on small mobile, shown on sm+ */}
        <div className="absolute top-32 sm:top-40 right-4 sm:right-8 md:right-16 z-10 hidden sm:block">
          <VideoPreview
            videoSrc={effectiveVideoSrc}
            duration={videoDuration}
            onClick={() => setIsVideoModalOpen(true)}
          />
        </div>

        {/* Stylish horizontal line - full width */}
        <div className="video-hero__top-line-container">
          <motion.div
            className="video-hero__top-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Main content */}
        <motion.div
          className="video-hero__content"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <h1 className="video-hero__title">
            {titleLines.map((line, index) => (
              <AnimatedLine
                key={index}
                text={line}
                delay={0.5 + index * 0.2}
                isLast={index === titleLines.length - 1}
              />
            ))}
          </h1>

          {subtitle && (
            <motion.p
              className="video-hero__subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.2,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {ctaText && ctaLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.5,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              onMouseEnter={() => setIsHoveringClickable(true)}
              onMouseLeave={() => setIsHoveringClickable(false)}
            >
              <RouterLink to={ctaLink} className="video-hero__cta">
                <span className="video-hero__cta-text">{ctaText}</span>
                <span className="video-hero__cta-arrow">
                  <ArrowRight className="w-6 h-6 md:w-7 md:h-7" />
                </span>
                {/* Underline - animates on hover via CSS */}
                <span className="video-hero__cta-underline" />
              </RouterLink>
            </motion.div>
          )}
        </motion.div>

        {/* Footer tagline */}
        <motion.div
          className="video-hero__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between w-full px-4 sm:px-6 gap-1 sm:gap-0">
            <motion.span
              className="text-white/50 text-xs font-medium tracking-wider hidden sm:block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              {/* Chop Life */}
              {/* Use for dividing now removed the text as per client request */}
            </motion.span>
            <motion.span
              className="text-white/50 text-[10px] sm:text-xs font-medium tracking-[0.15em] sm:tracking-[0.2em] uppercase text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.3, duration: 0.5 }}
            >
              Chop life, make life no chop you.
            </motion.span>
            <motion.span
              className="text-white/50 text-xs font-medium tracking-wider hidden sm:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 2.2, duration: 0.5 }}
            >
              {/* 01-25 */}
              {/* Commented out as per client request */}
            </motion.span>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        {/* <motion.div
          className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="w-1 h-2 bg-white/60 rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div> */}
      </section>

      {/* Video modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={handleModalClose} />
    </>
  );
}
