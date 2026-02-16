import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface PreloadAnimationProps {
  /** Background color during preload */
  backgroundColor?: string;
  /** Duration of logo fill animation in seconds */
  fillDuration?: number;
  /** Duration of scroll-up reveal transition in seconds */
  revealDuration?: number;
  /** Delay before animation starts in seconds */
  initialDelay?: number;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Children to reveal after animation */
  children: React.ReactNode;
}

export function PreloadAnimation({
  backgroundColor = "#000000",
  fillDuration = 1.5,
  revealDuration = 0.8,
  initialDelay = 0.3,
  onAnimationComplete,
  children,
}: PreloadAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<
    "preload" | "reveal" | "complete"
  >("preload");

  // Progress value for the fill animation (100 -> 0, revealing logo from bottom to top)
  const progress = useMotionValue(100);

  // Transform progress to clip-path for bottom-to-top reveal effect
  const clipPath = useTransform(progress, (value) => `inset(${value}% 0 0 0)`);

  // Progress bar width transform
  const progressBarWidth = useTransform(progress, (p) => `${100 - p}%`);

  // Logo scale animation for subtle emphasis
  const logoScale = useMotionValue(0.95);

  // Start the animation sequence
  useEffect(() => {
    const runAnimation = async () => {
      // Wait for initial delay
      await new Promise((resolve) => setTimeout(resolve, initialDelay * 1000));

      // Animate the fill (progress goes from 100 to 0)
      await animate(progress, 0, {
        duration: fillDuration,
        ease: [0.65, 0, 0.35, 1], // Custom cubic-bezier for smooth fill
      });

      // Small pause after fill completes
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Scale up the logo slightly before reveal
      await animate(logoScale, 1.05, {
        duration: 0.3,
        ease: "easeOut",
      });

      // Start reveal phase
      setAnimationPhase("reveal");
    };

    runAnimation();
  }, [progress, logoScale, fillDuration, initialDelay]);

  // Handle reveal animation completion
  const handleRevealComplete = useCallback(() => {
    setAnimationPhase("complete");
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  // Show only children when animation is complete
  const isComplete = animationPhase === "complete";

  // Logo container styles
  const logoContainerStyles: React.CSSProperties = {
    width: "clamp(250px, 35vw, 500px)",
    height: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "5%",
  };

  return (
    <div className="preload-animation">
      {/* Preload overlay with text - hidden when complete */}
      {!isComplete && (
        <motion.div
          className="preload-animation__overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          initial={{ y: 0 }}
          animate={
            animationPhase === "reveal"
              ? { y: "-100%" }
              : { y: 0 }
          }
          transition={{
            duration: revealDuration,
            ease: [0.76, 0, 0.24, 1], // Smooth ease-out for reveal
          }}
          onAnimationComplete={() => {
            if (animationPhase === "reveal") {
              handleRevealComplete();
            }
          }}
        >
          {/* Logo container */}
          <motion.div
            className="preload-animation__logo-container"
            style={{
              position: "relative",
              scale: logoScale,
              ...logoContainerStyles,
            }}
          >
            {/* Background logo (dimmed) */}
            <img
              src="/assets/images/chop_life_logo_white.svg"
              alt="Chop Life"
              className="preload-animation__logo-bg"
              style={{
                width: "100%",
                height: "auto",
                opacity: 0.15,
                display: "block",
              }}
            />

            {/* Foreground logo with fill animation (clip-path reveal from bottom to top) */}
            <motion.img
              src="/assets/images/chop_life_logo_white.svg"
              alt="Chop Life"
              className="preload-animation__logo-fill"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "auto",
                clipPath,
                display: "block",
              }}
            />
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            className="preload-animation__progress-bar"
            style={{
              position: "absolute",
              bottom: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "120px",
              height: "2px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                backgroundColor: "#FAF7F7",
                width: progressBarWidth,
              }}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Content underneath (will be revealed) */}
      <div
        className="preload-animation__content"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}
