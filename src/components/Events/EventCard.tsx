import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  CalendarDays,
  DollarSign,
  Loader2,
  MapPin,
  Pencil,
  RefreshCw,
  Ticket,
} from "lucide-react"
import { useState } from "react"
import axios from "axios"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"
import type { Event, EventCardProps } from "@/types/event"

import { GuestlistAvatars } from "./GuestlistAvatars"

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

interface TicketSalesResponse {
  data: TicketSaleRecord[]
  count: number
}

interface EventSalesDialogProps {
  eventId: string
  eventName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function EventSalesDialog({ eventId, eventName, open, onOpenChange }: EventSalesDialogProps) {
  const { data, isLoading, error } = useQuery<TicketSalesResponse>({
    queryKey: ["event-sales", eventId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token")
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
      const response = await axios.get<TicketSalesResponse>(
        `${baseUrl}/api/v1/ticket-sales?event_id=${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      return response.data
    },
    enabled: open,
  })

  const formatCurrency = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const formatDateTime = (dateString: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sales for {eventName}
          </DialogTitle>
          <DialogDescription>
            View all ticket purchases for this event
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12 px-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <p className="text-destructive">Failed to load sales data</p>
          </div>
        )}

        {data && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No sales yet</p>
            <p className="text-sm text-muted-foreground">
              Sales will appear here once customers purchase tickets
            </p>
          </div>
        )}

        {data && data.data.length > 0 && (
          <ScrollArea className="max-h-[60vh]">
            <div className="px-4 sm:px-6 pb-6">
              {/* Mobile card view */}
              <div className="sm:hidden space-y-3">
                {data.data.map((sale) => (
                  <div key={sale.payment_id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sale.customer_email}</p>
                        {sale.customer_name && (
                          <p className="text-xs text-muted-foreground truncate">{sale.customer_name}</p>
                        )}
                      </div>
                      {getStatusBadge(sale.status)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sale.ticket_items.map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {item.quantity}x {item.ticket_name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{formatCurrency(sale.total_amount)}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(sale.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((sale) => (
                      <TableRow key={sale.payment_id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[180px]">
                              {sale.customer_email}
                            </span>
                            {sale.customer_name && (
                              <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {sale.customer_name}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {sale.ticket_items.map((item, idx) => (
                              <span key={idx} className="text-sm whitespace-nowrap">
                                {item.quantity}x {item.ticket_name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold whitespace-nowrap">
                            {formatCurrency(sale.total_amount)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm whitespace-nowrap">
                            {formatDateTime(sale.created_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

const formatDateRange = (startDate: Date, endDate: Date): string => {
  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()

  const startFormat = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(startDate)

  if (isSameDay) {
    // Same day: "Sat, Jan 15, 7:00 PM - 11:00 PM"
    const endTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(endDate)
    return `${startFormat} - ${endTime}`
  } else {
    // Different days: "Sat, Jan 15, 7:00 PM - Sun, Jan 16, 2:00 AM"
    const endFormat = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(endDate)
    return `${startFormat} - ${endFormat}`
  }
}

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const getTotalTicketsSold = (event: Event): number => {
  return event.tickets.reduce((sum, ticket) => sum + (ticket.soldCount || 0), 0)
}

const getTotalTickets = (event: Event): number => {
  return event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0)
}

const getLowestTicketPrice = (event: Event): number => {
  if (event.tickets.length === 0) return 0
  return Math.min(...event.tickets.map((t) => t.price))
}

export function EventCard({ event, variant = "public" }: EventCardProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [salesDialogOpen, setSalesDialogOpen] = useState(false)
  const isAdminView = variant === "admin"
  const isSuperuser = user?.is_superuser ?? false

  const handleCardClick = () => {
    if (isAdminView) {
      navigate({ to: "/events/edit/$eventId", params: { eventId: event.id } })
    } else {
      navigate({ to: "/events/$eventId", params: { eventId: event.id } })
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate({ to: "/events/edit/$eventId", params: { eventId: event.id } })
  }

  const handleViewSalesClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSalesDialogOpen(true)
  }

  return (
    <Card className="event-card overflow-hidden p-0" onClick={handleCardClick}>
      <div className="event-card__image">
        {event.flyerImageUrl ? (
          <img src={event.flyerImageUrl} alt={event.name} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <CalendarDays className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        {isAdminView && (
          <Badge
            className="event-card__status absolute top-2 left-2 bg-white text-black hover:bg-white"
          >
            {capitalizeFirst(event.status)}
          </Badge>
        )}
        {isSuperuser && isAdminView && (
          <Button
            variant="secondary"
            size="icon"
            className="event-card__edit absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {event.isRecurring && (
          <Badge variant="outline" className="event-card__recurring bg-background/80">
            <RefreshCw className="h-3 w-3" />
            {event.recurringPattern || "Recurring"}
          </Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="event-card__title text-lg">{event.name}</CardTitle>
        <CardDescription className="event-card__summary">
          {event.shortSummary || event.description.slice(0, 100)}
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-2 flex-1">
        <div className="event-card__meta">
          <div className="event-card__meta-item">
            <CalendarDays />
            <span>{formatDateRange(event.startDate, event.endDate)}</span>
          </div>
          <div className="event-card__meta-item">
            <MapPin />
            <span>{event.venueName}</span>
          </div>
          <div className="event-card__meta-item">
            <Ticket />
            <span>
              {getLowestTicketPrice(event) === 0
                ? "Free"
                : `From $${getLowestTicketPrice(event)}`}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="event-card__footer px-6 pt-4 pb-4 mt-auto">
        <GuestlistAvatars guests={event.guestlist} max={4} showLabel={false} />
        {isAdminView && (
          <div className="event-card__tickets ml-auto text-right">
            <span>{getTotalTicketsSold(event)}</span> / {getTotalTickets(event)}{" "}
            sold
          </div>
        )}
      </CardFooter>

      {/* Admin action buttons */}
      {isSuperuser && isAdminView && (
        <div className="event-card__actions flex gap-2 p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleViewSalesClick}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            View Sales
          </Button>
        </div>
      )}

      {/* Sales Dialog */}
      <EventSalesDialog
        eventId={event.id}
        eventName={event.name}
        open={salesDialogOpen}
        onOpenChange={setSalesDialogOpen}
      />
    </Card>
  )
}

export default EventCard
