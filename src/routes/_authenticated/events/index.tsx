import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense, useState } from "react"

import { EventsService } from "@/client"
import type { EventPublic, EventStatus, TicketPublic } from "@/client/types.gen"
import { AddEvent, EventsGrid } from "@/components/Events"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Event, TicketType } from "@/types/event"

const ITEMS_PER_PAGE = 8

function mapTicketPublicToTicketType(ticket: TicketPublic): TicketType {
  return {
    id: ticket.id,
    name: ticket.name,
    price: (ticket.price_amount || 0) / 100, // Convert cents to dollars
    quantity: ticket.quantity_total,
    description: ticket.description || undefined,
    soldCount: ticket.quantity_sold,
  }
}

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  // Prepend backend URL for relative paths
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
  return `${baseUrl}${path}`
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
    guestlist: [], // No guest data from API yet
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
    createdBy: "", // No owner data in EventPublic yet
  }
}

function getMyEventsQueryOptions(skip: number, limit: number, status?: EventStatus) {
  return {
    queryFn: () => EventsService.readMyEvents({ skip, limit, status }),
    queryKey: ["my-events", { skip, limit, status }],
  }
}

function getEventStatsQueryOptions() {
  return {
    queryFn: () => EventsService.getMyEventsStats(),
    queryKey: ["my-events-stats"],
    staleTime: 30000, // Cache stats for 30 seconds
  }
}

export const Route = createFileRoute("/_authenticated/events/")({
  component: Events,
  head: () => ({
    meta: [
      {
        title: "Events Management - Chop Life",
      },
    ],
  }),
})

function EventsLoadingSkeleton() {
  return (
    <div className="events-admin__grid">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  // Generate page numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push("ellipsis")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis")
      }
      pages.push(totalPages)
    }
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className="pt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {getPageNumbers().map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

interface EventsTabContentProps {
  status?: EventStatus
  currentPage: number
  onPageChange: (page: number) => void
}

function EventsTabContent({ status, currentPage, onPageChange }: EventsTabContentProps) {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const { data, isLoading } = useQuery(getMyEventsQueryOptions(skip, ITEMS_PER_PAGE, status))

  if (isLoading) {
    return <EventsLoadingSkeleton />
  }

  const events: Event[] = (data?.data || []).map(mapEventPublicToEvent)
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (events.length === 0) {
    return <EventsGrid events={[]} variant="admin" />
  }

  return (
    <div className="space-y-6">
      <EventsGrid events={events} variant="admin" />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}

type TabValue = "all" | "published" | "draft" | "cancelled" | "completed"

function EventsContent() {
  const { data: stats } = useSuspenseQuery(getEventStatsQueryOptions())
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [pageByTab, setPageByTab] = useState<Record<TabValue, number>>({
    all: 1,
    published: 1,
    draft: 1,
    cancelled: 1,
    completed: 1,
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue)
  }

  const handlePageChange = (tab: TabValue, page: number) => {
    setPageByTab((prev) => ({ ...prev, [tab]: page }))
  }

  const getStatusForTab = (tab: TabValue): EventStatus | undefined => {
    if (tab === "all") return undefined
    return tab as EventStatus
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="events-admin__tabs">
      <TabsList>
        <TabsTrigger value="all">All Events ({stats.total})</TabsTrigger>
        <TabsTrigger value="published">
          Published ({stats.published})
        </TabsTrigger>
        <TabsTrigger value="draft">
          Drafts ({stats.draft})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          Cancelled ({stats.cancelled})
        </TabsTrigger>
        <TabsTrigger value="completed">
          Completed ({stats.completed})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <EventsTabContent
          status={getStatusForTab("all")}
          currentPage={pageByTab.all}
          onPageChange={(page) => handlePageChange("all", page)}
        />
      </TabsContent>

      <TabsContent value="published" className="mt-6">
        <EventsTabContent
          status={getStatusForTab("published")}
          currentPage={pageByTab.published}
          onPageChange={(page) => handlePageChange("published", page)}
        />
      </TabsContent>

      <TabsContent value="draft" className="mt-6">
        <EventsTabContent
          status={getStatusForTab("draft")}
          currentPage={pageByTab.draft}
          onPageChange={(page) => handlePageChange("draft", page)}
        />
      </TabsContent>

      <TabsContent value="cancelled" className="mt-6">
        <EventsTabContent
          status={getStatusForTab("cancelled")}
          currentPage={pageByTab.cancelled}
          onPageChange={(page) => handlePageChange("cancelled", page)}
        />
      </TabsContent>

      <TabsContent value="completed" className="mt-6">
        <EventsTabContent
          status={getStatusForTab("completed")}
          currentPage={pageByTab.completed}
          onPageChange={(page) => handlePageChange("completed", page)}
        />
      </TabsContent>
    </Tabs>
  )
}

function Events() {
  return (
    <div className="events-admin">
      <div className="events-admin__header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Management</h1>
          <p className="text-muted-foreground">
            Create and manage your events and ticket sales
          </p>
        </div>
        <AddEvent />
      </div>

      <Suspense fallback={<EventsLoadingSkeleton />}>
        <EventsContent />
      </Suspense>
    </div>
  )
}
