import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { CheckCircle, Download, Loader2, Receipt, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import QRCode from "qrcode"

import { isLoggedIn } from "@/hooks/useAuth"

interface TicketItem {
  ticket_id: string
  ticket_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface TicketInfo {
  items: TicketItem[]
  event_title: string
  event_date: string
}

interface PaymentStatus {
  payment_id: string
  status: "pending" | "completed" | "failed" | "expired"
  total_amount: number
  currency: string
  paid_at: string | null
  ticket_info: TicketInfo | null
  customer_name: string | null
  customer_email: string | null
  event_id: string | null
}

export const Route = createFileRoute("/_checkout/checkout/success")({
  component: CheckoutSuccess,
  head: () => ({
    meta: [
      {
        title: "Payment Successful - Chop Life",
      },
    ],
  }),
})

function CheckoutSuccess() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading")
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const isAuthenticated = isLoggedIn()

  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Get session_id or payment_id from URL
      const params = new URLSearchParams(window.location.search)
      let sessionId = params.get("session_id")
      const paymentId = params.get("payment_id")

      // For free orders, payment_id is used instead of session_id
      // Create synthetic session_id for API compatibility
      if (!sessionId && paymentId) {
        sessionId = `free_${paymentId}`
      }

      if (!sessionId) {
        setStatus("error")
        setError("No session ID provided")
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

        // Build headers - only include Authorization if authenticated
        const headers: Record<string, string> = {}
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        const response = await axios.get<PaymentStatus>(
          `${baseUrl}/api/v1/checkout/session/${sessionId}`,
          { headers }
        )

        setPaymentData(response.data)

        if (response.data.status === "completed") {
          setStatus("success")
        } else if (response.data.status === "pending") {
          setStatus("pending")
          // Poll again after 2 seconds if still pending
          setTimeout(checkPaymentStatus, 2000)
        } else {
          setStatus("error")
          setError(`Payment status: ${response.data.status}`)
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          // If payment not found, it might still be processing
          if (err.response?.status === 404) {
            setStatus("pending")
            // Poll again
            setTimeout(checkPaymentStatus, 2000)
          } else {
            setStatus("error")
            setError(err.response?.data?.detail || "Failed to check payment status")
          }
        } else {
          setStatus("error")
          setError("An unexpected error occurred")
        }
      }
    }

    checkPaymentStatus()
  }, [])

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100)
  }

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

  const downloadTicketPDF = async () => {
    if (!paymentData || !paymentData.ticket_info) return

    setIsDownloading(true)

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 20
      const contentWidth = pageWidth - 2 * margin
      let yPos = margin

      // Header - EVENT TICKET
      pdf.setTextColor(30, 30, 30)
      pdf.setFontSize(24)
      pdf.setFont("helvetica", "bold")
      pdf.text("EVENT TICKET", pageWidth / 2, yPos + 10, { align: "center" })

      // Divider line under header
      pdf.setDrawColor(220, 220, 220)
      pdf.line(margin, yPos + 18, pageWidth - margin, yPos + 18)

      yPos = margin + 25

      // Two-column section: Event details (left) + QR code (right)
      const qrSize = 35

      // Left column - Event name
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(30, 30, 30)
      pdf.text(paymentData.ticket_info.event_title, margin, yPos + 10)

      // Left column - Event date
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        formatDate(paymentData.ticket_info.event_date),
        margin,
        yPos + 20
      )

      // Right column - QR Code
      const verificationUrl = `${window.location.origin}/verify/${paymentData.payment_id}`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      const qrX = pageWidth - margin - qrSize
      pdf.addImage(qrCodeDataUrl, "PNG", qrX, yPos, qrSize, qrSize)

      // QR code label
      pdf.setTextColor(120, 120, 120)
      pdf.setFontSize(7)
      pdf.setFont("helvetica", "normal")
      pdf.text("Scan to verify", qrX + qrSize / 2, yPos + qrSize + 4, { align: "center" })

      yPos = yPos + qrSize + 15

      // Reset text color for body
      pdf.setTextColor(50, 50, 50)

      // Order Details Section
      pdf.setFillColor(248, 248, 248)
      pdf.roundedRect(margin, yPos, contentWidth, 45, 3, 3, "F")

      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Order Details", margin + 10, yPos + 12)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)

      // Payment ID
      pdf.setTextColor(100, 100, 100)
      pdf.text("Payment ID:", margin + 10, yPos + 24)
      pdf.setTextColor(50, 50, 50)
      pdf.setFont("helvetica", "bold")
      pdf.text(paymentData.payment_id, margin + 45, yPos + 24)

      // Status
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text("Status:", margin + 10, yPos + 32)
      pdf.setTextColor(34, 197, 94)
      pdf.setFont("helvetica", "bold")
      pdf.text("CONFIRMED", margin + 45, yPos + 32)

      // Paid at
      pdf.setFont("helvetica", "normal")
      pdf.setTextColor(100, 100, 100)
      pdf.text("Paid at:", margin + 10, yPos + 40)
      pdf.setTextColor(50, 50, 50)
      if (paymentData.paid_at) {
        pdf.text(formatDate(paymentData.paid_at), margin + 45, yPos + 40)
      }

      yPos += 55

      // Customer Details Section
      pdf.setFillColor(248, 248, 248)
      pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, "F")

      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(50, 50, 50)
      pdf.text("Customer Details", margin + 10, yPos + 12)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text("Name:", margin + 10, yPos + 22)
      pdf.setTextColor(50, 50, 50)
      pdf.text(paymentData.customer_name || "Guest", margin + 45, yPos + 22)

      pdf.setTextColor(100, 100, 100)
      pdf.text("Email:", margin + contentWidth / 2, yPos + 22)
      pdf.setTextColor(50, 50, 50)
      pdf.text(paymentData.customer_email || "-", margin + contentWidth / 2 + 20, yPos + 22)

      yPos += 40

      // Tickets Section
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.setTextColor(50, 50, 50)
      pdf.text("Tickets", margin, yPos)

      yPos += 8

      // Tickets table header
      pdf.setFillColor(240, 240, 240)
      pdf.roundedRect(margin, yPos, contentWidth, 10, 2, 2, "F")
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")
      pdf.text("Ticket Type", margin + 5, yPos + 7)
      pdf.text("Qty", margin + contentWidth - 55, yPos + 7)
      pdf.text("Price", margin + contentWidth - 25, yPos + 7, { align: "right" })

      yPos += 12

      // Tickets rows
      pdf.setFont("helvetica", "normal")
      for (const item of paymentData.ticket_info.items) {
        pdf.setTextColor(50, 50, 50)
        pdf.text(item.ticket_name, margin + 5, yPos + 5)
        pdf.text(item.quantity.toString(), margin + contentWidth - 55, yPos + 5)
        pdf.text(
          formatPrice(item.total_price, paymentData.currency),
          margin + contentWidth - 25,
          yPos + 5,
          { align: "right" }
        )

        yPos += 10

        // Divider line
        pdf.setDrawColor(230, 230, 230)
        pdf.line(margin + 5, yPos - 2, margin + contentWidth - 5, yPos - 2)
      }

      yPos += 5

      // Total
      pdf.setDrawColor(200, 200, 200)
      pdf.line(margin, yPos, margin + contentWidth, yPos)
      yPos += 8
      pdf.setTextColor(50, 50, 50)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("Total Paid", margin + 5, yPos + 5)
      // Align with Price column (same position as ticket prices)
      pdf.text(
        formatPrice(paymentData.total_amount, paymentData.currency),
        margin + contentWidth - 25,
        yPos + 5,
        { align: "right" }
      )

      yPos += 20

      // Footer note
      pdf.setTextColor(150, 150, 150)
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "italic")
      pdf.text(
        "Please present this ticket (digital or printed) at the event entrance.",
        pageWidth / 2,
        yPos,
        { align: "center" }
      )

      pdf.text(
        "Thank you for your purchase!",
        pageWidth / 2,
        yPos + 6,
        { align: "center" }
      )

      // Branding
      pdf.setTextColor(100, 100, 100)
      pdf.setFont("helvetica", "normal")
      pdf.text("Powered by Chop Life", pageWidth / 2, pdf.internal.pageSize.getHeight() - 15, {
        align: "center",
      })

      // Download the PDF
      const fileName = `ticket-${paymentData.payment_id.slice(0, 8)}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  // Loading state
  if (status === "loading" || status === "pending") {
    return (
      <div className="checkout-success">
        <div className="checkout-success__blur-bg" />
        <div className="checkout-success__blur-overlay" />
        <div className="checkout-success__content">
          <div className="checkout-success__icon checkout-success__icon--loading">
            <Loader2 className="animate-spin" />
          </div>
          <h1 className="checkout-success__title">Processing Payment</h1>
          <p className="checkout-success__subtitle">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (status === "error") {
    return (
      <div className="checkout-success">
        <div className="checkout-success__blur-bg" />
        <div className="checkout-success__blur-overlay" />
        <div className="checkout-success__content">
          <div className="checkout-success__icon checkout-success__icon--error">
            <XCircle />
          </div>
          <h1 className="checkout-success__title">Payment Issue</h1>
          <p className="checkout-success__subtitle">
            {error || "There was an issue with your payment. Please try again or contact support."}
          </p>
          <div className="checkout-success__buttons">
            <button
              type="button"
              className="checkout-success__btn-secondary"
              onClick={() => navigate({ to: "/" })}
            >
              Go Home
            </button>
            <button
              type="button"
              className="checkout-success__btn-primary"
              onClick={() => navigate({ to: "/checkout" })}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="checkout-success">
      <div className="checkout-success__blur-bg" />
      <div className="checkout-success__blur-overlay" />
      <div className="checkout-success__content">
        <div className="checkout-success__icon">
          <CheckCircle />
        </div>
        <h1 className="checkout-success__title">Payment Successful!</h1>
        <p className="checkout-success__subtitle">
          Thank you for your purchase. Your tickets have been confirmed.
        </p>

        {paymentData && (
          <div className="checkout-success__card">
            <div className="checkout-success__card-header">
              <div className="icon">
                <Receipt />
              </div>
              <h2>Order Details</h2>
            </div>

            <div className="checkout-success__detail-row">
              <span className="checkout-success__detail-label">Payment ID</span>
              <span className="checkout-success__detail-value checkout-success__detail-value--mono">
                {paymentData.payment_id}
              </span>
            </div>

            <div className="checkout-success__detail-row">
              <span className="checkout-success__detail-label">Amount</span>
              <span className="checkout-success__detail-value checkout-success__detail-value--amount">
                {formatPrice(paymentData.total_amount, paymentData.currency)}
              </span>
            </div>

            <div className="checkout-success__detail-row">
              <span className="checkout-success__detail-label">Status</span>
              <span className="checkout-success__detail-value checkout-success__detail-value--success">
                Completed
              </span>
            </div>

            {paymentData.paid_at && (
              <div className="checkout-success__detail-row">
                <span className="checkout-success__detail-label">Paid at</span>
                <span className="checkout-success__detail-value">
                  {formatDate(paymentData.paid_at)}
                </span>
              </div>
            )}

            {paymentData.ticket_info && paymentData.ticket_info.items.length > 0 && (
              <div className="checkout-success__tickets">
                <div className="checkout-success__tickets-title">Tickets</div>
                {paymentData.ticket_info.items.map((item, index) => (
                  <div key={index} className="checkout-success__ticket-item">
                    <span className="checkout-success__ticket-name">
                      <span className="quantity">{item.quantity}x</span>
                      {item.ticket_name}
                    </span>
                    <span className="checkout-success__ticket-price">
                      {formatPrice(item.total_price, paymentData.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="checkout-success__buttons">
          <button
            type="button"
            className="checkout-success__btn-secondary"
            onClick={() => navigate({ to: "/calendar-events" })}
          >
            Browse More Events
          </button>
          <button
            type="button"
            className="checkout-success__btn-primary"
            onClick={downloadTicketPDF}
            disabled={isDownloading || !paymentData?.ticket_info}
          >
            {isDownloading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download />
            )}
            {isDownloading ? "Generating..." : "Download Ticket"}
          </button>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            className="checkout-success__btn-secondary mt-3 w-full"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  )
}
