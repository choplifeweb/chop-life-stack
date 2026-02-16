import { useState } from "react"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"

import { EventForm } from "@/components/Events"
import { EventsService, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import type { EventFormData } from "@/types/event"

export const Route = createFileRoute("/_authenticated/events/create")({
  component: CreateEvent,
  beforeLoad: async () => {
    const user = await UsersService.readUserMe()
    if (!user.is_superuser) {
      throw redirect({
        to: "/events",
      })
    }
  },
  head: () => ({
    meta: [
      {
        title: "Create Event - Chop Life",
      },
    ],
  }),
})

// Interface for the event data JSON payload
interface EventCreatePayload {
  title: string
  short_summary?: string
  description?: string
  start_datetime: string
  end_datetime: string
  timezone: string
  recurring_series: boolean
  location?: string
  venue_name?: string
  latitude?: number
  longitude?: number
  show_on_explore: boolean
  password_protected: boolean
  event_activity_social_feed: boolean
  event_activity_updates_only: boolean
  youtube_video_url?: string
  spotify_song_url?: string
  title_font?: string
  accent_color?: string
  status: string
  tickets: Array<{
    name: string
    description?: string
    price_amount: number
    price_currency?: string
    gross_price?: number
    display_price?: number
    quantity_total: number
    is_unlimited?: boolean
    sale_start?: string
    sale_end?: string
    validity_start?: string
    validity_end?: string
    min_per_order?: number
    max_per_order?: number
    sell_in_bundles?: boolean
  }>
}

function CreateEvent() {
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)

    try {
      // Convert tickets to API format (price in cents)
      const tickets = data.tickets.map((t) => ({
        name: t.name,
        description: t.description,
        price_amount: Math.round((t.displayPrice || t.price) * 100), // Display price in cents
        price_currency: "USD",
        gross_price: t.grossPrice ? Math.round(t.grossPrice * 100) : undefined,
        display_price: t.displayPrice ? Math.round(t.displayPrice * 100) : undefined,
        quantity_total: t.isUnlimited ? 999999 : t.quantity,
        is_unlimited: t.isUnlimited || false,
        sale_start: t.hasSalesPeriod && t.saleStartDate ? t.saleStartDate.toISOString() : undefined,
        sale_end: t.hasSalesPeriod && t.saleEndDate ? t.saleEndDate.toISOString() : undefined,
        validity_start: t.hasValidityPeriod && t.validityStartDate ? t.validityStartDate.toISOString() : undefined,
        validity_end: t.hasValidityPeriod && t.validityEndDate ? t.validityEndDate.toISOString() : undefined,
        min_per_order: t.hasPurchaseLimit ? t.minPerOrder : 1,
        max_per_order: t.hasPurchaseLimit ? t.maxPerOrder : 10,
        sell_in_bundles: t.sellInBundles || false,
      }))

      // Build the event data payload
      const eventPayload: EventCreatePayload = {
        title: data.name,
        short_summary: data.shortSummary || undefined,
        description: data.description || undefined,
        start_datetime: data.startDate.toISOString(),
        end_datetime: data.endDate.toISOString(),
        timezone: data.timezone,
        recurring_series: data.isRecurring,
        location: data.location || undefined,
        venue_name: data.venueName || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
        show_on_explore: data.pageSettings.isPublic,
        password_protected: data.pageSettings.requirePassword,
        event_activity_social_feed: data.pageSettings.showActivityFeed && data.pageSettings.activityFeedMode === "social",
        event_activity_updates_only: data.pageSettings.showActivityFeed && data.pageSettings.activityFeedMode === "updates",
        youtube_video_url: data.youtubeVideoUrl || undefined,
        spotify_song_url: data.spotifySongUrl || undefined,
        title_font: data.titleFont || undefined,
        accent_color: data.accentColor || undefined,
        status: data.status,
        tickets,
      }

      // Call the API with multipart form data
      await EventsService.createEvent({
        formData: {
          event_data: JSON.stringify(eventPayload),
          flyer: data.flyerFile || undefined,
          gallery_images: data.galleryFiles?.length ? data.galleryFiles : undefined,
        },
      })

      showSuccessToast("Event created successfully")
      navigate({ to: "/events" })
    } catch (error) {
      console.error("Failed to create event:", error)
      showErrorToast("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // The EventForm component now handles its own full-page layout
  // No wrapper needed - it takes the full viewport
  return <EventForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
