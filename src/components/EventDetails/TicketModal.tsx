import { useNavigate } from "@tanstack/react-router"
import { Minus, Plus, X } from "lucide-react"
import { useState } from "react"

import type { EventPublic, TicketPublic } from "@/client/types.gen"

interface TicketModalProps {
  isOpen: boolean
  onClose: () => void
  event: EventPublic
}

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
  return `${baseUrl}${path}`
}

function formatEventDateTime(
  startDatetime: string,
  endDatetime: string,
  timezone: string
): string {
  const start = new Date(startDatetime)
  const end = new Date(endDatetime)

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

  const datePart = start.toLocaleDateString("en-US", dateOptions)
  const startTime = start.toLocaleTimeString("en-US", timeOptions)
  const endTime = end.toLocaleTimeString("en-US", timeOptions)

  // Get the proper timezone abbreviation (e.g., "EST", "PST", "WAT")
  const tzAbbr = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  })
    .formatToParts(start)
    .find((part) => part.type === "timeZoneName")?.value || timezone

  return `${datePart} at ${startTime} - ${endTime} (${tzAbbr})`
}

export function TicketModal({ isOpen, onClose, event }: TicketModalProps) {
  const navigate = useNavigate()
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({})

  if (!isOpen) return null

  const tickets = event.tickets || []
  const flyerUrl = getFullImageUrl(event.flyer_url)
  const dateTimeString = formatEventDateTime(
    event.start_datetime,
    event.end_datetime,
    event.timezone || "UTC"
  )

  const handleAddTicket = (ticket: TicketPublic) => {
    const minPerOrder = ticket.min_per_order || 1
    const maxPerOrder = ticket.max_per_order || 10
    const available = getAvailableQuantity(ticket)
    const maxAllowed = Math.min(maxPerOrder, available)
    const increment = ticket.sell_in_bundles ? minPerOrder : 1

    setSelectedTickets((prev) => {
      const current = prev[ticket.id] || 0
      if (current >= maxAllowed) return prev

      // If adding first ticket, jump to minPerOrder
      if (current === 0) {
        return {
          ...prev,
          [ticket.id]: Math.min(minPerOrder, maxAllowed),
        }
      }

      // Otherwise increment (by bundle size if sell_in_bundles)
      const newValue = current + increment
      return {
        ...prev,
        [ticket.id]: Math.min(newValue, maxAllowed),
      }
    })
  }

  const handleRemoveTicket = (ticket: TicketPublic) => {
    const minPerOrder = ticket.min_per_order || 1
    const increment = ticket.sell_in_bundles ? minPerOrder : 1

    setSelectedTickets((prev) => {
      const current = prev[ticket.id] || 0
      const newValue = current - increment

      // If going below minPerOrder, reset to 0 (deselect)
      if (newValue < minPerOrder) {
        return {
          ...prev,
          [ticket.id]: 0,
        }
      }

      return {
        ...prev,
        [ticket.id]: newValue,
      }
    })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Calculate totals
  const totalTickets = Object.values(selectedTickets).reduce(
    (sum, count) => sum + count,
    0
  )

  const calculateTotal = () => {
    let total = 0
    for (const ticket of tickets) {
      const count = selectedTickets[ticket.id] || 0
      const price = (ticket.price_amount || 0) / 100
      total += count * price
    }
    return total
  }

  const getSelectedTicketsList = () => {
    const items: { name: string; count: number; price: number }[] = []
    for (const ticket of tickets) {
      const count = selectedTickets[ticket.id] || 0
      if (count > 0) {
        const price = (ticket.price_amount || 0) / 100
        items.push({ name: ticket.name, count, price: price * count })
      }
    }
    return items
  }

  const getAvailableQuantity = (ticket: TicketPublic) => {
    if (ticket.is_unlimited) return 999999
    return ticket.quantity_total - ticket.quantity_sold
  }

  const getPurchaseLimitText = (ticket: TicketPublic) => {
    const min = ticket.min_per_order || 1
    const max = ticket.max_per_order || 10
    if (min > 1 && ticket.sell_in_bundles) {
      return `Min ${min} (sold in bundles)`
    }
    if (min > 1) {
      return `Min ${min} per order`
    }
    if (max < 10) {
      return `Max ${max} per order`
    }
    return null
  }

  const hasTicketsSelected = totalTickets > 0

  const handleCheckout = () => {
    // Build checkout data
    const checkoutItems = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => ({
        ticket_id: ticketId,
        quantity,
      }))

    // Store checkout data in sessionStorage
    const checkoutData = {
      event_id: event.id,
      event_title: event.title,
      flyer_url: flyerUrl,
      items: checkoutItems,
      ticket_details: getSelectedTicketsList(),
      total_amount: calculateTotal(),
    }
    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData))

    // Proceed to checkout (works for both guests and logged-in users)
    onClose()
    navigate({ to: "/checkout" })
  }

  return (
    <div
      className="ticket-modal fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop - Glassmorphic */}
      <div className="ticket-modal__backdrop absolute inset-0" />

      {/* Modal Content - Glassmorphic Container */}
      <div
        className={`ticket-modal__content relative rounded-t-3xl sm:rounded-3xl max-h-[92vh] sm:max-h-[85vh] flex flex-col ${
          hasTicketsSelected ? "w-full sm:max-w-[1100px]" : "w-full sm:max-w-[900px]"
        }`}
      >
        {/* Sticky Header with Close Button - Glass Effect */}
        <div className="ticket-modal__header sticky top-0 z-20 px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between relative">
          <h2 className="text-base sm:text-lg font-bold text-white truncate pr-4">{event.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="ticket-modal__close-btn shrink-0 p-2.5 rounded-full"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Event Info - Hidden on mobile when tickets selected */}
            <div className={`ticket-modal__event-info shrink-0 w-full lg:w-[280px] p-5 sm:p-6 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-white/6 ${hasTicketsSelected ? 'hidden lg:flex' : ''}`}>
              {/* Flyer Image with Glow Effect */}
              <div className="ticket-modal__flyer w-28 sm:w-32 lg:w-40 mb-5 relative">
                {flyerUrl ? (
                  <img
                    src={flyerUrl}
                    alt={event.title}
                    className="w-full h-auto object-cover aspect-[3/4] rounded-2xl"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <span className="text-white/30 text-sm">No flyer</span>
                  </div>
                )}
              </div>

              {/* Venue & Date */}
              <div className="space-y-1.5">
                <p className="text-white font-semibold text-sm">{event.venue_name}</p>
                <p className="text-white/50 text-xs">{dateTimeString}</p>
              </div>
            </div>

            {/* Middle - Ticket Selection */}
            <div className={`ticket-modal__tickets flex-1 p-5 sm:p-6 ${hasTicketsSelected ? 'lg:border-r border-white/6' : ''}`}>
              <h3 className="ticket-modal__tickets-title mb-4">Select Tickets</h3>
              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-white/40">No tickets available for this event.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => {
                    const price = (ticket.price_amount || 0) / 100
                    const available = getAvailableQuantity(ticket)
                    const isSoldOut = available <= 0
                    const isSelected = (selectedTickets[ticket.id] || 0) > 0

                    return (
                      <div
                        key={ticket.id}
                        className={`ticket-modal__ticket-card p-4 sm:p-5 ${
                          isSoldOut
                            ? "ticket-modal__ticket-card--sold-out"
                            : isSelected
                              ? "ticket-modal__ticket-card--selected"
                              : ""
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Ticket Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="text-sm sm:text-base font-bold text-white">
                                {ticket.name}
                              </h4>
                              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold text-xs sm:text-sm">
                                {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                              </span>
                            </div>
                            {ticket.description && (
                              <p className="text-white/40 text-xs mt-2 line-clamp-2">
                                {ticket.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs ${isSoldOut ? 'text-red-400/70' : 'text-white/40'}`}>
                                {isSoldOut
                                  ? "Sold out"
                                  : ticket.is_unlimited
                                    ? "✓ Available"
                                    : `${available} left`}
                              </span>
                              {!isSoldOut && getPurchaseLimitText(ticket) && (
                                <span className="text-amber-400/60 text-xs">
                                  • {getPurchaseLimitText(ticket)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          {!isSoldOut && (
                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTicket(ticket)}
                                    aria-label="Remove ticket"
                                    className="ticket-modal__qty-btn ticket-modal__qty-btn--remove"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="ticket-modal__qty-display">
                                    {selectedTickets[ticket.id]}
                                  </span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAddTicket(ticket)}
                                aria-label="Add ticket"
                                className="ticket-modal__qty-btn ticket-modal__qty-btn--add"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Right Side - Order Summary (Desktop only) */}
            {hasTicketsSelected && (
              <div className="ticket-modal__checkout hidden lg:flex shrink-0 w-[280px] p-6 flex-col">
                <h3 className="ticket-modal__checkout-title mb-5">Order Summary</h3>

                {/* Line Items */}
                <div className="space-y-1 flex-1">
                  {getSelectedTicketsList().map((item) => (
                    <div key={item.name} className="ticket-modal__checkout-item text-sm">
                      <span className="text-white/60">{item.count}× {item.name}</span>
                      <span className="text-white font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="ticket-modal__checkout-total">
                  <div className="flex justify-between items-baseline">
                    <span className="text-white/60 text-sm">Total</span>
                    <span className="total-amount">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="ticket-modal__checkout-btn w-full mt-5"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sticky Footer - Checkout Bar */}
        {hasTicketsSelected && (
          <div className="ticket-modal__footer lg:hidden sticky bottom-0 p-4 flex items-center justify-between gap-4 relative">
            <div className="flex-1 min-w-0">
              <p className="footer-price text-xl sm:text-2xl">
                ${calculateTotal().toFixed(2)}
              </p>
              <p className="text-white/40 text-xs truncate">
                {totalTickets} ticket{totalTickets !== 1 ? 's' : ''} • {getSelectedTicketsList().map(i => `${i.count}× ${i.name}`).join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCheckout}
              className="ticket-modal__checkout-btn shrink-0 px-6 py-3 text-sm sm:text-base"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketModal
