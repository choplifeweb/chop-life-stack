import { createFileRoute } from "@tanstack/react-router"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

// Redirect to Posh.vip for calendar events (management decision)
const POSH_EVENTS_URL = "https://posh.vip/g/choplife"

export const Route = createFileRoute("/calendar-events")({
  component: CalendarEvents,
  head: () => ({
    meta: [
      {
        title: "Calendar Events - Chop Life",
      },
    ],
  }),
})

function CalendarEvents() {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Open in new tab immediately
    // window.open(POSH_EVENTS_URL, "_blank")

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirect current tab after countdown
          // window.location.href = POSH_EVENTS_URL
          window.open(POSH_EVENTS_URL, "_blank")
          window.location.href = "/"
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="calendar-events-redirect">
      <div className="calendar-events-redirect__container">
        {/* Main Content */}
        <motion.div
          className="calendar-events-redirect__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Calendar Flip Animation */}
          <div className="calendar-flip">
            <div className="calendar-flip__binding">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="calendar-flip__ring" />
              ))}
            </div>
            <div className="calendar-flip__card">
              <div className="calendar-flip__header">EVENTS</div>
              <div className="calendar-flip__body">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={countdown}
                    className="calendar-flip__page"
                    initial={{ rotateX: -90 }}
                    animate={{
                      rotateX: 0,
                      transition: {
                        duration: 0.35,
                        ease: [0, 0.55, 0.45, 1],
                      },
                    }}
                    exit={{
                      rotateX: 90,
                      transition: {
                        duration: 0.25,
                        ease: [0.55, 0, 1, 0.45],
                      },
                    }}
                  >
                    <span className="calendar-flip__number">{countdown}</span>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="calendar-flip__footer">CHOP LIFE</div>
            </div>
          </div>

          {/* Text Content */}
          <motion.h1
            className="calendar-events-redirect__title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Loading Events
          </motion.h1>

          <motion.p
            className="calendar-events-redirect__description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Redirecting to <strong>Posh.vip</strong>
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            className="calendar-events-redirect__progress-bar"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 3, ease: "linear" }}
          />

          {/* Manual Link */}
          <motion.a
            href={POSH_EVENTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="calendar-events-redirect__link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open Events <ExternalLink size={14} />
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
}

/*
DO NOT REMOVE THIS CONTENT
// COMMENTED OUT - Original calendar events implementation (redirecting to Posh.vip per management) 
import { useInfiniteQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { useRef } from "react"

import { EventsService } from "@/client"
import type { EventPublic, TicketPublic } from "@/client/types.gen"
import { PublicLayout } from "@/components/Common/PublicLayout"
import { EventsGrid } from "@/components/Events"
import { Skeleton } from "@/components/ui/skeleton"
import { dummyEvents } from "@/data/dummyEvents"
import type { Event, TicketType } from "@/types/event"

const EVENTS_PER_PAGE = 20

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/choplife.global",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/choplife.global",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@choplife.global",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
      </svg>
    ),
  },
]

function EventCardSkeleton() {
  return (
    <div className="event-card-skeleton">
      <Skeleton className="event-card-skeleton__image" />
      <div className="event-card-skeleton__content">
        <Skeleton className="event-card-skeleton__title" />
        <Skeleton className="event-card-skeleton__summary" />
        <div className="event-card-skeleton__meta">
          <Skeleton className="event-card-skeleton__meta-item" />
          <Skeleton className="event-card-skeleton__meta-item" />
          <Skeleton className="event-card-skeleton__meta-item" />
        </div>
        <div className="event-card-skeleton__footer">
          <div className="event-card-skeleton__avatars">
            <Skeleton className="event-card-skeleton__avatar" />
            <Skeleton className="event-card-skeleton__avatar" />
            <Skeleton className="event-card-skeleton__avatar" />
          </div>
        </div>
      </div>
    </div>
  )
}

function EventsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="calendar-events__grid">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  )
}

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
  return `${baseUrl}${path}`
}

function mapTicketPublicToTicketType(ticket: TicketPublic): TicketType {
  return {
    id: ticket.id,
    name: ticket.name,
    price: (ticket.price_amount || 0) / 100,
    quantity: ticket.quantity_total,
    description: ticket.description || undefined,
    soldCount: ticket.quantity_sold,
  }
}

function mapEventPublicToEvent(event: EventPublic): Event {
  return {
    id: event.id,
    name: event.title,
    shortSummary: event.short_summary || undefined,
    description: event.description || "",
    startDate: new Date(event.start_datetime),
    endDate: new Date(event.end_datetime),
    timezone: event.timezone || "UTC",
    isRecurring: event.recurring_series || false,
    recurringPattern: event.recurring_series ? "Recurring" : undefined,
    location: event.location || "",
    venueName: event.venue_name || "",
    tickets: (event.tickets || []).map(mapTicketPublicToTicketType),
    guestlist: [],
    flyerImageUrl: getFullImageUrl(event.flyer_url),
    galleryImages: [],
    youtubeVideoUrl: event.youtube_video_url || undefined,
    spotifySongUrl: event.spotify_song_url || undefined,
    titleFont: event.title_font || "Inter",
    accentColor: event.accent_color || "#FF6B00",
    pageSettings: {
      isPublic: event.show_on_explore || true,
      requirePassword: event.password_protected || false,
      showActivityFeed: event.event_activity_social_feed || false,
      activityFeedMode: event.event_activity_updates_only ? "updates" : "social",
    },
    status: event.status,
    createdAt: new Date(event.created_at),
    updatedAt: new Date(event.updated_at),
    createdBy: "",
  }
}

function CalendarEventsOriginal() {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Fetch published events from API with infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["public-events"],
    queryFn: ({ pageParam = 0 }) =>
      EventsService.readEvents({ skip: pageParam, limit: EVENTS_PER_PAGE }),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.data.length, 0)
      // If we loaded fewer than requested or total loaded equals count, no more pages
      if (lastPage.data.length < EVENTS_PER_PAGE || totalLoaded >= lastPage.count) {
        return undefined
      }
      return totalLoaded // Next skip value
    },
    initialPageParam: 0,
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Filter only published dummy events for public display
  const publicDummyEvents = dummyEvents.filter((e) => e.status === "published")

  // Map API events to frontend Event type (flatten all pages)
  const publicApiEvents = (data?.pages || [])
    .flatMap((page) => page.data)
    .map(mapEventPublicToEvent)

  // Combine dummy events with real API events
  const allEvents = [...publicDummyEvents, ...publicApiEvents]

  return (
    <PublicLayout headerBlur>
      <div className="calendar-events">
        <div className="calendar-events__header">
          <h1 className="calendar-events__title mt-13">Upcoming Events</h1>
          <p className="calendar-events__description">
            Check out our upcoming events and mark your calendar for the ones
            you don't want to miss.
          </p>
        </div>

        {isLoading ? (
          <EventsGridSkeleton count={8} />
        ) : (
          <>
            <EventsGrid events={allEvents} variant="public" />

            {/* Load more trigger *}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading more events...</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Social Connect Section *}
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
  )
}
*/
