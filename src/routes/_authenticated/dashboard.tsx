import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Bookmark,
  CalendarDays,
  DollarSign,
  Ticket,
  Users,
} from "lucide-react"
import { useState } from "react"
import axios from "axios"

import { UsersService } from "@/client"
import type { EventPublic, TicketPublic } from "@/client/types.gen"
import { EventsGrid } from "@/components/Events"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import useAuth from "@/hooks/useAuth"
import type { Event, TicketType } from "@/types/event"

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

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
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

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - Chop Life",
      },
    ],
  }),
})

const BOOKMARKS_PER_PAGE = 8

interface TicketSalesStats {
  total_sales: number
  total_revenue: number
  registered_user_sales: number
  guest_sales: number
  pending_sales: number
  tickets_sold: number
}

interface TicketSalesResponse {
  stats: TicketSalesStats
}

function TicketSalesStatsSection() {
  const { data, isLoading } = useQuery<TicketSalesResponse>({
    queryKey: ["ticket-sales-stats"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const response = await axios.get<TicketSalesResponse>(
        `${baseUrl}/api/v1/ticket-sales`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    },
  })

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const stats = data?.stats

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Ticket Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Ticket Sales
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/ticket-sales">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats?.total_revenue || 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats?.tickets_sold || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Tickets Sold</p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats?.total_sales || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Sales</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookmarkedEventsSection() {
  const [currentPage, setCurrentPage] = useState(1)
  const skip = (currentPage - 1) * BOOKMARKS_PER_PAGE

  const { data, isLoading } = useQuery({
    queryKey: ["user-bookmarks", { skip, limit: BOOKMARKS_PER_PAGE }],
    queryFn: () => UsersService.readUserBookmarks({ skip, limit: BOOKMARKS_PER_PAGE }),
  })

  const bookmarkedEvents: Event[] = (data?.data || []).map(mapEventPublicToEvent)
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / BOOKMARKS_PER_PAGE)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Bookmarked Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Bookmarked Events ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <CalendarDays className="h-12 w-12 mb-4 opacity-50" />
            <p>No bookmarked events yet</p>
            <p className="text-sm">Bookmark events you're interested in to see them here</p>
          </div>
        ) : (
          <>
            <EventsGrid events={bookmarkedEvents} variant="public" />
            {totalPages > 1 && (
              <Pagination className="pt-6">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Dashboard() {
  const { user: currentUser } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold truncate max-w-sm">
          Hi, {currentUser?.full_name || currentUser?.email}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, nice to see you again!
        </p>
      </div>

      {/* Ticket Sales Stats - Admin Only */}
      {currentUser?.is_superuser && <TicketSalesStatsSection />}

      {/* Bookmarked Events Section */}
      <BookmarkedEventsSection />
    </div>
  )
}
