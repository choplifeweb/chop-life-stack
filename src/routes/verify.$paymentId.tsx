import { createFileRoute } from "@tanstack/react-router"
import {
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Ticket,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

interface TicketItem {
  ticket_id: string
  ticket_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface VerificationData {
  is_valid: boolean
  payment_id: string
  status: "pending" | "completed" | "failed" | "expired"
  event_title: string
  event_date: string
  customer_name: string | null
  ticket_items: TicketItem[]
  total_amount: number
  currency: string
  paid_at: string | null
  verified_at: string
}

export const Route = createFileRoute("/verify/$paymentId")({
  component: VerifyTicket,
  head: () => ({
    meta: [
      {
        title: "Verify Ticket - Chop Life",
      },
    ],
  }),
})

function VerifyTicket() {
  const { paymentId } = Route.useParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [data, setData] = useState<VerificationData | null>(null)
  useEffect(() => {
    const verifyTicket = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
        const response = await axios.get<VerificationData>(
          `${baseUrl}/api/v1/checkout/verify/${paymentId}`
        )
        setData(response.data)
        setStatus("success")
      } catch {
        setStatus("error")
      }
    }

    verifyTicket()
  }, [paymentId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const formatted = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    })

    const tzAbbr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value || ""

    return `${formatted} (${tzAbbr})`
  }

  const maskPaymentId = (paymentId: string) => {
    // Show first 8 and last 8 characters, mask the middle
    if (paymentId.length <= 16) return paymentId
    const start = paymentId.slice(0, 8)
    const end = paymentId.slice(-8)
    return `${start}••••••••••••${end}`
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="ticket-verify">
        <div className="ticket-verify__blur-bg" />
        <div className="ticket-verify__blur-overlay" />
        <div className="ticket-verify__content">
          <div className="ticket-verify__icon ticket-verify__icon--loading">
            <Loader2 className="animate-spin" />
          </div>
          <h1 className="ticket-verify__title">Verifying Ticket</h1>
          <p className="ticket-verify__subtitle">Please wait...</p>
        </div>
      </div>
    )
  }

  // Error state - Invalid/fake ticket
  if (status === "error") {
    return (
      <div className="ticket-verify">
        <div className="ticket-verify__blur-bg ticket-verify__blur-bg--error" />
        <div className="ticket-verify__blur-overlay" />
        <div className="ticket-verify__content">
          <div className="ticket-verify__icon ticket-verify__icon--error">
            <XCircle />
          </div>
          <h1 className="ticket-verify__title">Invalid Ticket</h1>
          <p className="ticket-verify__subtitle">
            This ticket could not be verified
          </p>
          <div className="ticket-verify__card ticket-verify__card--error">
            <p className="ticket-verify__error-message">
              The ticket ID does not exist or is invalid. This may be a fake or tampered ticket.
            </p>
            <div className="ticket-verify__warning-box">
              <AlertTriangle size={18} />
              <span>Do not accept this ticket</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Success state - show verification result
  const isValid = data?.is_valid && data?.status === "completed"

  return (
    <div className="ticket-verify">
      <div
        className={`ticket-verify__blur-bg ${!isValid ? "ticket-verify__blur-bg--warning" : ""}`}
      />
      <div className="ticket-verify__blur-overlay" />
      <div className="ticket-verify__content">
        {/* Status Icon */}
        <div
          className={`ticket-verify__icon ${isValid ? "" : "ticket-verify__icon--warning"}`}
        >
          {isValid ? <CheckCircle /> : <AlertTriangle />}
        </div>

        {/* Title */}
        <h1 className="ticket-verify__title">
          {isValid ? "Valid Ticket" : "Ticket Issue"}
        </h1>
        <p className="ticket-verify__subtitle">
          {isValid
            ? "This ticket has been verified successfully"
            : `Payment status: ${data?.status}`}
        </p>

        {/* Main Card */}
        {data && (
          <div
            className={`ticket-verify__card ${!isValid ? "ticket-verify__card--warning" : ""}`}
          >
            {/* Event Info */}
            <div className="ticket-verify__event">
              <h2 className="ticket-verify__event-title">{data.event_title}</h2>
              <div className="ticket-verify__event-date">
                <Calendar size={16} />
                <span>{formatDate(data.event_date)}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="ticket-verify__details">
              {/* Tickets */}
              <div className="ticket-verify__detail-item">
                <div className="ticket-verify__detail-icon">
                  <Ticket size={16} />
                </div>
                <div className="ticket-verify__detail-content">
                  <span className="ticket-verify__detail-label">Tickets</span>
                  <span className="ticket-verify__detail-value">
                    {data.ticket_items.map((item, idx) => (
                      <span key={idx}>
                        {item.quantity}x {item.ticket_name}
                        {idx < data.ticket_items.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              {/* Paid At */}
              {data.paid_at && (
                <div className="ticket-verify__detail-item">
                  <div className="ticket-verify__detail-icon">
                    <Clock size={16} />
                  </div>
                  <div className="ticket-verify__detail-content">
                    <span className="ticket-verify__detail-label">Purchased</span>
                    <span className="ticket-verify__detail-value">
                      {formatDate(data.paid_at)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment ID */}
            <div className="ticket-verify__payment-id">
              <span className="ticket-verify__payment-id-label">Payment ID</span>
              <span className="ticket-verify__payment-id-value">{maskPaymentId(data.payment_id)}</span>
            </div>

            {/* Verification Time */}
            <div className="ticket-verify__verified-at">
              Verified at {formatDate(data.verified_at)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
