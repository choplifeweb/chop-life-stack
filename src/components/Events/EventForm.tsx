import { useState } from "react"
import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Calendar,
  Plus,
  MapPin,
  Image as ImageIcon,
  Settings,
  Users,
  Ticket as TicketIcon,
  Type as TypeIcon,
  Palette,
  AlignLeft,
  Info,
  Pencil,
  X,
  Trash2,
  CircleDot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormSection } from "./FormSection"
import { TicketDialog } from "./TicketDialog"
import { ColorPicker } from "./ColorPicker"
import { FontSelector } from "./FontSelector"
import { ImageUpload } from "./ImageUpload"
import { GalleryUpload } from "./GalleryUpload"
import { LocationPicker } from "./LocationPicker"
import type { EventFormData, EventPageSettings, TicketType } from "@/types/event"

interface EventFormProps {
  initialData?: Partial<EventFormData>
  onSubmit?: (data: EventFormData) => void
  onDelete?: () => void
  mode?: "create" | "edit"
  isSubmitting?: boolean
  isDeleting?: boolean
}

interface ValidationErrors {
  name?: string
  description?: string
  location?: string
  venueName?: string
  startDate?: string
  endDate?: string
}

const defaultFormData: EventFormData = {
  name: "",
  shortSummary: "",
  description: "",
  startDate: new Date(),
  endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  isRecurring: false,
  location: "",
  venueName: "",
  tickets: [{ id: "1", name: "Default Ticket", price: 10, quantity: 100 }],
  flyerImageUrl: "",
  galleryImages: [],
  youtubeVideoUrl: "",
  spotifySongUrl: "",
  titleFont: "Default",
  accentColor: "#ffffff",
  pageSettings: {
    isPublic: true,
    requirePassword: false,
    showActivityFeed: true,
    activityFeedMode: "social",
  },
  status: "published",
}

