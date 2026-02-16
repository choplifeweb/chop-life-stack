import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useState } from "react"

import { EventsService } from "@/client"
import type { EventPublic, TicketPublic } from "@/client/types.gen"
import {
  EventDescription,
  // EventFooter,
  EventGallery,
  EventHeader,
  EventNavbar,
  LocationMap,
  StickyCTA,
  TicketModal,
} from "@/components/EventDetails"
import { Skeleton } from "@/components/ui/skeleton"
import { dummyEvents } from "@/data/dummyEvents"
import type { Event } from "@/types/event"
import "@/styles/custom.scss"

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
  return `${baseUrl}${path}`
}

function formatEventDateTime(
  startDatetime: string,
  endDatetime: string
): string {
  const start = new Date(startDatetime)
  const end = new Date(endDatetime)

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }

  const startDatePart = start.toLocaleDateString("en-US", dateOptions)
  const endDatePart = end.toLocaleDateString("en-US", dateOptions)
  const startTime = start.toLocaleTimeString("en-US", timeOptions)
  const endTime = end.toLocaleTimeString("en-US", timeOptions)

  // Get timezone abbreviation (PST or PDT depending on date)
  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(start)
    .find((part) => part.type === "timeZoneName")?.value || "PST"

  // Check if start and end are on the same day in PST
  const startDay = start.toLocaleDateString("en-US", { timeZone: timezone })
  const endDay = end.toLocaleDateString("en-US", { timeZone: timezone })
  const sameDay = startDay === endDay

  if (sameDay) {
    return `${startDatePart} at ${startTime} - ${endTime} (${tzAbbr})`
  }

  return `${startDatePart} at ${startTime} - ${endDatePart} at ${endTime} (${tzAbbr})`
}

function getLowestTicketPrice(tickets: TicketPublic[]): number {
  if (tickets.length === 0) return 0
  return Math.min(...tickets.map((t) => (t.price_amount || 0) / 100))
}

// Check if the event ID is a dummy event
function isDummyEventId(eventId: string): boolean {
  return eventId.startsWith("evt-")
}

// Get dummy event by ID
function getDummyEvent(eventId: string): Event | undefined {
  return dummyEvents.find((e) => e.id === eventId)
}

// Convert dummy Event to EventPublic-like format for consistency
function mapDummyEventToPublic(event: Event): EventPublic {
  const now = new Date().toISOString()
  return {
    id: event.id,
    title: event.name,
    short_summary: event.shortSummary ?? null,
    description: event.description ?? null,
    start_datetime: event.startDate.toISOString(),
    end_datetime: event.endDate.toISOString(),
    timezone: event.timezone ?? null,
    location: event.location ?? null,
    venue_name: event.venueName ?? null,
    flyer_url: event.flyerImageUrl ?? null,
    status: event.status,
    tickets: event.tickets.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? null,
      price_amount: t.price * 100,
      price_currency: "USD",
      gross_price: t.grossPrice ? t.grossPrice * 100 : null,
      display_price: t.displayPrice ? t.displayPrice * 100 : t.price * 100,
      quantity_total: t.quantity,
      quantity_sold: t.soldCount || 0,
      is_unlimited: t.isUnlimited || false,
      sale_start: t.saleStartDate?.toISOString() ?? null,
      sale_end: t.saleEndDate?.toISOString() ?? null,
      validity_start: t.validityStartDate?.toISOString() ?? null,
      validity_end: t.validityEndDate?.toISOString() ?? null,
      min_per_order: t.minPerOrder || 1,
      max_per_order: t.maxPerOrder || 10,
      sell_in_bundles: t.sellInBundles || false,
      event_id: event.id,
      created_at: now,
      updated_at: now,
    })),
    recurring_series: event.isRecurring,
    youtube_video_url: event.youtubeVideoUrl ?? null,
    spotify_song_url: event.spotifySongUrl ?? null,
    title_font: event.titleFont ?? null,
    accent_color: event.accentColor ?? null,
    show_on_explore: event.pageSettings.isPublic,
    password_protected: event.pageSettings.requirePassword,
    event_activity_social_feed: event.pageSettings.showActivityFeed,
    event_activity_updates_only: event.pageSettings.activityFeedMode === "updates",
    published_at: event.status === "published" ? event.createdAt.toISOString() : null,
    created_at: event.createdAt.toISOString(),
    updated_at: event.updatedAt.toISOString(),
    gallery_images: [],
  }
}

function getEventQueryOptions(eventId: string) {
  // For dummy events, return the dummy data directly
  if (isDummyEventId(eventId)) {
    const dummyEvent = getDummyEvent(eventId)
    if (dummyEvent) {
      return {
        queryFn: () => Promise.resolve(mapDummyEventToPublic(dummyEvent)),
        queryKey: ["event", eventId],
      }
    }
  }

  // For real events, fetch from API
  return {
    queryFn: () => EventsService.readEvent({ eventId }),
    queryKey: ["event", eventId],
  }
}

