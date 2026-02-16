import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt,
  Ticket,
  XCircle,
} from "lucide-react"

import { CheckoutService } from "@/client"
import type { StripePaymentPublic } from "@/client/types.gen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_authenticated/orders")({
  component: Orders,
  head: () => ({
    meta: [
      {
        title: "My Orders - Chop Life",
      },
    ],
  }),
})

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    case "failed":
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    case "expired":
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

interface TicketItem {
  ticket_id: string
  ticket_name: string
  quantity: number
  unit_price: number
  total_price: number
}

function OrderCard({ order }: { order: StripePaymentPublic }) {
  const ticketInfo = order.ticket_info as {
    items?: TicketItem[]
    event_title?: string
    event_date?: string
  }
  const items = ticketInfo?.items || []
  const eventTitle = ticketInfo?.event_title || "Event"
  const eventDate = ticketInfo?.event_date

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{eventTitle}</CardTitle>
            {eventDate && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <CalendarDays className="h-4 w-4" />
                {formatDate(eventDate)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ticket Items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span>{item.ticket_name}</span>
                <Badge variant="outline" className="text-xs">
                  x{item.quantity}
                </Badge>
              </div>
              <span className="font-medium">
                {formatCurrency(item.total_price, order.currency)}
              </span>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <p>Order ID: {order.id.slice(0, 8)}...</p>
            <p>Ordered: {formatDate(order.created_at)}</p>
            {order.paid_at && (
              <p className="text-green-600">Paid: {formatDate(order.paid_at)}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">
              {formatCurrency(order.total_amount, order.currency)}
            </p>
          </div>
        </div>

        {/* View Event Button */}
        {order.event_id && (
          <Button variant="outline" className="w-full" asChild>
            <Link to="/events/$eventId" params={{ eventId: order.event_id }}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Event
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function OrdersLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-12 w-1/4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyOrders() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Receipt className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't purchased any tickets yet. Browse events to find something
          you'd like to attend!
        </p>
        <Button asChild>
          <Link to="/">Browse Events</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => CheckoutService.getMyOrders({ skip: 0, limit: 50 }),
  })

  const orders = data?.data || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          My Orders
        </h1>
        <p className="text-muted-foreground">
          View your ticket purchases and order history
        </p>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrdersLoading />
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