export function EventForm({ initialData, onSubmit, onDelete, mode = "create", isSubmitting = false, isDeleting = false }: EventFormProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    ...defaultFormData,
    ...initialData,
  })

  const [showDescription, setShowDescription] = useState(!!initialData?.description)
  const [showSummary, setShowSummary] = useState(!!initialData?.shortSummary)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  // Section visibility states
  const [sectionVisibility, setSectionVisibility] = useState({
    imageGallery: true,
  })

  const toggleSectionVisibility = (section: keyof typeof sectionVisibility) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Dialog states
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null)

  const updateFormData = <K extends keyof EventFormData>(
    key: K,
    value: EventFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updatePageSettings = <K extends keyof EventPageSettings>(
    key: K,
    value: EventPageSettings[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      pageSettings: { ...prev.pageSettings, [key]: value },
    }))
  }

  const getTimezoneAbbr = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    // Format timezone name: "America/Los_Angeles" -> "Los Angeles"
    const cityName = timezone.split("/").pop()?.replace(/_/g, " ") || timezone

    const tzAbbr = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value || ""

    return `${cityName} (${tzAbbr})`
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newEndDate = new Date(date.getTime() + 2 * 60 * 60 * 1000)

      // Always update end date to be 2 hours after start if current end is before or equal to new start
      if (formData.endDate <= date) {
        setFormData((prev) => ({
          ...prev,
          startDate: date,
          endDate: newEndDate,
        }))
      } else {
        updateFormData("startDate", date)
      }
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // Ensure end date is always after start date (not equal)
      if (date <= formData.startDate) {
        // Set end date to 1 hour after start date if user tries to set it before or equal
        const minEndDate = new Date(formData.startDate.getTime() + 60 * 60 * 1000)
        updateFormData("endDate", minEndDate)
      } else {
        updateFormData("endDate", date)
      }
    }
  }

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Event title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Event description is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }

    if (!formData.venueName.trim()) {
      newErrors.venueName = "Venue name is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    } else if (formData.endDate <= formData.startDate) {
      newErrors.endDate = "End date must be after start date"
    }

    return newErrors
  }

  const handleSubmit = () => {
    setHasAttemptedSubmit(true)
    const validationErrors = validateForm()
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit?.(formData)
    }
  }

  // Ticket handlers
  const openAddTicketDialog = () => {
    setEditingTicket(null)
    setTicketDialogOpen(true)
  }

  const openEditTicketDialog = (ticket: TicketType) => {
    setEditingTicket(ticket)
    setTicketDialogOpen(true)
  }

  const handleSaveTicket = (ticketData: TicketType) => {
    if (editingTicket) {
      const updatedTickets = formData.tickets.map((t) =>
        t.id === editingTicket.id ? ticketData : t
      )
      updateFormData("tickets", updatedTickets)
    } else {
      updateFormData("tickets", [...formData.tickets, ticketData])
    }
  }

  const deleteTicket = (ticketId: string) => {
    const updatedTickets = formData.tickets.filter((t) => t.id !== ticketId)
    updateFormData("tickets", updatedTickets)
  }

  return (
    <div className="event-form-page">
      {/* Back Button */}
      <div className="event-form__back-header">
        <Link to="/events" className="event-form__back-btn">
          <ArrowLeft size={20} />
          <span>Back to Events</span>
        </Link>
      </div>

      <div className="event-form">
        {/* Left Column - Main Form */}
        <div className="event-form__main">
          {/* Event Name */}
          <div className="event-form__field">
            <input
              type="text"
              placeholder="My Event Name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              className={`event-form__name-input ${hasAttemptedSubmit && errors.name ? "event-form__name-input--error" : ""}`}
            />
            {hasAttemptedSubmit && errors.name && (
              <span className="event-form__error">{errors.name}</span>
            )}
          </div>

          {/* Short Summary */}
          {showSummary ? (
            <div className="event-form__summary-input-wrapper">
              <Input
                type="text"
                placeholder="Enter a short summary..."
                value={formData.shortSummary || ""}
                onChange={(e) => updateFormData("shortSummary", e.target.value)}
                className="event-form__summary-input"
              />
              <button
                type="button"
                className="event-form__summary-close"
                onClick={() => {
                  setShowSummary(false)
                  updateFormData("shortSummary", "")
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="event-form__summary-btn"
              onClick={() => setShowSummary(true)}
            >
              <Plus size={14} />
              Short Summary
            </button>
          )}

          {/* Dates Section */}
          <FormSection title="Dates" icon={<Calendar size={18} />}>
            <div className="event-form__dates-card">
              {/* Start Date */}
              <div className="event-form__datetime-row">
                <span className="event-form__datetime-label">Start</span>
                <div className="event-form__datetime-controls">
                  <span className="event-form__timezone-badge">{getTimezoneAbbr()}</span>
                  <DateTimePicker
                    value={formData.startDate}
                    onChange={handleStartDateChange}
                    placeholder="Select start date & time"
                    dateFormat="EEE, MMM d"
                    className="event-form__datetime-picker"
                    minDate={new Date()}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="event-form__datetime-row">
                <span className="event-form__datetime-label event-form__datetime-label--with-info">
                  End
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      When does your event end? Leave blank for open-ended events.
                    </TooltipContent>
                  </Tooltip>
                </span>
                <div className="event-form__datetime-controls">
                  <span className="event-form__timezone-badge">{getTimezoneAbbr()}</span>
                  <DateTimePicker
                    value={formData.endDate}
                    onChange={handleEndDateChange}
                    placeholder="Select end date & time"
                    dateFormat="EEE, MMM d"
                    className="event-form__datetime-picker"
                    minDate={formData.startDate}
                  />
                </div>
              </div>

              {/* Recurring */}
              <div className="event-form__recurring-row">
                <div className="event-form__recurring-label">
                  <AlignLeft size={16} className="rotate-90 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase tracking-tight">
                    Recurring Series
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateFormData("isRecurring", !formData.isRecurring)}
                  className={`event-form__toggle ${formData.isRecurring ? "event-form__toggle--active" : ""}`}
                >
                  {!formData.isRecurring && (
                    <span className="event-form__toggle-label">No</span>
                  )}
                  <span className="event-form__toggle-knob" />
                </button>
              </div>
            </div>
          </FormSection>

          {/* Event Details */}
          <FormSection title="Event Details" icon={<Users size={18} />}>
            <div className="flex flex-col gap-3">
              {showDescription || hasAttemptedSubmit ? (
                <div className="event-form__field">
                  <textarea
                    placeholder="Describe your event..."
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    className={`event-form__description-textarea ${hasAttemptedSubmit && errors.description ? "event-form__description-textarea--error" : ""}`}
                    rows={4}
                  />
                  {hasAttemptedSubmit && errors.description && (
                    <span className="event-form__error">{errors.description}</span>
                  )}
                </div>
              ) : (
                <div
                  className="event-form__detail-row"
                  onClick={() => setShowDescription(true)}
                >
                  <Pencil size={16} className="text-muted-foreground" />
                  <span>Add Description</span>
                </div>
              )}
              <div className="event-form__field">
                <div className={`event-form__detail-row event-form__detail-row--input ${hasAttemptedSubmit && errors.venueName ? "event-form__detail-row--error" : ""}`}>
                  <span className="text-muted-foreground text-lg font-bold">+</span>
                  <Input
                    placeholder="Venue Name"
                    value={formData.venueName}
                    onChange={(e) => updateFormData("venueName", e.target.value)}
                    className="event-form__detail-input"
                  />
                </div>
                {hasAttemptedSubmit && errors.venueName && (
                  <span className="event-form__error">{errors.venueName}</span>
                )}
              </div>
            </div>
          </FormSection>

          {/* Location Picker */}
          <FormSection title="Location" icon={<MapPin size={18} />}>
            <LocationPicker
              location={formData.location}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(location) => updateFormData("location", location)}
              onCoordinatesChange={(lat, lng) => {
                updateFormData("latitude", lat)
                updateFormData("longitude", lng)
              }}
            />
            {hasAttemptedSubmit && errors.location && (
              <span className="event-form__error">{errors.location}</span>
            )}
          </FormSection>

          {/* Tickets Section */}
          <FormSection
            title="Tickets"
            icon={<TicketIcon size={18} />}
          >
            {formData.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="event-form__ticket-item"
                onClick={() => openEditTicketDialog(ticket)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openEditTicketDialog(ticket)}
              >
                <div className="event-form__ticket-info">
                  <span className="event-form__ticket-name">{ticket.name}</span>
                  <span className="event-form__ticket-price">
                    ${ticket.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="event-form__ticket-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTicket(ticket.id)
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                  <Pencil size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
            <div className="flex justify-center py-4">
              <button
                type="button"
                className="event-form__add-btn"
                onClick={openAddTicketDialog}
              >
                <Plus size={24} />
              </button>
            </div>
          </FormSection>

          {/* Event Features - Commented out for now
          <FormSection title="Event Features" icon={<Star size={18} />} infoIcon eyeIcon>
            <div className="event-form__features-empty">
              <span className="text-sm text-muted-foreground">
                No event features added yet.
              </span>
              <Button variant="outline" size="sm">
                Add Feature
              </Button>
            </div>
          </FormSection>
          */}

          {/* Image Gallery */}
          <FormSection
            title="Image Gallery"
            icon={<ImageIcon size={18} />}
            infoIcon
            eyeIcon
            isVisible={sectionVisibility.imageGallery}
            onToggleVisibility={() => toggleSectionVisibility("imageGallery")}
          >
            <GalleryUpload
              existingImages={formData.existingGalleryImages || []}
              newImageUrls={formData.galleryImages}
              newFiles={formData.galleryFiles || []}
              onChange={(existingImages, newImageUrls, newFiles) => {
                updateFormData("existingGalleryImages", existingImages)
                updateFormData("galleryImages", newImageUrls)
                updateFormData("galleryFiles", newFiles)
              }}
              maxImages={5}
            />
          </FormSection>

          {/* Event Status */}
          <FormSection title="Event Status" icon={<CircleDot size={18} />}>
            <div className="event-form__status-selector">
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData("status", value as EventFormData["status"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  {mode === "edit" && (
                    <>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </FormSection>

          {/* Page Settings */}
          <FormSection title="Page Settings" icon={<Settings size={18} />}>
            <div className="event-form__settings-card">
              {/* Show on Explore */}
              <div className="event-form__setting-item">
                <div className="event-form__setting-label">
                  <span>Show on Explore</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Make your event discoverable on the public explore page
                    </TooltipContent>
                  </Tooltip>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePageSettings("isPublic", !formData.pageSettings.isPublic)
                  }
                  className={`event-form__toggle ${formData.pageSettings.isPublic ? "event-form__toggle--active" : ""}`}
                >
                  <span className="event-form__toggle-knob" />
                </button>
              </div>

              {/* Password Protected */}
              <div className="event-form__setting-item">
                <div className="event-form__setting-label">
                  <span>Password Protected Event</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Require a password to view your event page
                    </TooltipContent>
                  </Tooltip>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updatePageSettings(
                      "requirePassword",
                      !formData.pageSettings.requirePassword
                    )
                  }
                  className={`event-form__toggle ${formData.pageSettings.requirePassword ? "event-form__toggle--active" : ""}`}
                >
                  <span className="event-form__toggle-knob" />
                </button>
              </div>

            </div>
          </FormSection>
        </div>

        {/* Right Column - Sidebar */}
        <div className="event-form__sidebar">
          {/* Flyer Upload */}
          <div className="event-form__flyer-section">
            <ImageUpload
              value={formData.flyerImageUrl}
              onChange={(url, file) => {
                updateFormData("flyerImageUrl", url)
                if (file) {
                  updateFormData("flyerFile", file)
                }
              }}
              onRemove={() => {
                updateFormData("flyerImageUrl", "")
                updateFormData("flyerFile", undefined)
              }}
              placeholder="Upload your flyer"
            />
          </div>

          {/* Design Config */}
          <div className="flex flex-col gap-2">
            <div className="event-form__style-row">
              <div className="event-form__style-label">
                <TypeIcon size={14} className="text-muted-foreground" />
                <span className="text-xs font-semibold uppercase">Title Font</span>
              </div>
              <FontSelector
                value={formData.titleFont}
                onChange={(value) => updateFormData("titleFont", value)}
              />
            </div>
            <div className="event-form__style-row">
              <div className="event-form__style-label">
                <Palette size={14} className="text-muted-foreground" />
                <span className="text-xs font-semibold uppercase">Accent Color</span>
              </div>
              <ColorPicker
                value={formData.accentColor}
                onChange={(color) => updateFormData("accentColor", color)}
              />
            </div>
            {/* Create Button */}
            <Button
              variant="outline"
              className="event-form__submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : (mode === "edit" ? "Save Event" : "Create Event")}
            </Button>

            {/* Delete Button - Only in edit mode */}
            {mode === "edit" && onDelete && (
              <Button
                variant="destructive"
                className="event-form__delete-btn w-full"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete Event"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="event-form__mobile-footer">
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (mode === "edit" ? "Saving..." : "Creating...") : (mode === "edit" ? "Save Event" : "Create Event")}
        </Button>
      </div>

      {/* Ticket Dialog */}
      <TicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        ticket={editingTicket}
        onSave={handleSaveTicket}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
              All associated tickets, images, and data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.()
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EventForm