export const Route = createFileRoute("/events/$eventId")({
  component: EventDetailsPage,
  head: () => ({
    meta: [
      {
        title: "Event Details - Chop Life",
      },
    ],
  }),
})

function EventLoadingSkeleton() {
  return (
    <div className="event-details relative min-h-screen">
      <div className="event-details__blur-bg" />
      <div className="event-details__overlay" />
      <EventNavbar />
      <main className="relative z-10 max-w-[1100px] mx-auto px-4 pt-24 pb-32">
        <div className="lg:w-[58%] space-y-12">
          <div className="space-y-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}

function EventDetailsContent({ eventId }: { eventId: string }) {
  const { data: event } = useSuspenseQuery(getEventQueryOptions(eventId))
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)

  const flyerUrl = getFullImageUrl(event.flyer_url)
  const dateTimeString = formatEventDateTime(
    event.start_datetime,
    event.end_datetime
  )
  const lowestPrice = getLowestTicketPrice(event.tickets || [])

  return (
    <div className="event-details relative min-h-screen selection:bg-purple-500/30">
      {/* Blurred Background Layers */}
      <div
        className="event-details__blur-bg"
        style={flyerUrl ? { backgroundImage: `url(${flyerUrl})` } : undefined}
      />
      <div className="event-details__overlay" />

      <EventNavbar />

      {/* Fixed Right Sidebar - Dynamic sizing based on viewport */}
      <aside className="hidden lg:fixed lg:block lg:right-[4vw] xl:right-[6vw] 2xl:right-[calc((100vw-1100px)/2)] lg:top-28 lg:w-[22vw] xl:w-[20vw] 2xl:w-[min(400px,22vw)] z-10">
        <div className="rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 border border-white/10">
          {flyerUrl ? (
            <img
              src={flyerUrl}
              alt={event.title}
              className="w-full h-auto object-cover aspect-[3/4]"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No flyer</span>
            </div>
          )}
        </div>
        <div className="mt-4 2xl:mt-6 text-center space-y-1">
          <h3 className="text-sm xl:text-base 2xl:text-lg font-bold text-white line-clamp-2">{event.title}</h3>
          {event.short_summary && (
            <p className="text-xs xl:text-sm text-white/70 line-clamp-2">{event.short_summary}</p>
          )}
          <p className="text-xs xl:text-sm 2xl:text-base text-white/60">{dateTimeString}</p>
        </div>
      </aside>

      <main className="relative z-10 max-w-[1100px] mx-auto px-4 pt-24 pb-40">
        {/* Mobile Flyer Image - Only visible below lg */}
        <div className="lg:hidden mb-8">
          <div className="max-w-[240px] sm:max-w-[280px] md:max-w-[320px] mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {flyerUrl ? (
                <img
                  src={flyerUrl}
                  alt={event.title}
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No flyer</span>
                </div>
              )}
            </div>
            <div className="mt-4 text-center space-y-1">
              <h3 className="text-sm font-bold text-white line-clamp-2">{event.title}</h3>
              {event.short_summary && (
                <p className="text-xs text-white/70 line-clamp-2">{event.short_summary}</p>
              )}
              <p className="text-xs text-white/60">{dateTimeString}</p>
            </div>
          </div>
        </div>

        {/* Content Column - Width adjusts for fixed sidebar on lg+ */}
        <div className="lg:w-[calc(100%-26vw)] xl:w-[calc(100%-24vw)] 2xl:w-[58%] space-y-12">
          <EventHeader
            title={event.title}
            venueName={event.venue_name || ""}
            dateTime={dateTimeString}
            shortSummary={event.short_summary || ""}
            eventId={event.id}
          />
          <EventDescription description={event.description || ""} />
          <EventGallery
            images={event.gallery_images || []}
            getImageUrl={getFullImageUrl}
          />
          <LocationMap
            location={event.location || ""}
            venueName={event.venue_name || ""}
            latitude={event.latitude}
            longitude={event.longitude}
          />
          {/* <HostCard /> */}
        </div>
      </main>

      {/* <EventFooter /> */}
      <StickyCTA lowestPrice={lowestPrice} onClick={() => setIsTicketModalOpen(true)} />

      {/* Ticket Purchase Modal */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        event={event}
      />
    </div>
  )
}

function EventDetailsPage() {
  const { eventId } = Route.useParams()

  return (
    <Suspense fallback={<EventLoadingSkeleton />}>
      <EventDetailsContent eventId={eventId} />
    </Suspense>
  )
}
