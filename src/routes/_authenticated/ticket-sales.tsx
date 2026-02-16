import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import {
  BarChart3,
  DollarSign,
  Filter,
  Loader2,
  Search,
  Ticket,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

const ITEMS_PER_PAGE = 10

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TicketSaleItem {
  ticket_id: string
  ticket_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface TicketSaleRecord {
  payment_id: string
  event_id: string
  event_title: string
  customer_type: "guest" | "registered"
  customer_email: string
  customer_name: string | null
  customer_phone: string | null
  ticket_items: TicketSaleItem[]
  total_amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "expired"
  created_at: string
  paid_at: string | null
}

interface TicketSalesStats {
  total_sales: number
  total_revenue: number
  registered_user_sales: number
  guest_sales: number
  pending_sales: number
  tickets_sold: number
}

interface TicketSalesResponse {
  data: TicketSaleRecord[]
  count: number
  stats: TicketSalesStats
}

// Events dropdown types
interface EventDropdownItem {
  id: string
  title: string
}

interface EventDropdownResponse {
  data: EventDropdownItem[]
  count: number
  has_more: boolean
}

export const Route = createFileRoute("/_authenticated/ticket-sales")({
  component: TicketSales,
  head: () => ({
    meta: [
      {
        title: "Ticket Sales - Admin",
      },
    ],
  }),
})

const EVENTS_PER_PAGE = 5

function TicketSales() {
  const [selectedEvent, setSelectedEvent] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Event dropdown search and pagination (server-side windowed)
  const [eventSearchQuery, setEventSearchQuery] = useState("")
  const [debouncedEventSearch, setDebouncedEventSearch] = useState("")
  const [eventsSkip, setEventsSkip] = useState(0)

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to page 1 on search
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Debounce event dropdown search (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEventSearch(eventSearchQuery)
      setEventsSkip(0) // Reset pagination on search
    }, 300)
    return () => clearTimeout(timer)
  }, [eventSearchQuery])

  // Server-side pagination
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch ticket sales data
  const { data, isLoading, error } = useQuery<TicketSalesResponse>({
    queryKey: ["ticket-sales", selectedEvent, statusFilter, debouncedSearch, currentPage],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

      const params = new URLSearchParams()
      if (selectedEvent && selectedEvent !== "all") {
        params.append("event_id", selectedEvent)
      }
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      // Server-side search
      if (debouncedSearch) {
        params.append("search", debouncedSearch)
      }
      // Server-side pagination
      params.append("skip", skip.toString())
      params.append("limit", ITEMS_PER_PAGE.toString())

      const response = await axios.get<TicketSalesResponse>(
        `${baseUrl}/api/v1/ticket-sales?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    },
  })

  // Fetch events for dropdown (server-side windowed pagination)
  const { data: eventsData } = useQuery<EventDropdownResponse>({
    queryKey: ["events-dropdown", debouncedEventSearch, eventsSkip],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

      const params = new URLSearchParams()
      if (debouncedEventSearch) {
        params.append("search", debouncedEventSearch)
      }
      params.append("skip", eventsSkip.toString())
      params.append("limit", EVENTS_PER_PAGE.toString()) // Always 5

      const response = await axios.get<EventDropdownResponse>(
        `${baseUrl}/api/v1/events/dropdown?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    },
    staleTime: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  // Events for dropdown
  const visibleEvents = eventsData?.data || []
  const hasMoreEvents = eventsData?.has_more || false
  const hasPreviousEvents = eventsSkip > 0
  const totalEventsCount = eventsData?.count || 0

  // Reset pagination when search changes
  const handleEventSearchChange = (value: string) => {
    setEventSearchQuery(value)
  }

  // Load next page (click down button)
  const loadNextPage = () => {
    if (hasMoreEvents) {
      setEventsSkip((prev) => prev + EVENTS_PER_PAGE)
    }
  }

  // Load previous page (click up button)
  const loadPreviousPage = () => {
    if (hasPreviousEvents) {
      setEventsSkip((prev) => Math.max(0, prev - EVENTS_PER_PAGE))
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Failed</Badge>
      case "expired":
        return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Server-side search - data is already filtered by the API
  const salesData = data?.data || []

  // Server-side pagination - use count from server
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const startIndex = skip

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  // Search input handler (page reset is handled by debounce useEffect)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-destructive">Failed to load ticket sales data</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    )
  }

  const stats = data?.stats

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ticket Sales</h1>
        <p className="text-muted-foreground">
          View and manage all ticket sales across events
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.total_revenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats?.total_sales || 0} completed sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tickets_sold || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total tickets purchased
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sales || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or event..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            {/* Event Filter */}
            <Select value={selectedEvent} onValueChange={handleFilterChange(setSelectedEvent)}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent className="max-h-[350px]">
                {/* Fixed header: Search + All Events */}
                <div className="sticky top-0 bg-popover z-10 border-b">
                  <div className="px-2 py-2">
                    <Input
                      placeholder="Search events..."
                      value={eventSearchQuery}
                      onChange={(e) => handleEventSearchChange(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      className="h-8"
                    />
                  </div>
                  <SelectItem value="all">All Events</SelectItem>
                </div>

                {/* Previous page button */}
                {hasPreviousEvents && (
                  <div
                    className="px-2 py-1.5 text-xs text-primary text-center cursor-pointer hover:bg-accent flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      loadPreviousPage()
                    }}
                  >
                    <span>▲</span> Previous 5
                  </div>
                )}

                {/* Event items */}
                {visibleEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}

                {/* Next page button */}
                {hasMoreEvents && (
                  <div
                    className="px-2 py-1.5 text-xs text-primary text-center cursor-pointer hover:bg-accent flex items-center justify-center gap-1"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      loadNextPage()
                    }}
                  >
                    <span>▼</span> Next 5 ({totalEventsCount - eventsSkip - visibleEvents.length} remaining)
                  </div>
                )}

                {/* No results message */}
                {visibleEvents.length === 0 && eventSearchQuery && (
                  <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                    No events found
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sales Records ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {salesData.length > 0 ? (
            <div className="space-y-4">
              {/* Mobile card view */}
              <div className="md:hidden space-y-3">
                {salesData.map((sale) => (
                  <div key={sale.payment_id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sale.customer_name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{sale.customer_email}</p>
                      </div>
                      {getStatusBadge(sale.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{sale.event_title}</p>
                    <div className="flex flex-wrap gap-1">
                      {sale.ticket_items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item.quantity}x {item.ticket_name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{formatCurrency(sale.total_amount)}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(sale.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.map((sale) => (
                    <TableRow key={sale.payment_id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {sale.customer_name || "—"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {sale.customer_email}
                          </span>
                          {sale.customer_phone && (
                            <span className="text-xs text-muted-foreground">
                              {sale.customer_phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{sale.event_title}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {sale.ticket_items.map((item, idx) => (
                            <span key={idx} className="text-sm">
                              {item.quantity}x {item.ticket_name}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {formatDate(sale.created_at)}
                          </span>
                          {sale.paid_at && (
                            <span className="text-xs text-green-500">
                              Paid: {formatDate(sale.paid_at)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                            onClick={() => setCurrentPage(page)}
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
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}

              {/* Showing info */}
              <p className="text-sm text-muted-foreground text-center">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalCount)} of {totalCount} records
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No sales found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedEvent !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Sales will appear here once customers purchase tickets"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
