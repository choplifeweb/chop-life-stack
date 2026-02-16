// Event status types
export type EventStatus = "draft" | "published" | "cancelled" | "completed"
export type RSVPStatus = "pending" | "confirmed" | "declined"

// Ticket type definition
export interface TicketType {
  id: string
  name: string
  price: number
  quantity: number
  description?: string
  soldCount?: number
  // Enhanced fields (posh.vip-style)
  isUnlimited?: boolean
  grossPrice?: number
  displayPrice?: number
  // Sales period limits
  hasSalesPeriod?: boolean
  saleStartDate?: Date
  saleEndDate?: Date
  // Ticket validity limits
  hasValidityPeriod?: boolean
  validityStartDate?: Date
  validityEndDate?: Date
  // Purchase quantity limits
  hasPurchaseLimit?: boolean
  minPerOrder?: number
  maxPerOrder?: number
  // Bundle options
  sellInBundles?: boolean
  bundleSize?: number
}

// Guest definition
export interface Guest {
  id: string
  name: string
  email: string
  avatarUrl?: string
  rsvpStatus: RSVPStatus
}

// Gallery image type (for existing images from API)
export interface GalleryImage {
  id: string
  imageUrl: string
  displayOrder: number
}

// Page settings
export interface EventPageSettings {
  isPublic: boolean
  requirePassword: boolean
  password?: string
  showActivityFeed: boolean
  activityFeedMode: "social" | "updates"
}

// Main Event interface
export interface Event {
  id: string
  name: string
  shortSummary?: string
  description: string

  // Dates
  startDate: Date
  endDate: Date
  timezone: string
  isRecurring: boolean
  recurringPattern?: string

  // Location
  location: string
  venueName: string
  venueAddress?: string
  latitude?: number
  longitude?: number

  // Tickets
  tickets: TicketType[]

  // Guestlist
  guestlist: Guest[]
  maxCapacity?: number

  // Media
  flyerImageUrl?: string
  galleryImages: string[]
  youtubeVideoUrl?: string
  spotifySongUrl?: string

  // Styling
  titleFont: string
  accentColor: string

  // Settings
  pageSettings: EventPageSettings

  // Meta
  status: EventStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Form data type (for creating/editing)
export interface EventFormData {
  name: string
  shortSummary?: string
  description: string
  startDate: Date
  endDate: Date
  timezone: string
  isRecurring: boolean
  recurringPattern?: string
  location: string
  venueName: string
  venueAddress?: string
  latitude?: number
  longitude?: number
  tickets: TicketType[]
  flyerImageUrl?: string
  flyerFile?: File // Actual file for API upload
  galleryImages: string[] // Preview URLs (for display)
  galleryFiles?: File[] // NEW files for API upload
  existingGalleryImages?: GalleryImage[] // Existing images from API (to track which to keep/delete)
  youtubeVideoUrl?: string
  spotifySongUrl?: string
  titleFont: string
  accentColor: string
  pageSettings: EventPageSettings
  status: EventStatus
}

// Event card display props
export interface EventCardProps {
  event: Event
  variant?: "admin" | "public"
  onEdit?: (event: Event) => void
  onDelete?: (event: Event) => void
}

// Events grid props
export interface EventsGridProps {
  events: Event[]
  variant?: "admin" | "public"
  onEventUpdate?: (events: Event[]) => void
}
