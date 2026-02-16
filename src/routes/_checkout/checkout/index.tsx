import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Loader2,
  ShoppingCart,
  AlertCircle,
  User,
  Mail,
  Phone,
  Shield,
  Ticket,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

import { isLoggedIn } from "@/hooks/useAuth";
import "@/styles/custom.scss";

// We'll use custom styled inputs instead of shadcn components

interface CheckoutItem {
  ticket_id: string;
  quantity: number;
}

interface TicketDetail {
  name: string;
  count: number;
  price: number;
}

interface CheckoutData {
  event_id: string;
  event_title: string;
  flyer_url?: string;
  items: CheckoutItem[];
  ticket_details: TicketDetail[];
  total_amount: number;
}

interface CreateCheckoutResponse {
  checkout_url: string;
  session_id: string;
  payment_id: string;
}

interface GuestInfo {
  email: string;
  name?: string;
  phone?: string;
}

export const Route = createFileRoute("/_checkout/checkout/")({
  component: Checkout,
  head: () => ({
    meta: [
      {
        title: "Checkout - Chop Life",
      },
    ],
  }),
});

function Checkout() {
  const navigate = useNavigate();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = isLoggedIn();

  // Guest checkout form state
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    // Get checkout data from sessionStorage
    const data = sessionStorage.getItem("checkoutData");
    if (data) {
      try {
        setCheckoutData(JSON.parse(data));
      } catch {
        setError("Invalid checkout data");
      }
    }
  }, []);

  const handleProceedToPayment = async () => {
    if (!checkoutData) return;

    // Validate guest email if not authenticated
    if (!isAuthenticated && !guestEmail.trim()) {
      setError("Please enter your email address to continue");
      return;
    }

    // Basic email validation
    if (!isAuthenticated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // Build request body
      const requestBody: {
        event_id: string;
        items: CheckoutItem[];
        guest_info?: GuestInfo;
      } = {
        event_id: checkoutData.event_id,
        items: checkoutData.items,
      };

      // Add guest info for non-authenticated users
      if (!isAuthenticated) {
        requestBody.guest_info = {
          email: guestEmail.trim(),
          name: guestName.trim() || undefined,
          phone: guestPhone.trim() || undefined,
        };
      }

      // Build headers - only include Authorization if authenticated
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (isAuthenticated && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post<CreateCheckoutResponse>(
        `${baseUrl}/api/v1/checkout/create-session`,
        requestBody,
        { headers },
      );

      // Clear checkout data from sessionStorage
      sessionStorage.removeItem("checkoutData");

      // Redirect to Stripe checkout
      window.location.href = response.data.checkout_url;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.detail || "Failed to create checkout session";
        setError(message);
      } else {
        setError("An unexpected error occurred");
      }
      setIsLoading(false);
    }
  };

  // No checkout data - show empty state
  if (!checkoutData) {
    return (
      <div className="checkout-page">
        <div className="checkout-page__empty">
          <div className="icon-wrapper">
            <ShoppingCart />
          </div>
          <h1>Your cart is empty</h1>
          <p>Select tickets from an event to proceed with checkout.</p>
          <button
            type="button"
            className="browse-btn"
            onClick={() => navigate({ to: "/" })}
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page container mx-auto px-4 max-w-2xl">
      {/* Blurred Event Image Background */}
      {checkoutData.flyer_url && (
        <>
          <div
            className="checkout-page__blur-bg"
            style={{ backgroundImage: `url(${checkoutData.flyer_url})` }}
          />
          <div className="checkout-page__blur-overlay" />
        </>
      )}

      <h1 className="checkout-page__title text-2xl sm:text-3xl mb-6 sm:mb-8">Checkout</h1>

      {/* Order Summary Card */}
      <div className="checkout-page__summary p-5 sm:p-6 mb-4 sm:mb-5">
        <div className="checkout-page__card-header">
          <div className="icon">
            <Ticket className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl">Order Summary</h2>
        </div>

        {/* Event Title */}
        <div className="event-title">{checkoutData.event_title}</div>

        {/* Ticket Items */}
        <div className="mb-4">
          {checkoutData.ticket_details.map((item) => (
            <div key={item.name} className="ticket-item">
              <span className="ticket-item__name">
                <span className="quantity">{item.count}×</span> {item.name}
              </span>
              <span className="ticket-item__price">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="total-section">
          <span className="total-label">Total</span>
          <span className="total-amount">${checkoutData.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="checkout-page__error mb-4 sm:mb-5">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Guest Info Section - Only show for non-authenticated users */}
      {!isAuthenticated && (
        <div className="checkout-page__contact p-5 sm:p-6 mb-4 sm:mb-5">
          <div className="checkout-page__card-header">
            <div className="icon">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl">Contact Information</h2>
          </div>

          <p className="description text-sm sm:text-base">
            Enter your details to receive your tickets via email.
          </p>

          <div className="form-field">
            <label htmlFor="guest-email">
              <Mail />
              Email <span className="required">*</span>
            </label>
            <input
              id="guest-email"
              type="email"
              className="checkout-page__input"
              placeholder="your@email.com"
              value={guestEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="guest-name">
              <User />
              Full Name <span className="optional">(optional)</span>
            </label>
            <input
              id="guest-name"
              type="text"
              className="checkout-page__input"
              placeholder="John Doe"
              value={guestName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="guest-phone">
              <Phone />
              Phone <span className="optional">(optional)</span>
            </label>
            <input
              id="guest-phone"
              type="tel"
              className="checkout-page__input"
              placeholder="+1 (555) 123-4567"
              value={guestPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestPhone(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Payment Section */}
      <div className="checkout-page__payment p-5 sm:p-6">
        <div className="checkout-page__card-header">
          <div className="icon">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="text-lg sm:text-xl">Payment</h2>
        </div>

        <p className="description text-sm sm:text-base">
          You'll be securely redirected to Stripe to complete your purchase.
        </p>

        <div className="checkout-page__buttons">
          <button
            type="button"
            className="checkout-page__btn-secondary"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Go Back
          </button>
          <button
            type="button"
            className="checkout-page__btn-primary"
            onClick={handleProceedToPayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 spinner" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay ${checkoutData.total_amount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="checkout-page__security-note">
        <Shield className="text-green-400" />
        <span>Payments processed securely by Stripe. We never store your card details.</span>
      </div>
    </div>
  );
}
