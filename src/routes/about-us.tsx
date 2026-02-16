import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";

import { CursorProvider } from "@/components/Animations";
import { PublicLayout } from "@/components/Common/PublicLayout";

// Check if we should use production assets
const useProductionAssets =
  import.meta.env.VITE_USE_PRODUCTION_ASSETS === "true";

// Background images for different environments
const PRODUCTION_BG = "/assets/cultural_images/42.webp";
const DEV_BG = "/assets/images/bg.jpg"; // Placeholder for development

// Hook to play a subtle hover sound on desktop
function useHoverSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    // Only play on desktop (non-touch devices)
    if (window.matchMedia("(hover: none)").matches) return;

    try {
      // Create or reuse Audio element
      if (!audioRef.current) {
        audioRef.current = new Audio("/assets/audio/click.mp3");
        audioRef.current.volume = 0.3;
      }

      // Reset and play
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch {
      // Silently fail if audio isn't available
    }
  }, []);

  return playSound;
}

export const Route = createFileRoute("/about-us")({
  component: AboutUs,
  head: () => ({
    meta: [
      {
        title: "About Us - Chop Life Global",
        description:
          "Curating social experiences designed to uplift and unify the African diaspora. Los Angeles and worldwide.",
      },
    ],
  }),
});

interface BrandStatement {
  text: string;
  detail: string;
  highlight?: boolean;
}

const brandStatements: BrandStatement[] = [
  // {
  //   text: "A family reunion disguised as a party",
  //   detail:
  //     "Every Chop Life event brings together community, culture, and celebration in one unforgettable experience.",
  //   highlight: true,
  // },
  {
    text: "Where the African diaspora connects",
    detail:
      "We create spaces for the global African community to meet, network, and build lasting relationships.",
  },
  // {
  //   text: "Music. Culture. Vibes.",
  //   detail:
  //     "Afrobeat, Reggae, Jazz, and Fusion — our soundscapes celebrate the richness of African musical heritage.",
  //   highlight: true,
  // },
  {
    text: "Los Angeles to the world",
    detail:
      "Born in Los Angeles, inspired by the African diaspora, and positioned for global impact—Chop Life Global curates cultural experiences that resonate far beyond city limits.",
  },
  {
    text: "Curating unforgettable experiences",
    detail:
      "We design elevated, sophisticated social experiences that create lasting memories and meaningful connection.",
    highlight: true,
  },
  {
    text: "Where everybody is somebody",
    detail:
      "Every guest is welcomed, valued, and seen. Our experiences are intentionally curated to foster genuine connection.",
  },
  {
    text: "Celebrating African heritage",
    detail:
      "Honoring the richness, diversity, and global influence of African culture through music, cuisine, fashion, and intentional gathering.",
    highlight: true,
  },
  // {
  //   text: "Real music. Real people. Real vibes.",
  //   detail:
  //     "No pretense, no performance — just genuine community coming together to celebrate life.",
  // },
  {
    text: "More than a party — it's a movement",
    detail:
      "Chop Life Global is building a worldwide network of cultural connection and community empowerment.",
    highlight: true,
  },
];

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/choplife.global",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/choplife.global",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@choplife.global",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
];

function AboutUs() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const playHoverSound = useHoverSound();

  const handleStatementInteraction = (index: number) => {
    // Toggle on tap for mobile, or set on hover for desktop
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleHoverStart = (index: number) => {
    setActiveIndex(index);
    playHoverSound();
  };

  const activeStatement =
    activeIndex !== null ? brandStatements[activeIndex] : null;

  // Select background based on environment
  const backgroundImage = useProductionAssets ? PRODUCTION_BG : DEV_BG;

  return (
    <CursorProvider>
      <PublicLayout>
        <div
          className="about-page"
          style={
            {
              "--about-bg-image": `url('${backgroundImage}')`,
            } as React.CSSProperties
          }
        >
          {/* Brand Statements Section */}
          <section className="about-statements">
            <div className="about-statements__container">
              {brandStatements.map((statement, index) => (
                <motion.div
                  key={index}
                  className={`about-statements__line ${statement.highlight ? "about-statements__line--highlight" : ""} ${activeIndex === index ? "about-statements__line--active" : ""}`}
                  initial={{ opacity: 0.4 }}
                  whileHover={{ opacity: 1, x: 20 }}
                  animate={{ opacity: activeIndex === index ? 1 : 0.4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  onHoverStart={() => handleHoverStart(index)}
                  onHoverEnd={() => setActiveIndex(null)}
                  onTap={() => handleStatementInteraction(index)}
                >
                  <span className="about-statements__text">
                    {statement.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Floating Detail Panel with Fog Effect */}
          <div className="about-detail">
            <AnimatePresence mode="wait">
              {activeStatement ? (
                <motion.div
                  key={activeStatement.text}
                  className="about-detail__content"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <p className="about-detail__text">{activeStatement.detail}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  className="about-detail__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="about-detail__hint">
                    Hover or tap to learn more
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Social Connect Section */}
          <section className="about-social">
            <div className="about-social__container">
              <motion.div
                className="about-social__content"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="about-social__heading">Connect With Us</h2>

                <div className="about-social__links">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="about-social__link"
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="about-social__icon">{social.icon}</span>
                      <span className="about-social__name">{social.name}</span>
                    </motion.a>
                  ))}
                </div>

                <div className="about-social__hashtags">
                  <span className="about-social__hashtag">#ChopLifeGlobal</span>
                  <span className="about-social__hashtag">#ChopLife</span>
                  <span className="about-social__hashtag">#LANightlife</span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </PublicLayout>
    </CursorProvider>
  );
}
