import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense, useState } from "react"

import { EventsService } from "@/client"
import type { EventPublic } from "@/client/types.gen"
import { EventForm } from "@/components/Events"
import { Skeleton } from "@/components/ui/skeleton"
import useCustomToast from "@/hooks/useCustomToast"
import type { EventFormData, GalleryImage, TicketType } from "@/types/event"

function getFullImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"
  return `${baseUrl}${path}`
}

function mapEventToFormData(event: EventPublic): EventFormData {
  const tickets: TicketType[] = (event.tickets || []).map((t) => ({
    id: t.id,
    name: t.name,
    price: (t.price_amount || 0) / 100,
    quantity: t.quantity_total,
    description: t.description || undefined,
    soldCount: t.quantity_sold,
    // Enhanced fields
    isUnlimited: t.is_unlimited || false,
    grossPrice: t.gross_price ? t.gross_price / 100 : undefined,
    displayPrice: t.display_price ? t.display_price / 100 : (t.price_amount || 0) / 100,
    hasSalesPeriod: !!(t.sale_start || t.sale_end),
    saleStartDate: t.sale_start ? new Date(t.sale_start) : undefined,
    saleEndDate: t.sale_end ? new Date(t.sale_end) : undefined,
    hasValidityPeriod: !!(t.validity_start || t.validity_end),
    validityStartDate: t.validity_start ? new Date(t.validity_start) : undefined,
    validityEndDate: t.validity_end ? new Date(t.validity_end) : undefined,
    hasPurchaseLimit: (t.min_per_order !== 1 || t.max_per_order !== 10),
    minPerOrder: t.min_per_order || 1,
    maxPerOrder: t.max_per_order || 10,
    sellInBundles: t.sell_in_bundles || false,
  }))

  return {
    name: event.title,
    shortSummary: event.short_summary || "",
    description: event.description || "",
    startDate: new Date(event.start_datetime),
    endDate: new Date(event.end_datetime),
    timezone: event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    isRecurring: event.recurring_series || false,
    location: event.location || "",
    venueName: event.venue_name || "",
    latitude: event.latitude ?? undefined,
    longitude: event.longitude ?? undefined,
    tickets: tickets.length > 0 ? tickets : [{ id: "1", name: "Default Ticket", price: 10, quantity: 100 }],
    flyerImageUrl: getFullImageUrl(event.flyer_url) || "",
    galleryImages: [], // For new uploads only
    existingGalleryImages: (event.gallery_images || []).map((img): GalleryImage => ({
      id: img.id,
      imageUrl: getFullImageUrl(img.image_url) || img.image_url,
      displayOrder: img.display_order,
    })),
    youtubeVideoUrl: event.youtube_video_url || "",
    spotifySongUrl: event.spotify_song_url || "",
    titleFont: event.title_font || "Default",
    accentColor: event.accent_color || "#ffffff",
    pageSettings: {
      isPublic: event.show_on_explore || false,
      requirePassword: event.password_protected || false,
      showActivityFeed: event.event_activity_social_feed || event.event_activity_updates_only || false,
      activityFeedMode: event.event_activity_updates_only ? "updates" : "social",
    },
    status: event.status,
  }
}

interface EventUpdatePayload {
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
  gallery_images_to_keep?: string[] // IDs of existing images to keep
  tickets: Array<{
    id?: string
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

function getEventQueryOptions(eventId: string) {
  return {
    queryFn: () => EventsService.readEvent({ eventId }),
    queryKey: ["event", eventId],
  }
}

// Helper to check if a string is a valid UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export const Route = createFileRoute("/_authenticated/events/edit/$eventId")({
  component: EditEventPage,
  head: () => ({
    meta: [
      {
        title: "Edit Event - Chop Life",
      },
    ],
  }),
})

function EditEventLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl mx-auto">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function EditEventContent({ eventId }: { eventId: string }) {
  const navigate = useNavigate()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: event } = useSuspenseQuery(getEventQueryOptions(eventId))
  const initialData = mapEventToFormData(event)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await EventsService.deleteEvent({ eventId })
      showSuccessToast("Event deleted successfully")
      navigate({ to: "/events" })
    } catch (error) {
      console.error("Failed to delete event:", error)
      showErrorToast("Failed to delete event. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSubmit = async (data: EventFormData) => {
    setIsSubmitting(true)

    try {
      const tickets = data.tickets.map((t) => ({
        // Only include ID if it's a valid UUID (existing ticket), otherwise null for new tickets
        id: isValidUUID(t.id) ? t.id : undefined,
        name: t.name,
        description: t.description,
        price_amount: Math.round((t.displayPrice || t.price) * 100),
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

      // Get IDs of existing images to keep (user didn't remove them)
      const galleryImagesToKeep = (data.existingGalleryImages || []).map((img) => img.id)

      const eventPayload: EventUpdatePayload = {
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
        event_activity_social_feed:
          data.pageSettings.showActivityFeed && data.pageSettings.activityFeedMode === "social",
        event_activity_updates_only:
          data.pageSettings.showActivityFeed && data.pageSettings.activityFeedMode === "updates",
        youtube_video_url: data.youtubeVideoUrl || undefined,
        spotify_song_url: data.spotifySongUrl || undefined,
        title_font: data.titleFont || undefined,
        accent_color: data.accentColor || undefined,
        status: data.status,
        gallery_images_to_keep: galleryImagesToKeep,
        tickets,
      }

      await EventsService.updateEvent({
        eventId,
        formData: {
          event_data: JSON.stringify(eventPayload),
          flyer: data.flyerFile || undefined,
          gallery_images: data.galleryFiles?.length ? data.galleryFiles : undefined,
        },
      })

      showSuccessToast("Event updated successfully")
      navigate({ to: "/events" })
    } catch (error) {
      console.error("Failed to update event:", error)
      showErrorToast("Failed to update event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EventForm
      initialData={initialData}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      mode="edit"
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
    />
  )
}

function EditEventPage() {
  const { eventId } = Route.useParams()

  return (
    <Suspense fallback={<EditEventLoadingSkeleton />}>
      <EditEventContent eventId={eventId} />
    </Suspense>
  )
}
